"use client";

import { ArrowDownLeft, ArrowUpRight, LineChart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { AssetIcon } from "@/components/market/AssetIcon";
import type { WalletAssetRow, WalletOrderRow } from "@/components/wallet/WalletView";
import { getAssetBasePath } from "@/lib/market-data/asset-routes";
import { cn } from "@/lib/utils/cn";
import { formatChangePercent, formatDateTime, formatPrice } from "@/lib/utils/format";

const UP = "#00A651";
const DOWN = "#FF4976";
const money = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Two-decimal money text; holdings math produces more decimals than a price shows. */
const money2 = (value: number, currency = "TRY") => formatPrice(Math.round(value * 100) / 100, currency);

/** Converts a native-currency amount to TRY so USD holdings can be added to TRY totals. */
export function toTry(value: number, currency: string, usdTry: number | null) {
  return currency === "USD" ? value * (usdTry ?? 0) : value;
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "positive" | "negative" }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-surface-2 p-3.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</span>
      <span className={cn("num-tabular text-[15px] font-bold text-foreground", tone === "positive" && "text-positive", tone === "negative" && "text-negative")}>
        {value}
      </span>
      {sub && <span className="num-tabular text-[11px] text-muted">{sub}</span>}
    </div>
  );
}

/** Where the current price sits between the entry price and the price band around it. */
function PriceScale({ entry, current, currency }: { entry: number; current: number; currency: string }) {
  const lo = Math.min(entry, current);
  const hi = Math.max(entry, current);
  const pad = Math.max((hi - lo) * 0.4, hi * 0.02);
  const min = Math.max(0, lo - pad);
  const max = hi + pad;
  const at = (v: number) => ((v - min) / (max - min)) * 100;
  const up = current >= entry;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-6">
        <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-surface-3" />
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full"
          style={{ left: `${at(lo)}%`, width: `${at(hi) - at(lo)}%`, background: up ? UP : DOWN }}
        />
        <span className="absolute top-1/2 h-5 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground" style={{ left: `${at(entry)}%` }} />
        <span
          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-surface"
          style={{ left: `${at(current)}%`, background: up ? UP : DOWN }}
        />
      </div>
      <div className="flex items-start justify-between text-[12px]">
        <div className="flex flex-col">
          <span className="text-muted">Giriş fiyatı</span>
          <span className="num-tabular font-semibold text-foreground">{money2(entry, currency)}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-muted">Güncel fiyat</span>
          <span className={cn("num-tabular font-semibold", up ? "text-positive" : "text-negative")}>{money2(current, currency)}</span>
        </div>
      </div>
    </div>
  );
}

export function PositionDetail({
  asset,
  trades,
  totalValue,
  usdTry,
}: {
  asset: WalletAssetRow;
  trades: WalletOrderRow[];
  totalValue: number;
  usdTry: number | null;
}) {
  const up = asset.pnl >= 0;
  const tone = asset.currentPrice == null ? undefined : up ? "positive" : "negative";
  const valueTry = asset.marketValue != null ? toTry(asset.marketValue, asset.currency, usdTry) : null;
  const share = valueTry != null && totalValue > 0 ? (valueTry / totalValue) * 100 : null;
  const history = trades.filter((t) => t.symbol === asset.symbol).slice(0, 5);
  // USD holdings: the average price in TL at today's rate (the rate paid at purchase is not stored).
  const tlOf = (v: number) => (asset.currency === "USD" && usdTry ? `≈ ${money2(v * usdTry)} · güncel kur` : undefined);
  const base = getAssetBasePath(asset.type);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <AssetIcon symbol={asset.symbol} type={asset.type} logoUrl={asset.logoUrl} size={48} />
        <div className="min-w-0 flex-1">
          <div className="text-[16px] font-bold text-foreground">{asset.symbol}</div>
          <div className="truncate text-[12px] text-muted">{asset.name}</div>
        </div>
      </div>

      <div className="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-4">
        <span className="text-[12px] text-muted">Güncel değer</span>
        <span className="num-tabular text-[26px] font-extrabold text-foreground">
          {asset.marketValue != null ? money2(asset.marketValue, asset.currency) : "—"}
        </span>
        {tlOf(asset.averageCost) && <span className="num-tabular text-[12px] text-muted">Ortalama fiyat {tlOf(asset.averageCost)}</span>}
        <div className="mt-1 flex items-center gap-2">
          <span className={cn("num-tabular text-[15px] font-bold", tone === "positive" && "text-positive", tone === "negative" && "text-negative")}>
            {asset.currentPrice == null ? "—" : `${up ? "+" : ""}${money2(asset.pnl, asset.currency)}`}
          </span>
          <span className={cn("num-tabular rounded-full px-2 py-0.5 text-[12px] font-semibold", up ? "bg-positive-bg text-positive" : "bg-negative-bg text-negative")}>
            {asset.pnlPercent != null && asset.currentPrice != null ? formatChangePercent(asset.pnlPercent) : "—"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-muted">Fiyat karşılaştırması</span>
        {asset.currentPrice != null ? (
          <PriceScale entry={asset.averageCost} current={asset.currentPrice} currency={asset.currency} />
        ) : (
          <p className="text-[13px] text-muted">Güncel fiyat alınamadığı için karşılaştırma gösterilemiyor.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Stat label="Adet" value={String(asset.quantity)} />
        <Stat label="Giriş fiyatı" value={money2(asset.averageCost, asset.currency)} />
        <Stat label="Portföy payı" value={share != null ? `%${money.format(share)}` : "—"} />
      </div>

      {share != null && (
        <div className="flex flex-col gap-2">
          <div className="h-2 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(100, share)}%` }} />
          </div>
          <span className="text-[12px] text-muted">Toplam portföyünüzün %{money.format(share)} kadarı bu varlıkta.</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-muted">Son işlemler</span>
        {history.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-4 text-center text-[13px] text-muted">Bu varlıkta henüz işleminiz yok.</p>
        ) : (
          history.map((t) => {
            const buy = t.side === "BUY";
            return (
              <div key={t.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5">
                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", buy ? "bg-positive-bg text-positive" : "bg-negative-bg text-negative")}>
                  {buy ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-foreground">
                    {buy ? "Alış" : "Satış"} · {t.quantity} adet
                  </div>
                  <div className="text-[11px] text-muted">{formatDateTime(t.date)}</div>
                </div>
                <span className="num-tabular text-[13px] font-semibold text-foreground">
                  {t.price != null ? money2(t.price, asset.currency) : "—"}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {base && (
          <Link href={`${base}/${asset.symbol}`} className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-surface-2 text-[13px] font-semibold text-foreground">
            <LineChart size={16} /> Grafik
          </Link>
        )}
        <Link href={`/emirler?symbol=${encodeURIComponent(asset.symbol)}&side=SELL`} className="flex h-11 items-center justify-center rounded-2xl bg-negative-bg text-[13px] font-bold text-negative">
          Sat
        </Link>
      </div>
    </div>
  );
}

/** K/Z overview: the portfolio's total result and where it comes from, holding by holding. */
export function PnlOverview({
  assets,
  totalValue,
  totalPnl,
  totalPnlPercent,
  cash,
  usdBalance,
  usdTry,
  onSelect,
}: {
  assets: WalletAssetRow[];
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number | null;
  cash: number;
  usdBalance: number;
  usdTry: number | null;
  onSelect: (asset: WalletAssetRow) => void;
}) {
  const up = totalPnl >= 0;
  const cost = assets.reduce((acc, a) => acc + toTry(a.cost, a.currency, usdTry), 0);
  const ranked = [...assets].filter((a) => a.currentPrice != null).sort((x, y) => toTry(y.pnl, y.currency, usdTry) - toTry(x.pnl, x.currency, usdTry));
  const biggest = Math.max(1, ...ranked.map((a) => Math.abs(toTry(a.pnl, a.currency, usdTry))));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 rounded-2xl bg-surface-2 p-5">
        <span className="text-[12px] text-muted">Toplam kâr / zarar</span>
        <span className={cn("num-tabular text-[28px] font-extrabold", up ? "text-positive" : "text-negative")}>
          {up ? "+" : ""}
          {money2(totalPnl)}
        </span>
        <span className={cn("num-tabular text-[13px] font-semibold", up ? "text-positive" : "text-negative")}>
          {totalPnlPercent != null ? formatChangePercent(totalPnlPercent) : "—"} · maliyete göre
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Stat label="Toplam değer" value={money2(totalValue)} />
        <Stat label="Toplam maliyet" value={money2(cost)} />
        <Stat label="TL nakit" value={money2(cash)} />
        <Stat label="USD nakit" value={`$${money.format(usdBalance)}`} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-muted">Varlıklara göre</span>
        {ranked.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-4 text-center text-[13px] text-muted">Henüz K/Z hesaplanacak bir varlığınız yok.</p>
        ) : (
          ranked.map((a) => {
            const pos = a.pnl >= 0;
            const width = (Math.abs(toTry(a.pnl, a.currency, usdTry)) / biggest) * 100;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => onSelect(a)}
                className="flex flex-col gap-2.5 rounded-2xl border border-border bg-surface p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <AssetIcon symbol={a.symbol} type={a.type} logoUrl={a.logoUrl} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-bold text-foreground">{a.symbol}</div>
                    <div className="num-tabular text-[11px] text-muted">
                      {a.quantity} adet · giriş {money2(a.averageCost, a.currency)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn("num-tabular text-[14px] font-bold", pos ? "text-positive" : "text-negative")}>
                      {pos ? "+" : ""}
                      {money2(a.pnl, a.currency)}
                    </div>
                    <div className={cn("num-tabular text-[11px] font-semibold", pos ? "text-positive" : "text-negative")}>
                      {a.pnlPercent != null ? formatChangePercent(a.pnlPercent) : "—"}
                    </div>
                  </div>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full" style={{ width: `${width}%`, background: pos ? UP : DOWN }} />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
