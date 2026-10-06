import { getTranslations } from "next-intl/server";
import { Star } from "lucide-react";
import { prisma } from "@/lib/prisma/client";
import { resolveAssetPrice } from "@/lib/market-data/resolve-price";
import { getAssetBasePath } from "@/lib/market-data/asset-routes";
import { Card } from "@/components/ui/Card";
import { DataStatusBadge } from "@/components/ui/DataStatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { AssetIcon } from "@/components/market/AssetIcon";
import { Link } from "@/i18n/navigation";
import { formatChangePercent, formatPrice } from "@/lib/utils/format";

export async function WatchlistSection({ userId }: { userId: string }) {
  const t = await getTranslations("watchlist");

  const watchlist = await prisma.watchlist.findFirst({
    where: { userId },
    orderBy: { position: "asc" },
    include: { items: { include: { asset: true }, orderBy: { position: "asc" } } },
  });

  if (!watchlist || watchlist.items.length === 0) {
    return <EmptyState icon={Star} title={t("empty")} />;
  }

  const rows = await Promise.all(
    watchlist.items.map(async (item) => ({
      item,
      resolved: await resolveAssetPrice(item.asset),
    }))
  );

  return (
    <div className="flex flex-col divide-y divide-border">
      {rows.map(({ item, resolved }) => {
        const basePath = getAssetBasePath(item.asset.type);
        const isNegative = resolved.changePercent != null && resolved.changePercent < 0;
        const row = (
          <div className="flex items-center gap-3 py-2.5">
            <AssetIcon symbol={item.asset.symbol} type={item.asset.type} logoUrl={item.asset.logoUrl} size={30} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{item.asset.symbol}</div>
              <div className="truncate text-xs text-muted">{item.asset.name}</div>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="num-tabular text-sm font-semibold">
                {formatPrice(resolved.price, item.asset.currency)}
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`num-tabular text-xs font-semibold ${isNegative ? "text-negative" : "text-positive"}`}
                >
                  {formatChangePercent(resolved.changePercent)}
                </span>
                <DataStatusBadge provenance={resolved.provenance} />
              </div>
            </div>
          </div>
        );
        return basePath ? (
          <Link key={item.id} href={`${basePath}/${item.asset.symbol}`} className="-mx-1 px-1 hover:bg-surface-2">
            {row}
          </Link>
        ) : (
          <div key={item.id}>{row}</div>
        );
      })}
    </div>
  );
}

export async function WatchlistCard({ userId }: { userId: string }) {
  const t = await getTranslations("watchlist");
  return (
    <Card>
      <h2 className="mb-1 text-sm font-semibold">{t("title")}</h2>
      <WatchlistSection userId={userId} />
    </Card>
  );
}
