import type { AssetType } from "@prisma/client";
import type { DataProvenance } from "@/lib/market-data/types";
import type { HoldingRow } from "@/lib/portfolio/summary";

export interface HoldingViewModel {
  id: string;
  symbol: string;
  name: string;
  type: AssetType;
  currency: string;
  logoUrl: string | null;
  quantity: string;
  averageCost: number;
  currentPrice: number;
  marketValue: number;
  pnlAbsolute: number;
  pnlPercent: number;
  provenance: DataProvenance;
}

export function toHoldingViewModel(row: HoldingRow): HoldingViewModel {
  return {
    id: row.id,
    symbol: row.asset.symbol,
    name: row.asset.name,
    type: row.asset.type,
    currency: row.asset.currency,
    logoUrl: row.asset.logoUrl,
    quantity: row.quantity.toString(),
    averageCost: row.averageCost.toNumber(),
    currentPrice: row.currentPrice.toNumber(),
    marketValue: row.marketValue.toNumber(),
    pnlAbsolute: row.pnl.absolute.toNumber(),
    pnlPercent: row.pnl.percent.toNumber(),
    provenance: row.provenance,
  };
}
