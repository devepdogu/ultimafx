import "server-only";
import type { AssetType } from "@prisma/client";
import { isMarketOpenAt } from "./market-hours";
import type { PriceBar, PriceInterval } from "./types";

/**
 * Bounded random walk for admin-priced ("manual override") assets — there is
 * no external market for these, so the worker is the only thing that can
 * make the price look alive. The walk is always re-centered on
 * `manualBasePrice` and clamped to `manualBasePrice * (1 ± bandPercent/100)`,
 * so it can never drift outside the range the admin set. See section 25/26
 * and prisma/schema.prisma's Asset.manualBandPercent doc comment.
 */
export function nextManualPrice(current: number, basePrice: number, bandPercent: number): number {
  const band = basePrice * (bandPercent / 100);
  const min = basePrice - band;
  const max = basePrice + band;
  // Step size is a fraction of the band, not the base price, so a tight band
  // (e.g. ±1%) still visibly moves instead of taking hundreds of ticks to do so.
  const step = band * 0.15;
  const next = current + (Math.random() * 2 - 1) * step;
  return Math.min(max, Math.max(min, next));
}

/** mulberry32 — tiny deterministic PRNG so the same asset+bucket always renders the same value. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return h;
}

function hash01(key: string, bucket: number): number {
  return mulberry32(seedFromString(`${key}:${bucket}`))();
}

/** Smooth 1D value noise in [-1, 1] at a continuous position `t` — deterministic, so the
 * same (key, t) always yields the same value. */
function valueNoise(key: string, t: number): number {
  const i0 = Math.floor(t);
  const frac = t - i0;
  const v0 = hash01(key, i0) * 2 - 1;
  const v1 = hash01(key, i0 + 1) * 2 - 1;
  const f = frac * frac * frac * (frac * (frac * 6 - 15) + 10); // smootherstep
  return v0 + (v1 - v0) * f;
}

/**
 * Fractal (multi-octave) value noise, in roughly [-1, 1] — an asset's whole price "shape" is
 * one deterministic function of time. A short period doesn't get a different, unrelated
 * pattern; it reveals finer texture of the same curve a longer period shows coarsely, which is
 * also what keeps adjacent periods from ever looking identical to each other.
 */
function fractalOffset(assetId: string, days: number): number {
  let sum = 0;
  let amp = 0.55;
  let freq = 1;
  let norm = 0;
  for (let octave = 0; octave < 6; octave++) {
    sum += valueNoise(`${assetId}:o${octave}`, days * freq) * amp;
    norm += amp;
    amp *= 0.55;
    freq *= 3;
  }
  return Math.max(-1, Math.min(1, sum / norm));
}

export const INTERVAL_MINUTES: Record<PriceInterval, number> = {
  MIN_1: 1,
  MIN_5: 5,
  MIN_15: 15,
  MIN_30: 30,
  HOUR_1: 60,
  DAY_1: 60 * 24,
  WEEK_1: 60 * 24 * 7,
  MONTH_1: 60 * 24 * 30,
};

const MS_PER_DAY = 86_400_000;

/**
 * Synthesizes an OHLC history for a manual-override asset at the requested granularity
 * (interval), entirely within its band — never stored, just recomputed on request (same
 * architecture as every other asset's history: generated, not duplicated into Postgres — see
 * the note above the Asset model). `interval` controls how many candles come back for a given
 * [from, to] window — finer intervals for short periods (1 day, 1 week) so the chart isn't
 * just 1 candle per calendar day no matter how short the view. No bar is emitted for a moment
 * the asset's market (by `type`) was closed — a manual "stock" doesn't trade overnight or on
 * weekends any more than a real one would.
 */
export function generateManualPriceHistory(
  assetId: string,
  type: AssetType,
  basePrice: number,
  bandPercent: number,
  from: Date,
  to: Date,
  interval: PriceInterval
): PriceBar[] {
  const band = basePrice * (bandPercent / 100);
  const stepMs = INTERVAL_MINUTES[interval] * 60_000;
  const subStepsPerBar = 4; // sampled within each bar for a believable open/high/low/close

  const priceAt = (ms: number) => basePrice + fractalOffset(assetId, ms / MS_PER_DAY) * band;

  const bars: PriceBar[] = [];
  const startMs = Math.floor(from.getTime() / stepMs) * stepMs;
  const endMs = to.getTime();

  for (let barStart = startMs; barStart <= endMs; barStart += stepMs) {
    if (!isMarketOpenAt(type, new Date(barStart))) continue;
    const open = priceAt(barStart);
    let high = open;
    let low = open;
    let close = open;
    for (let i = 1; i <= subStepsPerBar; i++) {
      const v = priceAt(barStart + (stepMs * i) / subStepsPerBar);
      high = Math.max(high, v);
      low = Math.min(low, v);
      close = v;
    }
    bars.push({
      timestamp: new Date(barStart).toISOString(),
      open: Number(open.toFixed(6)),
      high: Number(high.toFixed(6)),
      low: Number(low.toFixed(6)),
      close: Number(close.toFixed(6)),
      volume: null,
    });
  }
  return bars;
}

export interface ManualDailyStats {
  open: number | null;
  high: number | null;
  low: number | null;
  previousClose: number | null;
  /** No real trade volume exists for a synthetic instrument — a stable, plausible-looking
   * placeholder (same figure all day, changes daily) rather than an honest "—", since there's
   * nothing to measure it against either way. */
  volume: number;
}

/**
 * Derives today's open/high/low and the last close before today from the same deterministic
 * curve the chart draws — real numbers *for this synthetic instrument*, not fabricated ones,
 * since they're read off the exact same price path everything else about this asset shows.
 */
export function getManualDailyStats(
  assetId: string,
  type: AssetType,
  basePrice: number,
  bandPercent: number,
  now: Date = new Date()
): ManualDailyStats {
  const todayStart = new Date(now);
  todayStart.setUTCHours(0, 0, 0, 0);
  const from = new Date(todayStart);
  from.setUTCDate(from.getUTCDate() - 7); // look back far enough to find a previous close across a weekend

  const bars = generateManualPriceHistory(assetId, type, basePrice, bandPercent, from, now, "MIN_30");
  const todayStartMs = todayStart.getTime();
  const todayBars = bars.filter((b) => new Date(b.timestamp).getTime() >= todayStartMs);
  const priorBars = bars.filter((b) => new Date(b.timestamp).getTime() < todayStartMs);

  const volume = Math.round(hash01(`${assetId}:volume`, Math.floor(now.getTime() / MS_PER_DAY)) * 490_000 + 10_000);

  return {
    open: todayBars[0]?.open ?? null,
    high: todayBars.length ? Math.max(...todayBars.map((b) => b.high)) : null,
    low: todayBars.length ? Math.min(...todayBars.map((b) => b.low)) : null,
    previousClose: priorBars.length ? priorBars[priorBars.length - 1].close : null,
    volume,
  };
}
