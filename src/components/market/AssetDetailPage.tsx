import { notFound } from "next/navigation";
import { ArrowDownRight, ArrowLeft, ArrowUpRight, BarChart3, Star } from "lucide-react";
import { prisma } from "@/lib/prisma/client";
import { resolveAssetPrice } from "@/lib/market-data/resolve-price";
import { getCurrentUser } from "@/lib/auth/rbac";
import { Link } from "@/i18n/navigation";
import { isAssetFavorited } from "@/lib/watchlist/actions";
import { FavoriteButton } from "@/components/market/FavoriteButton";
import { DataStatusBadge } from "@/components/ui/DataStatusBadge";
import { AssetIcon } from "@/components/market/AssetIcon";
import { PriceChart } from "@/components/market/PriceChart";
import { formatChangePercent, formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { AssetType } from "@prisma/client";

interface AssetDetailPageProps {
  symbol: string;
  /** Which asset types this route may resolve (e.g. the Borsa route serves both the INDEX and individual STOCK rows). */
  assetTypes: AssetType[];
}

const compact = new Intl.NumberFormat("tr-TR", { notation: "compact", maximumFractionDigits: 1 });

export async function AssetDetailPage({ symbol, assetTypes }: AssetDetailPageProps) {
  const asset = await prisma.asset.findUnique({ where: { symbol: symbol.toUpperCase() } });
  if (!asset || !assetTypes.includes(asset.type)) notFound();
  // Tradability is the asset's own DB flag, never a route-level guess — an
  // index like XU100 has no real "buy the index" product, individual
  // equities and FX/gold do, and this stays correct automatically as new
  // asset types/rows are added instead of needing a route-by-route prop.
  const tradable = asset.tradingEnabled;

  const [resolved, user] = await Promise.all([resolveAssetPrice(asset), getCurrentUser()]);
  const isFavorite = user ? await isAssetFavorited(user.id, asset.id) : false;

  const isNegative = resolved.changePercent != null && resolved.changePercent < 0;
  const spread = resolved.bid != null && resolved.ask != null ? resolved.ask - resolved.bid : null;
  const { high, low, price } = resolved;
  const rangePosition =
    high != null && low != null && price != null && high > low
      ? Math.min(100, Math.max(0, ((price - low) / (high - low)) * 100))
      : null;
  const decimals = asset.decimalPrecision;
  const basePath = "/piyasalar";

  return (
    <div className="flex flex-col gap-4 pb-28">
      <div className="sticky top-0 z-30 flex items-center gap-3 bg-background px-4 pb-2 pt-3">
          <>
            <Link href={basePath} aria-label="Geri" className="shrink-0 text-foreground">
              <ArrowLeft size={22} />
            </Link>
            <AssetIcon symbol={asset.symbol} type={asset.type} logoUrl={asset.logoUrl} size={40} />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[18px] font-bold leading-6 text-foreground">{asset.symbol}</h1>
              <div className="truncate text-[12px] leading-4 text-muted">{asset.name}</div>
            </div>
          </>
        {user ? (
          <FavoriteButton assetId={asset.id} initialFavorite={isFavorite} />
        ) : (
          <Link href="/giris" aria-label="Favorilere ekle" className="shrink-0 text-muted">
            <Star size={22} />
          </Link>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4">
        <span className="num-tabular text-[22px] font-extrabold leading-7 text-foreground">{formatPrice(resolved.price, asset.currency)}</span>
        {resolved.provenance === "LIVE" && <span className="h-2 w-2 animate-pulse rounded-full bg-positive" />}
        <span
          className={cn(
            "num-tabular inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-semibold",
            isNegative ? "bg-[#FF4976]/[0.13] text-[#FF4976]" : "bg-[#00A651]/[0.13] text-[#00A651]"
          )}
        >
          {isNegative ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}
          {resolved.change != null ? formatPrice(Math.abs(resolved.change), asset.currency) : "—"} (
          {formatChangePercent(resolved.changePercent)})
        </span>
        <DataStatusBadge provenance={resolved.provenance} />
      </div>

      {(resolved.bid != null || resolved.ask != null) && (
        <div className="flex gap-2 px-4">
          <div className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl border border-border bg-surface py-2.5">
            <div className="text-[11px] text-muted">ALIŞ (Bid)</div>
            <div className="num-tabular text-[16px] font-bold text-[#FF4976]">{formatPrice(resolved.bid, asset.currency)}</div>
          </div>
          <div className="flex w-20 shrink-0 flex-col items-center justify-center gap-1">
            <div className="text-[10px] text-muted">Spread</div>
            <div className="num-tabular text-[12px] font-semibold text-foreground">
              {spread != null ? spread.toFixed(decimals) : "—"}
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl border border-border bg-surface py-2.5">
            <div className="text-[11px] text-muted">SATIŞ (Ask)</div>
            <div className="num-tabular text-[16px] font-bold text-[#00A651]">{formatPrice(resolved.ask, asset.currency)}</div>
          </div>
        </div>
      )}

      <div className="px-4">
        <div className="overflow-hidden rounded-sm border border-border bg-surface">
          <PriceChart symbol={asset.symbol} volume={resolved.volume} />
        </div>
      </div>

      {rangePosition != null && high != null && low != null && (
        <div className="px-4">
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold uppercase text-muted">Gün içi aralık</span>
              <span className="num-tabular text-[14px] font-bold text-foreground">{rangePosition.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className={cn("h-full rounded-full", isNegative ? "bg-[#FF4976]" : "bg-[#00A651]")}
                style={{ width: `${rangePosition}%` }}
              />
            </div>
            <div className="num-tabular flex justify-between text-[12px] font-semibold">
              <span className="text-[#FF4976]">D: {formatPrice(low, asset.currency)}</span>
              <span className="text-[#00A651]">Y: {formatPrice(high, asset.currency)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="px-4">
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3 text-[15px] font-semibold text-foreground">
            <BarChart3 size={16} className="text-muted" />
            Fiyat İstatistikleri
          </div>
          <div className="grid grid-cols-3 border-l border-t border-border">
            <Cell label="Açılış" value={formatPrice(resolved.open, asset.currency)} />
            <Cell label="Önceki" value={formatPrice(resolved.previousClose, asset.currency)} />
            <Cell label="Değişim ₺" value={resolved.change != null ? `${resolved.change > 0 ? "+" : ""}${resolved.change.toFixed(decimals)}` : "—"} tone={isNegative ? "negative" : "positive"} />
            <Cell label="24S Yüksek" value={formatPrice(resolved.high, asset.currency)} tone="positive" />
            <Cell label="24S Düşük" value={formatPrice(resolved.low, asset.currency)} tone="negative" />
            <Cell label="Hacim" value={resolved.volume != null ? compact.format(resolved.volume) : "—"} />
          </div>
        </div>
      </div>

      {tradable && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2.5 border-t border-border bg-background px-3 pb-2 pt-2.5 shadow-[0_-4px_14px_0_#0000002e]">
          <Link
            href={user ? `/emirler?symbol=${encodeURIComponent(asset.symbol)}&side=SELL` : "/giris"}
            className="flex h-auto flex-1 flex-col items-center justify-center rounded-md bg-[#FF4976] py-2.5 text-white"
          >
            <span className="text-[14px] font-extrabold">SAT</span>
            <span className="num-tabular text-[15px] font-extrabold">{formatPrice(resolved.bid ?? resolved.price, asset.currency)}</span>
          </Link>
          <Link
            href={user ? `/emirler?symbol=${encodeURIComponent(asset.symbol)}&side=BUY` : "/giris"}
            className="flex h-auto flex-1 flex-col items-center justify-center rounded-md bg-[#00A651] py-2.5 text-white"
          >
            <span className="text-[14px] font-extrabold">AL</span>
            <span className="num-tabular text-[15px] font-extrabold">{formatPrice(resolved.ask ?? resolved.price, asset.currency)}</span>
          </Link>
        </div>
      )}
    </div>
  );
}

function Cell({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 border-b border-r border-border px-3 py-2.5">
      <span className="whitespace-nowrap text-[10px] font-semibold uppercase text-muted">{label}</span>
      <span
        className={cn(
          "num-tabular truncate text-[15px] font-bold text-foreground",
          tone === "positive" && "text-[#00A651]",
          tone === "negative" && "text-[#FF4976]"
        )}
      >
        {value}
      </span>
    </div>
  );
}
