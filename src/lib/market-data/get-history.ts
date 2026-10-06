import "server-only";
import type { Asset } from "@prisma/client";
import { marketDataRegistry } from "./registry";
import type { PriceBar } from "./types";

export const CHART_PERIODS = ["1d", "1w", "1m", "3m", "6m", "1y", "5y"] as const;
export type ChartPeriod = (typeof CHART_PERIODS)[number];

const PERIOD_DAYS: Record<ChartPeriod, number> = {
  "1d": 5, // TCMB has no intraday data; show the last few daily closes instead.
  "1w": 7,
  "1m": 30,
  "3m": 90,
  "6m": 182,
  "1y": 365,
  "5y": 1825,
};

export function isChartPeriod(value: string): value is ChartPeriod {
  return (CHART_PERIODS as readonly string[]).includes(value);
}

/**
 * Fetches a chart-ready history range for an asset, through the same
 * Redis-cached provider path everything else in `market-data` uses. `to` is
 * rounded down to the current day (not `now()` with a live timestamp) so
 * repeated requests within the same day hit the same cache-aside key
 * instead of missing on every call.
 */
export async function getAssetHistory(asset: Asset, period: ChartPeriod): Promise<PriceBar[]> {
  const to = new Date();
  to.setUTCHours(0, 0, 0, 0);
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - PERIOD_DAYS[period]);

  const provider = marketDataRegistry.getProvider(asset.type);
  try {
    return await provider.getHistoricalPrices(asset.symbol, "DAY_1", from, to);
  } catch {
    // A provider that hasn't implemented history (throws by default) is
    // equivalent to "no chart data available" — never surface a stack trace.
    return [];
  }
}
