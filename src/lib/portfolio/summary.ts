import "server-only";
import { prisma } from "@/lib/prisma/client";
import { resolveAssetPrice } from "@/lib/market-data/resolve-price";
import { Decimal, profitLoss } from "@/lib/money/decimal";
import type { Asset, AssetType } from "@prisma/client";
import type { DataProvenance } from "@/lib/market-data/types";

export interface HoldingRow {
  id: string;
  asset: Asset;
  quantity: Decimal;
  averageCost: Decimal;
  currentPrice: Decimal;
  marketValue: Decimal;
  pnl: { absolute: Decimal; percent: Decimal };
  provenance: DataProvenance;
}

export interface PortfolioSummary {
  cash: Decimal;
  investments: Decimal;
  totalValue: Decimal;
  totalPnl: Decimal;
  holdings: HoldingRow[];
  allocation: Partial<Record<AssetType, Decimal>>;
}

/**
 * Single source of truth for "what is this user's portfolio worth right now" —
 * shared by the dashboard hero, the full portfolio page, and (later) any
 * admin view of a user's holdings. Reuses resolveAssetPrice so a holding's
 * value always agrees with the live/delayed/cached price shown elsewhere.
 */
export async function getPortfolioSummary(userId: string): Promise<PortfolioSummary> {
  const [wallet, portfolio] = await Promise.all([
    prisma.wallet.findUnique({ where: { userId } }),
    prisma.portfolio.findUnique({
      where: { userId },
      include: { holdings: { include: { asset: true } } },
    }),
  ]);

  const cash = wallet ? new Decimal(wallet.cashBalance.toString()) : new Decimal(0);

  const holdings: HoldingRow[] = await Promise.all(
    (portfolio?.holdings ?? []).map(async (holding) => {
      const resolved = await resolveAssetPrice(holding.asset);
      const quantity = new Decimal(holding.quantity.toString());
      const averageCost = new Decimal(holding.averageCost.toString());
      const currentPrice = resolved.price != null ? new Decimal(resolved.price) : averageCost;
      const value = quantity.times(currentPrice);
      const pnl = profitLoss(quantity, averageCost, currentPrice);
      return {
        id: holding.id,
        asset: holding.asset,
        quantity,
        averageCost,
        currentPrice,
        marketValue: value,
        pnl,
        provenance: resolved.provenance,
      };
    })
  );

  const investments = holdings.reduce((acc, r) => acc.plus(r.marketValue), new Decimal(0));
  const totalValue = cash.plus(investments);
  const totalPnl = holdings.reduce((acc, r) => acc.plus(r.pnl.absolute), new Decimal(0));

  const allocation: Partial<Record<AssetType, Decimal>> = {};
  for (const row of holdings) {
    const key = row.asset.type;
    allocation[key] = (allocation[key] ?? new Decimal(0)).plus(row.marketValue);
  }

  return { cash, investments, totalValue, totalPnl, holdings, allocation };
}
