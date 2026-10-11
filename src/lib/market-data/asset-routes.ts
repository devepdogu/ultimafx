import type { AssetType } from "@prisma/client";

const BASE_PATHS: Partial<Record<AssetType, string>> = {
  CURRENCY: "/piyasalar/doviz",
  COMMODITY: "/piyasalar/altin",
  INDEX: "/piyasalar/borsa",
  STOCK: "/piyasalar/borsa",
  US_STOCK: "/piyasalar/nasdaq",
  CRYPTO: "/piyasalar/kripto",
};

/** Returns the detail-route base path for an asset type, or null if no route exists yet for it. */
export function getAssetBasePath(type: AssetType): string | null {
  return BASE_PATHS[type] ?? null;
}
