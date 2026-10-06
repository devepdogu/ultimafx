const round2 = (n: number) => Math.round(n * 100) / 100;

/** Simple interest over the actual days: principal × annual rate × days / 365, rounded to kuruş. */
export function computeTermInterest(principal: number, annualRatePct: number, termDays: number): number {
  return round2(principal * (annualRatePct / 100) * (termDays / 365));
}
