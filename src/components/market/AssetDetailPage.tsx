import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/prisma/client";
import { resolveAssetPrice } from "@/lib/market-data/resolve-price";
import { getCurrentUser } from "@/lib/auth/rbac";
import { isAssetFavorited } from "@/lib/watchlist/actions";
import { Card } from "@/components/ui/Card";
import { BackButton } from "@/components/ui/BackButton";
import { DataStatusBadge } from "@/components/ui/DataStatusBadge";
import { AssetIcon } from "@/components/market/AssetIcon";
import { FavoriteButton } from "@/components/market/FavoriteButton";
import { TradeSheet } from "@/components/trading/TradeSheet";
import { PriceChart } from "@/components/market/PriceChart";
import { formatChangePercent, formatDateTime, formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { AssetType } from "@prisma/client";

interface AssetDetailPageProps {
  symbol: string;
  /** Which asset types this route may resolve (e.g. the Borsa route serves both the INDEX and individual STOCK rows). */
  assetTypes: AssetType[];
}

export async function AssetDetailPage({ symbol, assetTypes }: AssetDetailPageProps) {
  const asset = await prisma.asset.findUnique({ where: { symbol: symbol.toUpperCase() } });
  if (!asset || !assetTypes.includes(asset.type)) notFound();
  // Tradability is the asset's own DB flag, never a route-level guess — an
  // index like XU100 has no real "buy the index" product, individual
  // equities and FX/gold do, and this stays correct automatically as new
  // asset types/rows are added instead of needing a route-by-route prop.
  const tradable = asset.tradingEnabled;

  const [resolved, t, tMarkets, tAuth, user] = await Promise.all([
    resolveAssetPrice(asset),
    getTranslations("asset"),
    getTranslations("markets"),
    getTranslations("auth"),
    getCurrentUser(),
  ]);

  const isFavorite = user ? await isAssetFavorited(user.id, asset.id) : false;

  let availableBalance = 0;
  let heldQuantity = 0;
  if (user && tradable) {
    const [wallet, portfolio] = await Promise.all([
      prisma.wallet.findUnique({ where: { userId: user.id } }),
      prisma.portfolio.findUnique({
        where: { userId: user.id },
        include: { holdings: { where: { assetId: asset.id } } },
      }),
    ]);
    availableBalance = wallet ? Number(wallet.cashBalance) : 0;
    heldQuantity = portfolio?.holdings[0] ? Number(portfolio.holdings[0].quantity) : 0;
  }

  const isNegative = resolved.changePercent != null && resolved.changePercent < 0;
  const spread = resolved.bid != null && resolved.ask != null ? resolved.ask - resolved.bid : null;

  return (
    <div className=" px-4 py-6 pb-28">
      <div className="mb-2 flex items-center justify-between">
        <BackButton fallbackHref="/piyasalar" label={tMarkets("title")} />
        {user && <FavoriteButton assetId={asset.id} initialFavorite={isFavorite} />}
      </div>

      <div className="mb-4 flex items-center gap-3">
        <AssetIcon symbol={asset.symbol} type={asset.type} logoUrl={asset.logoUrl} size={40} />
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold">{asset.symbol}</h1>
          <div className="truncate text-xs text-muted">{asset.name}</div>
        </div>
      </div>

      <div className="mb-1 flex items-center gap-2">
        <span className="num-tabular figure-hero">{formatPrice(resolved.price, asset.currency)}</span>
        {resolved.provenance !== "UNAVAILABLE" && (
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              resolved.provenance === "LIVE" ? "animate-pulse bg-positive" : "bg-subtle"
            )}
          />
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold num-tabular",
            isNegative ? "bg-negative-bg text-negative" : "bg-positive-bg text-positive"
          )}
        >
          {isNegative ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}
          {resolved.change != null ? formatPrice(Math.abs(resolved.change), asset.currency) : "—"} (
          {formatChangePercent(resolved.changePercent)})
        </span>
        <DataStatusBadge provenance={resolved.provenance} />
        <span className="text-xs text-muted">{formatDateTime(resolved.timestamp)}</span>
      </div>

      {(resolved.bid != null || resolved.ask != null) && (
        <div className="mb-5 grid grid-cols-3 gap-2 text-center text-sm">
          <Card className="py-3">
            <div className="text-xs text-muted">{t("bid")}</div>
            <div className="num-tabular font-semibold text-negative">
              {formatPrice(resolved.bid, asset.currency)}
            </div>
          </Card>
          <Card className="flex flex-col items-center justify-center py-3">
            <div className="text-xs text-muted">Spread</div>
            <div className="num-tabular font-semibold">
              {spread != null ? spread.toFixed(asset.decimalPrecision) : "—"}
            </div>
          </Card>
          <Card className="py-3">
            <div className="text-xs text-muted">{t("ask")}</div>
            <div className="num-tabular font-semibold text-positive">
              {formatPrice(resolved.ask, asset.currency)}
            </div>
          </Card>
        </div>
      )}

      <Card className="mb-6">
        <PriceChart symbol={asset.symbol} volume={resolved.volume} />
      </Card>

      {!tradable ? null : user ? (
        <TradeSheet
          assetId={asset.id}
          symbol={asset.symbol}
          name={asset.name}
          price={resolved.price}
          bid={resolved.bid}
          ask={resolved.ask}
          currency={asset.currency}
          availableBalance={availableBalance}
          heldQuantity={heldQuantity}
        />
      ) : (
        <p className="text-sm text-muted">{tAuth("loginToTrade")}</p>
      )}
    </div>
  );
}
