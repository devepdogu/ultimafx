import { BarChart3, Clock, LineChart } from "lucide-react";
import { prisma } from "@/lib/prisma/client";
import { resolveAssetPrices } from "@/lib/market-data/resolve-price";
import { AdminActionForm, AdminField, ADMIN_INPUT } from "@/components/admin/AdminForm";
import { AdminEmpty, AdminPageHeader, AdminPanel, AdminStatCard, StatusPill } from "@/components/admin/AdminUi";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminRecord, RecordActions } from "@/components/admin/AdminRecord";
import { AssetIcon } from "@/components/market/AssetIcon";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { DeleteButton } from "@/components/admin/DeleteButton";
import {
  adminCancelOrderAction,
  adminCloseHoldingAction,
  updateHoldingQuantityAction,
} from "@/lib/admin/user-actions";
import { adminCloseLeveragedPositionAction, adminEditLeveragedPositionAction } from "@/lib/admin/leverage-actions";
import { formatDateTime } from "@/lib/utils/format";
import type { AssetType } from "@prisma/client";

const money = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const qty = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 6 });

interface UserRef {
  id: string;
  name: string | null;
  phone: string | null;
}
function userLabel(u: UserRef) {
  return u.name ?? u.phone ?? "İsimsiz kullanıcı";
}

interface LeveragedRow {
  id: string;
  side: "BUY" | "SELL";
  quantity: number;
  entryPrice: number;
  leverage: number;
  contractSize: number;
  margin: number;
  currency: string;
  openedAt: Date;
  asset: { symbol: string; type: AssetType; logoUrl: string | null; currency: string; decimalPrecision: number };
  user: UserRef;
  currentPrice: number | null;
  pnl: number | null;
  pnlPercent: number | null;
}

interface SpotRow {
  id: string;
  quantity: number;
  averageCost: number;
  asset: { symbol: string; type: AssetType; logoUrl: string | null; currency: string; decimalPrecision: number };
  user: UserRef;
  currentPrice: number | null;
  marketValue: number | null;
  pnl: number | null;
  pnlPercent: number | null;
}

interface PendingOrderRow {
  id: string;
  side: "BUY" | "SELL";
  type: string;
  quantity: number;
  limitPrice: number | null;
  placedAt: Date;
  asset: { symbol: string; type: AssetType; logoUrl: string | null };
  user: UserRef;
}

export default async function AdminPositionsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const term = q.trim();

  const userFilter = term
    ? {
        OR: [
          { asset: { symbol: { contains: term.toUpperCase() } } },
          { user: { name: { contains: term, mode: "insensitive" as const } } },
          { user: { phone: { contains: term } } },
        ],
      }
    : {};

  const [leveraged, holdings, pendingOrders, leveragedCount, holdingsCount, pendingCount] = await Promise.all([
    prisma.leveragedPosition.findMany({
      where: { status: "OPEN", ...userFilter },
      include: { asset: true, user: { select: { id: true, name: true, phone: true } } },
      orderBy: { openedAt: "desc" },
      take: 200,
    }),
    prisma.holding.findMany({
      where: {
        quantity: { gt: 0 },
        ...(term
          ? {
              OR: [
                { asset: { symbol: { contains: term.toUpperCase() } } },
                { portfolio: { user: { name: { contains: term, mode: "insensitive" } } } },
                { portfolio: { user: { phone: { contains: term } } } },
              ],
            }
          : {}),
      },
      include: { asset: true, portfolio: { include: { user: { select: { id: true, name: true, phone: true } } } } },
      orderBy: { updatedAt: "desc" },
      take: 200,
    }),
    prisma.order.findMany({
      where: { status: { in: ["PENDING", "OPEN"] }, ...userFilter },
      include: { asset: true, user: { select: { id: true, name: true, phone: true } } },
      orderBy: { placedAt: "desc" },
      take: 200,
    }),
    prisma.leveragedPosition.count({ where: { status: "OPEN" } }),
    prisma.holding.count({ where: { quantity: { gt: 0 } } }),
    prisma.order.count({ where: { status: { in: ["PENDING", "OPEN"] } } }),
  ]);

  const distinctAssets = [
    ...new Map([...leveraged.map((p) => p.asset), ...holdings.map((h) => h.asset)].map((a) => [a.id, a])).values(),
  ];
  const resolved = await resolveAssetPrices(distinctAssets);
  const priceByAssetId = new Map(distinctAssets.map((a, i) => [a.id, resolved[i].price]));

  const leveragedRows: LeveragedRow[] = leveraged.map((p) => {
    const currentPrice = priceByAssetId.get(p.asset.id) ?? null;
    const entryPrice = Number(p.entryPrice);
    const quantity = Number(p.quantity);
    const contractSize = Number(p.contractSize);
    const margin = Number(p.margin);
    const pnl =
      currentPrice != null
        ? (p.side === "BUY" ? currentPrice - entryPrice : entryPrice - currentPrice) * quantity * contractSize
        : null;
    const pnlPercent = pnl != null && margin > 0 ? (pnl / margin) * 100 : null;
    return { id: p.id, side: p.side, quantity, entryPrice, leverage: p.leverage, contractSize, margin, currency: p.currency, openedAt: p.openedAt, asset: p.asset, user: p.user, currentPrice, pnl, pnlPercent };
  });

  const spotRows: SpotRow[] = holdings.map((h) => {
    const currentPrice = priceByAssetId.get(h.asset.id) ?? null;
    const quantity = Number(h.quantity);
    const averageCost = Number(h.averageCost);
    const marketValue = currentPrice != null ? currentPrice * quantity : null;
    const cost = quantity * averageCost;
    const pnl = marketValue != null ? marketValue - cost : null;
    const pnlPercent = pnl != null && cost > 0 ? (pnl / cost) * 100 : null;
    return { id: h.id, quantity, averageCost, asset: h.asset, user: h.portfolio.user, currentPrice, marketValue, pnl, pnlPercent };
  });

  const pendingRows: PendingOrderRow[] = pendingOrders.map((o) => ({
    id: o.id,
    side: o.side,
    type: o.type,
    quantity: Number(o.quantity),
    limitPrice: o.limitPrice != null ? Number(o.limitPrice) : null,
    placedAt: o.placedAt,
    asset: o.asset,
    user: o.user,
  }));

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <AutoRefresh seconds={8} />
      <AdminPageHeader title="Emirler & Pozisyonlar" description="İşlem yönetimi — tüm kullanıcıların spot ve kaldıraçlı pozisyonları, bekleyen emirler. Hepsi buradan düzenlenebilir/kapatılabilir." />

      <div className="grid grid-cols-3 gap-3">
        <AdminStatCard icon={BarChart3} label="Spot" value={String(holdingsCount)} />
        <AdminStatCard icon={LineChart} label="Kaldıraçlı" value={String(leveragedCount)} />
        <AdminStatCard icon={Clock} label="Bekleyen" value={String(pendingCount)} />
      </div>

      <AdminFilters q={term} status="" basePath="/admin/pozisyonlar" searchPlaceholder="Sembol veya kullanıcı ara..." />

      <AdminPanel title={`Spot pozisyonlar (${spotRows.length})`} description="Gerçek alım/satım ile açılmış, kaldıraçsız pozisyonlar.">
        {spotRows.length === 0 ? (
          <AdminEmpty>Açık spot pozisyon yok.</AdminEmpty>
        ) : (
          <div className="flex flex-col gap-2">
            {spotRows.map((r) => (
              <SpotCard key={r.id} r={r} />
            ))}
          </div>
        )}
      </AdminPanel>

      <AdminPanel title={`Kaldıraçlı pozisyonlar (${leveragedRows.length})`} description="Teminatlı, kaldıraçlı pozisyonlar — periyodik olarak likidasyon için denetleniyor.">
        {leveragedRows.length === 0 ? (
          <AdminEmpty>Açık kaldıraçlı pozisyon yok.</AdminEmpty>
        ) : (
          <div className="flex flex-col gap-2">
            {leveragedRows.map((p) => (
              <LeveragedCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </AdminPanel>

      <AdminPanel title={`Bekleyen emirler (${pendingRows.length})`} description="Henüz gerçekleşmemiş limit emirleri.">
        {pendingRows.length === 0 ? (
          <AdminEmpty>Bekleyen emir yok.</AdminEmpty>
        ) : (
          <div className="flex flex-col gap-2">
            {pendingRows.map((o) => (
              <div key={o.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3.5">
                <AssetIcon symbol={o.asset.symbol} type={o.asset.type} logoUrl={o.asset.logoUrl} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white"
                      style={{ background: o.side === "BUY" ? "#00A651" : "#FF4976" }}
                    >
                      {o.side === "BUY" ? "ALIŞ" : "SATIŞ"}
                    </span>
                    <span className="text-[13px] font-bold">{o.asset.symbol}</span>
                    <span className="text-[12px] text-muted">
                      {o.type === "LIMIT" ? "Limit" : "Piyasa"} · {qty.format(o.quantity)} adet
                      {o.limitPrice != null && ` @ ${o.limitPrice}`}
                    </span>
                  </div>
                  <span className="truncate text-[11px] text-muted">
                    {userLabel(o.user)} · {formatDateTime(o.placedAt.toISOString())}
                  </span>
                </div>
                <DeleteButton label="İptal et" confirmText={`${o.asset.symbol} emri iptal edilecek. Emin misiniz?`} run={adminCancelOrderAction.bind(null, o.id)} />
              </div>
            ))}
          </div>
        )}
      </AdminPanel>

      <p className="text-center text-[11px] text-muted">Periyodik güncelleniyor (8sn)</p>
    </div>
  );
}

function SpotCard({ r }: { r: SpotRow }) {
  const pnlTone = r.pnl == null ? "text-muted" : r.pnl >= 0 ? "text-positive" : "text-negative";
  const decimals = r.asset.decimalPrecision;
  const price = (v: number | null) => (v == null ? "—" : v.toFixed(decimals));

  return (
    <AdminRecord
      summary={
        <div className="flex items-center gap-3">
          <AssetIcon symbol={r.asset.symbol} type={r.asset.type} logoUrl={r.asset.logoUrl} size={36} />
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[14px] font-bold">{r.asset.symbol}</span>
              <StatusPill tone="positive">AÇIK</StatusPill>
            </div>
            <span className="truncate text-[12px] text-muted">{userLabel(r.user)}</span>
          </div>
        </div>
      }
      actions={
        <RecordActions>
          <DeleteButton label="Pozisyonu kapat (sat)" confirmText={`${r.asset.symbol} pozisyonu güncel fiyattan satılarak kapatılacak. Emin misiniz?`} run={adminCloseHoldingAction.bind(null, r.id)} />
        </RecordActions>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Adet (lot)" value={qty.format(r.quantity)} />
          <Stat label="Ort. maliyet" value={price(r.averageCost)} />
          <Stat label="Güncel fiyat" value={price(r.currentPrice)} />
          <Stat label="Değer" value={r.marketValue != null ? `${money.format(r.marketValue)} ${r.asset.currency}` : "—"} />
          <Stat
            label="K/Z (PnL)"
            value={r.pnl != null ? `${r.pnl >= 0 ? "+" : ""}${money.format(r.pnl)} ${r.asset.currency}` : "—"}
            hint={r.pnlPercent != null ? `${r.pnlPercent >= 0 ? "+" : ""}${r.pnlPercent.toFixed(1)}%` : undefined}
            className={pnlTone}
          />
        </div>

        <details>
          <summary className="cursor-pointer text-[12px] font-bold text-brand">Elle düzelt (nakit hareket etmez)</summary>
          <div className="mt-3 border-t border-border pt-3">
            <AdminActionForm action={updateHoldingQuantityAction} submitLabel="Pozisyonu kaydet">
              <input type="hidden" name="holdingId" value={r.id} />
              <input type="hidden" name="userId" value={r.user.id} />
              <div className="grid gap-4 md:grid-cols-2">
                <AdminField label="Adet (lot)" hint="0 girilirse pozisyon kapatılır.">
                  <input name="quantity" type="number" step="0.000001" min="0" required defaultValue={r.quantity} className={ADMIN_INPUT} />
                </AdminField>
                <AdminField label={`Ortalama maliyet (${r.asset.currency})`}>
                  <input name="averageCost" type="number" step="0.000001" min="0" required defaultValue={r.averageCost} className={ADMIN_INPUT} />
                </AdminField>
              </div>
            </AdminActionForm>
          </div>
        </details>
      </div>
    </AdminRecord>
  );
}

function LeveragedCard({ p }: { p: LeveragedRow }) {
  const isUp = p.side === "BUY";
  const pnlTone = p.pnl == null ? "text-muted" : p.pnl >= 0 ? "text-positive" : "text-negative";
  const decimals = p.asset.decimalPrecision;
  const price = (v: number | null) => (v == null ? "—" : v.toFixed(decimals));

  return (
    <AdminRecord
      summary={
        <div className="flex items-center gap-3">
          <AssetIcon symbol={p.asset.symbol} type={p.asset.type} logoUrl={p.asset.logoUrl} size={36} />
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ background: isUp ? "#00A651" : "#FF4976" }}>
                {isUp ? "ALIŞ" : "SATIŞ"}
              </span>
              <span className="text-[14px] font-bold">{p.asset.symbol}</span>
              <StatusPill tone="positive">AÇIK</StatusPill>
            </div>
            <span className="truncate text-[12px] text-muted">{userLabel(p.user)}</span>
          </div>
        </div>
      }
      actions={
        <RecordActions>
          <DeleteButton
            label="Pozisyonu kapat"
            confirmText={`${p.asset.symbol} pozisyonu güncel fiyattan kapatılacak. Emin misiniz?`}
            run={adminCloseLeveragedPositionAction.bind(null, p.id)}
          />
        </RecordActions>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Giriş fiyatı" value={price(p.entryPrice)} />
          <Stat label="Güncel fiyat" value={price(p.currentPrice)} />
          <Stat label="Lot" value={p.quantity.toString()} />
          <Stat label="Teminat" value={`${money.format(p.margin)} ${p.currency}`} />
          <Stat
            label="K/Z (PnL)"
            value={p.pnl != null ? `${p.pnl >= 0 ? "+" : ""}${money.format(p.pnl)} ${p.currency}` : "—"}
            hint={p.pnlPercent != null ? `${p.pnlPercent >= 0 ? "+" : ""}${p.pnlPercent.toFixed(1)}%` : undefined}
            className={pnlTone}
          />
          <Stat label="Kaldıraç / Sözleşme büyüklüğü" value={`1:${p.leverage} / ${p.contractSize}`} />
          <Stat label="Tarih" value={formatDateTime(p.openedAt.toISOString())} />
        </div>

        <details>
          <summary className="cursor-pointer text-[12px] font-bold text-brand">Düzenle</summary>
          <div className="mt-3 border-t border-border pt-3">
            <AdminActionForm action={adminEditLeveragedPositionAction} submitLabel="Pozisyonu kaydet">
              <input type="hidden" name="positionId" value={p.id} />
              <div className="grid gap-4 md:grid-cols-3">
                <AdminField label="Lot">
                  <input name="quantity" type="number" step="0.000001" min="0.000001" required defaultValue={p.quantity} className={ADMIN_INPUT} />
                </AdminField>
                <AdminField label="Giriş fiyatı">
                  <input name="entryPrice" type="number" step="0.000001" min="0.000001" required defaultValue={p.entryPrice} className={ADMIN_INPUT} />
                </AdminField>
                <AdminField label="Kaldıraç" hint="1-10 arası">
                  <input name="leverage" type="number" step="1" min="1" max="10" required defaultValue={p.leverage} className={ADMIN_INPUT} />
                </AdminField>
              </div>
              <p className="text-[11px] text-muted">
                Teminat yeni değerlere göre yeniden hesaplanır ve farkı kullanıcının cüzdanından eklenir/çıkarılır.
              </p>
            </AdminActionForm>
          </div>
        </details>
      </div>
    </AdminRecord>
  );
}

function Stat({ label, value, hint, className }: { label: string; value: string; hint?: string; className?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-muted">{label}</span>
      <span className={`num-tabular text-[13px] font-bold text-foreground ${className ?? ""}`}>{value}</span>
      {hint && <span className={`num-tabular text-[11px] font-semibold ${className ?? "text-muted"}`}>{hint}</span>}
    </div>
  );
}
