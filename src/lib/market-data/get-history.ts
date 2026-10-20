import "server-only";
import type { Asset } from "@prisma/client";
import { marketDataRegistry } from "./registry";
import { generateManualPriceHistory } from "./manual-simulation";
import type { PriceBar, PriceInterval } from "./types";

export const CHART_PERIODS = ["1d", "1w", "1m", "3m", "6m", "1y", "5y"] as const;
export type ChartPeriod = (typeof CHART_PERIODS)[number];

const PERIOD_DAYS: Record<ChartPeriod, number> = {
  "1d": 5, // intraday-only providers have no "today only" data; show the last few days instead.
  "1w": 7,
  "1m": 30,
  "3m": 90,
  "6m": 182,
  "1y": 365,
  "5y": 1825,
};

// A short period gets fine-grained candles instead of the same daily bar every other period
// also shows — matches how a real exchange's 1-day/1-week view looks. Manual/custom assets
// have no real granularity limit (the history is synthesized, not fetched) so they use this
// too; real providers get it on a best-effort basis (see PROVIDER_INTERVAL_SUPPORTED below).
const PERIOD_INTERVAL: Record<ChartPeriod, PriceInterval> = {
  "1d": "MIN_5",
  "1w": "MIN_30",
  "1m": "HOUR_1",
  "3m": "DAY_1",
  "6m": "DAY_1",
  "1y": "DAY_1",
  "5y": "WEEK_1",
};

export function isChartPeriod(value: string): value is ChartPeriod {
  return (CHART_PERIODS as readonly string[]).includes(value);
}

/** Replaces the last bar's close (and widens its high/low to fit) with the live quote price,
 * so the chart's rightmost point always agrees with the price shown next to it — the two are
 * fetched separately (history vs. quote) and can otherwise disagree by however stale the
 * provider's last historical bar is. */
function patchLastBarToPrice(bars: PriceBar[], price: number | null): PriceBar[] {
  if (price == null || bars.length === 0) return bars;
  const last = bars[bars.length - 1];
  if (last.close === price) return bars;
  return [
    ...bars.slice(0, -1),
    { ...last, close: price, high: Math.max(last.high, price), low: Math.min(last.low, price) },
  ];
}

/**
 * Fetches a chart-ready history range for an asset, through the same
 * Redis-cached provider path everything else in `market-data` uses. `to` is
 * rounded down to the current day (not `now()` with a live timestamp) so
 * repeated requests within the same day hit the same cache-aside key
 * instead of missing on every call.
 */
export async function getAssetHistory(asset: Asset, period: ChartPeriod): Promise<PriceBar[]> {
  const interval = PERIOD_INTERVAL[period];

  if (asset.manualOverrideEnabled && asset.manualBasePrice != null && asset.manualBandPercent != null) {
    // Synthesized, not fetched — free to use the exact current moment as the right edge
    // instead of rounding down to midnight, so short periods reach all the way to "now".
    const to = new Date();
    const from = new Date(to);
    from.setUTCDate(from.getUTCDate() - PERIOD_DAYS[period]);
    const bars = generateManualPriceHistory(
      asset.id,
      asset.type,
      Number(asset.manualBasePrice),
      Number(asset.manualBandPercent),
      from,
      to,
      interval
    );
    return patchLastBarToPrice(bars, asset.manualPrice != null ? Number(asset.manualPrice) : null);
  }

  const to = new Date();
  to.setUTCHours(0, 0, 0, 0);
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - PERIOD_DAYS[period]);

  const provider = marketDataRegistry.getProvider(asset.type);
  try {
    const [bars, quote] = await Promise.all([
      provider.getHistoricalPrices(asset.symbol, interval, from, to),
      provider.getQuote(asset.symbol),
    ]);
    return patchLastBarToPrice(bars, quote?.lastPrice ?? null);
  } catch {
    // A provider that hasn't implemented history (throws by default) is
    // equivalent to "no chart data available" — never surface a stack trace.
    return [];
  }
}
