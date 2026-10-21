import "server-only";
import type { AssetType } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";

export interface LeverageTerms {
  maxLeverage: number;
  contractSize: number;
  minLot: number;
  spreadPercent: number;
  longSwap: number;
  shortSwap: number;
}

/** Conservative fallback for an asset type an admin hasn't configured yet (shouldn't happen
 * once seeded — see prisma/seed.ts's LEVERAGE_CONFIGS — but never silently allows unlimited
 * leverage on an unconfigured class). */
const FALLBACK: LeverageTerms = { maxLeverage: 1, contractSize: 1, minLot: 0.01, spreadPercent: 0, longSwap: 0, shortSwap: 0 };

export async function getLeverageConfig(type: AssetType): Promise<LeverageTerms> {
  const row = await prisma.leverageConfig.findUnique({ where: { type } });
  if (!row) return FALLBACK;
  return {
    maxLeverage: row.maxLeverage,
    contractSize: Number(row.contractSize),
    minLot: Number(row.minLot),
    spreadPercent: Number(row.spreadPercent),
    longSwap: Number(row.longSwap),
    shortSwap: Number(row.shortSwap),
  };
}
