import Decimal from "decimal.js";

// All money/price/quantity arithmetic must go through Decimal, never native
// `number` math (JS floats cannot represent most decimal fractions exactly,
// which is unacceptable for balances and P/L). See section 39.
Decimal.set({ precision: 34, rounding: Decimal.ROUND_HALF_UP });

export { Decimal };

export function toDecimal(value: Decimal.Value): Decimal {
  return new Decimal(value);
}

export function sum(values: Decimal.Value[]): Decimal {
  return values.reduce<Decimal>((acc, v) => acc.plus(v), new Decimal(0));
}

/** quantity * price, rounded to the asset's display precision. */
export function marketValue(
  quantity: Decimal.Value,
  price: Decimal.Value,
  decimalPrecision = 2
): Decimal {
  return toDecimal(quantity).times(price).toDecimalPlaces(decimalPrecision);
}

/** (current - cost) as both absolute and percent change. */
export function profitLoss(
  quantity: Decimal.Value,
  averageCost: Decimal.Value,
  currentPrice: Decimal.Value
) {
  const qty = toDecimal(quantity);
  const cost = qty.times(averageCost);
  const value = qty.times(currentPrice);
  const absolute = value.minus(cost);
  const percent = cost.isZero() ? new Decimal(0) : absolute.dividedBy(cost).times(100);
  return { absolute, percent };
}
