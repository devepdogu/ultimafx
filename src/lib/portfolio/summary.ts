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
  /** TRY cash. */
  cash: Decimal;
  /** USD cash; included in totalValue at the live USD/TRY rate. */
  usdCash: Decimal;
  /** Holdings valued in TRY (USD assets converted at the live rate). */
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
  const usdCash = wallet ? new Decimal(wallet.usdBalance.toString()) : new Decimal(0);

  // USD holdings and USD cash are converted at the live USD/TRY rate so every total is in TRY.
  const usdAsset = await prisma.asset.findUnique({ where: { symbol: "USDTRY" } });
  const usdRate = usdAsset ? (await resolveAssetPrice(usdAsset)).price : null;
  const toTry = (value: Decimal, currency: string) =>
    currency === "USD" ? value.times(usdRate ?? 0) : value;

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

  const investments = holdings.reduce((acc, r) => acc.plus(toTry(r.marketValue, r.asset.currency)), new Decimal(0));
  const totalValue = cash.plus(toTry(usdCash, "USD")).plus(investments);
  const totalPnl = holdings.reduce((acc, r) => acc.plus(toTry(r.pnl.absolute, r.asset.currency)), new Decimal(0));

  const allocation: Partial<Record<AssetType, Decimal>> = {};
  for (const row of holdings) {
    const key = row.asset.type;
    allocation[key] = (allocation[key] ?? new Decimal(0)).plus(toTry(row.marketValue, row.asset.currency));
  }

  return { cash, usdCash, investments, totalValue, totalPnl, holdings, allocation };
}
