import { prisma } from "@/lib/prisma/client";
import { resolveAssetPrices } from "@/lib/market-data/resolve-price";
import { getAssetBasePath } from "@/lib/market-data/asset-routes";
import { HomeCategoryPanel, type CategoryKey, type HomeRow } from "@/components/dashboard/HomeCategoryPanel";
import type { AssetType } from "@prisma/client";

const CATEGORY_TYPES: Record<CategoryKey, AssetType[]> = {
  all: ["STOCK", "US_STOCK", "INDEX", "COMMODITY", "CURRENCY"],
  bist: ["STOCK"],
  nasdaq: ["US_STOCK"],
  emtia: ["COMMODITY"],
  endeks: ["INDEX"],
  parite: ["CURRENCY"],
  kripto: ["CRYPTO"],
};

const PER_CATEGORY = 30;

/** Loads every category once on the server; the client panel switches between them. */
export async function HomeCategoryList() {
  const types = [...new Set(Object.values(CATEGORY_TYPES).flat())];
  const assets = await prisma.asset.findMany({
    where: { type: { in: types }, isActive: true, visibility: "PUBLIC" },
    // Manual/custom assets (admin-priced house instruments) surface first within their
    // category — they have no real popularity signal to rank by, so "newest/house" wins.
    orderBy: [{ isCustom: "desc" }, { symbol: "asc" }],
  });
  const resolved = await resolveAssetPrices(assets);
  const rowById = new Map<string, HomeRow>(
    assets.map((a, i) => {
      const base = getAssetBasePath(a.type);
      return [
        a.id,
        {
          id: a.id,
          symbol: a.symbol,
          name: a.name,
          type: a.type,
          currency: a.currency,
          logoUrl: a.logoUrl,
          price: resolved[i].price,
          changePercent: resolved[i].changePercent,          change: resolved[i].change,
          provenance: resolved[i].provenance,
          href: base ? `${base}/${a.symbol}` : undefined,
        },
      ];
    })
  );

  const groups = Object.fromEntries(
    (Object.keys(CATEGORY_TYPES) as CategoryKey[]).map((key) => {
      const rows = assets
        .filter((a) => CATEGORY_TYPES[key].includes(a.type))
        .slice(0, PER_CATEGORY)
        .map((a) => rowById.get(a.id)!);
      return [key, rows];
    })
  ) as Record<CategoryKey, HomeRow[]>;

  return <HomeCategoryPanel groups={groups} />;
}
