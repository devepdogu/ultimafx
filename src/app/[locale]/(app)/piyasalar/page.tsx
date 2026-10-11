import { prisma } from "@/lib/prisma/client";
import { resolveAssetPrice } from "@/lib/market-data/resolve-price";
import { getCurrentUser } from "@/lib/auth/rbac";
import { MarketsExplorer, type StockRowData } from "@/components/market/MarketsExplorer";
import type { AssetRowData } from "@/components/market/AssetRow";
import type { AssetType } from "@prisma/client";

// Fixed editorial order — there's no real popularity metric to sort by
// honestly (no trade-volume-on-this-platform signal exists yet).
const POPULAR_ORDER = [
  "THYAO", "GARAN", "AKBNK", "YKBNK", "ISCTR", "ASELS", "SISE", "EREGL",
  "KCHOL", "SAHOL", "BIMAS", "TUPRS", "PGSUS", "TOASO", "FROTO", "TCELL",
  "TTKOM", "ARCLK", "ULKER", "MGROS",
];

function popularRank(symbol: string): number {
  const i = POPULAR_ORDER.indexOf(symbol);
  return i === -1 ? POPULAR_ORDER.length : i;
}

async function loadRows(assetType: AssetType): Promise<AssetRowData[]> {
  const assets = await prisma.asset.findMany({
    where: { type: assetType, isActive: true, visibility: "PUBLIC" },
    orderBy: { symbol: "asc" },
  });
  const resolved = await Promise.all(assets.map((a) => resolveAssetPrice(a)));
  return assets.map((asset, i) => ({
    id: asset.id,
    symbol: asset.symbol,
    name: asset.name,
    type: asset.type,
    currency: asset.currency,
    logoUrl: asset.logoUrl,
    price: resolved[i].price,
    changePercent: resolved[i].changePercent,
    change: resolved[i].change,
    provenance: resolved[i].provenance,
  }));
}

async function loadStockRows(): Promise<StockRowData[]> {
  const assets = await prisma.asset.findMany({
    where: { type: "STOCK", isActive: true, visibility: "PUBLIC" },
  });
  assets.sort((a, b) => popularRank(a.symbol) - popularRank(b.symbol) || a.symbol.localeCompare(b.symbol));
  const resolved = await Promise.all(assets.map((a) => resolveAssetPrice(a)));
  return assets.map((asset, i) => ({
    id: asset.id,
    symbol: asset.symbol,
    name: asset.name,
    type: asset.type,
    currency: asset.currency,
    logoUrl: asset.logoUrl,
    price: resolved[i].price,
    changePercent: resolved[i].changePercent,
    change: resolved[i].change,
    provenance: resolved[i].provenance,
    volume: resolved[i].volume,
  }));
}

export default async function MarketsPage() {
  const user = await getCurrentUser();

  const [bist, nasdaq, endeks, parite, emtia, kripto, favoriteItems] = await Promise.all([
    loadStockRows(),
    loadRows("US_STOCK"),
    loadRows("INDEX"),
    loadRows("CURRENCY"),
    loadRows("COMMODITY"),
    loadRows("CRYPTO"),
    user
      ? prisma.watchlistItem.findMany({ where: { watchlist: { userId: user.id } }, select: { assetId: true } })
      : Promise.resolve([]),
  ]);

  const favoriteIds = favoriteItems.map((i) => i.assetId);

  return (
    <div className="flex flex-col gap-4 pb-6">
      <MarketsExplorer
        bist={bist}
        nasdaq={nasdaq}
        emtia={emtia}
        endeks={endeks}
        parite={parite}
        kripto={kripto}
        favoriteIds={favoriteIds}
      />
    </div>
  );
}
