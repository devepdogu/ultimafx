import { BarChart3, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma/client";
import { resolveAssetPrices } from "@/lib/market-data/resolve-price";
import { AdminActionForm, AdminField, ADMIN_INPUT } from "@/components/admin/AdminForm";
import { AdminEmpty, AdminPageHeader, AdminStatCard, StatusPill } from "@/components/admin/AdminUi";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminRecord, RecordActions } from "@/components/admin/AdminRecord";
import { AssetIcon } from "@/components/market/AssetIcon";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { adminCloseLeveragedPositionAction, adminEditLeveragedPositionAction } from "@/lib/admin/leverage-actions";
import { formatDateTime } from "@/lib/utils/format";
import type { AssetType } from "@prisma/client";

const money = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface PositionRow {
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
  user: { id: string; name: string | null; phone: string | null };
  currentPrice: number | null;
  pnl: number | null;
  pnlPercent: number | null;
}

export default async function AdminPositionsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const term = q.trim();

  const [openPositions, pendingOrders, openCount] = await Promise.all([
    prisma.leveragedPosition.findMany({
      where: {
        status: "OPEN",
        ...(term
          ? {
              OR: [
                { asset: { symbol: { contains: term.toUpperCase() } } },
                { user: { name: { contains: term, mode: "insensitive" } } },
                { user: { phone: { contains: term } } },
              ],
            }
          : {}),
      },
      include: { asset: true, user: { select: { id: true, name: true, phone: true } } },
      orderBy: { openedAt: "desc" },
      take: 200,
    }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.leveragedPosition.count({ where: { status: "OPEN" } }),
  ]);

  const distinctAssets = [...new Map(openPositions.map((p) => [p.asset.id, p.asset])).values()];
  const resolved = await resolveAssetPrices(distinctAssets);
  const priceByAssetId = new Map(distinctAssets.map((a, i) => [a.id, resolved[i].price]));

  const rows: PositionRow[] = openPositions.map((p) => {
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
    return {
      id: p.id,
      side: p.side,
      quantity,
      entryPrice,
      leverage: p.leverage,
      contractSize,
      margin,
      currency: p.currency,
      openedAt: p.openedAt,
      asset: p.asset,
      user: p.user,
      currentPrice,
      pnl,
      pnlPercent,
    };
  });

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <AutoRefresh seconds={8} />
      <AdminPageHeader title="Emirler & pozisyonlar" description="İşlem yönetimi — açık kaldıraçlı pozisyonlar ve bekleyen emirler." />

      <div className="grid grid-cols-2 gap-3">
        <AdminStatCard icon={BarChart3} label="Açık" value={String(openCount)} />
        <AdminStatCard icon={Clock} label="Bekleyen" value={String(pendingOrders)} />
      </div>

      <AdminFilters q={term} status="" basePath="/admin/pozisyonlar" searchPlaceholder="Sembol veya kullanıcı ara..." />

      {rows.length === 0 ? (
        <AdminEmpty>Açık kaldıraçlı pozisyon yok.</AdminEmpty>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((p) => (
            <PositionCard key={p.id} p={p} />
          ))}
        </div>
      )}

      <p className="text-center text-[11px] text-muted">Periyodik güncelleniyor (8sn)</p>
    </div>
  );
}

function PositionCard({ p }: { p: PositionRow }) {
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
            <span className="truncate text-[12px] text-muted">{p.user.name ?? p.user.phone ?? "İsimsiz kullanıcı"}</span>
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
