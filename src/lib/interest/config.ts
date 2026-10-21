import "server-only";
import { prisma } from "@/lib/prisma/client";

const DEFAULT_ID = "default";

export interface InterestConfigView {
  tryAnnualRate: number;
  usdAnnualRate: number;
  autoDistribute: boolean;
  earlyWithdrawalPenaltyPercent: number;
}

/** Single-row interest config, created on first read so the app always has a value (same
 * pattern as site/settings.ts). Base annual rates every TermDepositProduct's own rate derives
 * from — see recomputeTermProductRates(). */
export async function getInterestConfig(): Promise<InterestConfigView> {
  const row = await prisma.interestConfig.upsert({
    where: { id: DEFAULT_ID },
    update: {},
    create: { id: DEFAULT_ID },
  });
  return {
    tryAnnualRate: Number(row.tryAnnualRate),
    usdAnnualRate: Number(row.usdAnnualRate),
    autoDistribute: row.autoDistribute,
    earlyWithdrawalPenaltyPercent: Number(row.earlyWithdrawalPenaltyPercent),
  };
}

function baseRateFor(config: InterestConfigView, currency: string): number {
  return currency === "USD" ? config.usdAnnualRate : config.tryAnnualRate;
}

/** Recomputes every TermDepositProduct's stored annualRate as baseRate(currency) × its own
 * rateMultiplier — called after the base rates change (updateInterestConfigAction) or after a
 * single product's multiplier/currency changes (saveTermProductAction). Never touches
 * TermDepositAccount rows: those snapshot the rate at open time and must stay as opened. */
export async function recomputeTermProductRates(): Promise<void> {
  const config = await getInterestConfig();
  const products = await prisma.termDepositProduct.findMany({ select: { id: true, currency: true, rateMultiplier: true } });
  await Promise.all(
    products.map((p) =>
      prisma.termDepositProduct.update({
        where: { id: p.id },
        data: { annualRate: (baseRateFor(config, p.currency) * Number(p.rateMultiplier)).toFixed(4) },
      })
    )
  );
}
