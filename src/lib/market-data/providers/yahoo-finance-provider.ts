import { UnimplementedProviderBase } from "./unimplemented-provider-base";
import type { AssetMeta, MarketSummary, PriceBar, PriceInterval, Quote } from "../types";

/**
 * Base adapter for Yahoo Finance's public chart endpoint
 * (`query1.finance.yahoo.com/v8/finance/chart/{SYMBOL}`).
 *
 * This is unofficial (no published ToS for programmatic access) but it is a
 * plain JSON endpoint — no scraping of rendered HTML, no session/auth token
 * forgery, no CAPTCHA bypass. The only thing standing between a bare request
 * and a 200 is a realistic browser `User-Agent` header; curl's default UA
 * gets an immediate 429, a normal browser UA does not.
 *
 * Every value is honestly DELAYED: Yahoo does not contractually guarantee
 * real-time ticks, so this never claims LIVE. A 429/5xx/network failure
 * resolves to UNAVAILABLE (falling back to the last known good value via the
 * shared withCache wrapper), never a thrown error and never an invented price.
 *
 * Subclasses only need to supply `id`, `name`, and how a local symbol maps to
 * Yahoo's symbol format (BIST needs a ".IS" suffix, US stocks need none).
 */
export abstract class YahooFinanceProvider extends UnimplementedProviderBase {
  private static readonly UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

  protected abstract yahooSymbol(symbol: string): string;

  private async fetchChart(symbol: string, range: string, interval: string) {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${this.yahooSymbol(symbol)}?interval=${interval}&range=${range}`;
    const res = await fetch(url, {
      headers: { "User-Agent": YahooFinanceProvider.UA, Accept: "application/json" },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    return result ?? null;
  }

  async getQuote(symbol: string): Promise<Quote | null> {
    try {
      const result = await this.fetchChart(symbol, "5d", "1d");
      const meta = result?.meta;
      if (!meta || meta.regularMarketPrice == null) {
        return {
          symbol,
          lastPrice: null,
          previousClose: null,
          change: null,
          changePercent: null,
          open: null,
          high: null,
          low: null,
          volume: null,
          turnover: null,
          bid: null,
          ask: null,
          bidSize: null,
          askSize: null,
          timestamp: new Date().toISOString(),
          marketStatus: "CLOSED",
          dataSource: this.name,
          provenance: "UNAVAILABLE",
          isDelayed: true,
        };
      }

      const lastPrice: number = meta.regularMarketPrice;
      const dailyCloses: (number | null)[] = result?.indicators?.quote?.[0]?.close ?? [];
      const dailyOpens: (number | null)[] = result?.indicators?.quote?.[0]?.open ?? [];
      const lastValid = (arr: (number | null)[]) => [...arr].reverse().find((v) => v != null) ?? null;
      const previousCloseFromBars =
        dailyCloses.filter((v) => v != null).length >= 2
          ? (dailyCloses.filter((v) => v != null) as number[]).at(-2) ?? null
          : null;
      const previousClose: number | null = meta.regularMarketPreviousClose ?? previousCloseFromBars;
      const sessionOpen = lastValid(dailyOpens);
      const change = previousClose != null ? lastPrice - previousClose : null;
      const changePercent =
        meta.regularMarketChangePercent ??
        (previousClose != null && previousClose !== 0 ? (change! / previousClose) * 100 : null);

      return {
        symbol,
        lastPrice,
        previousClose,
        change,
        changePercent,
        open: sessionOpen,
        high: meta.regularMarketDayHigh ?? null,
        low: meta.regularMarketDayLow ?? null,
        volume: meta.regularMarketVolume ?? null,
        turnover: null,
        bid: null,
        ask: null,
        bidSize: null,
        askSize: null,
        timestamp: meta.regularMarketTime
          ? new Date(meta.regularMarketTime * 1000).toISOString()
          : new Date().toISOString(),
        marketStatus: "CLOSED",
        dataSource: this.name,
        provenance: "DELAYED",
        isDelayed: true,
      };
    } catch {
      return {
        symbol,
        lastPrice: null,
        previousClose: null,
        change: null,
        changePercent: null,
        open: null,
        high: null,
        low: null,
        volume: null,
        turnover: null,
        bid: null,
        ask: null,
        bidSize: null,
        askSize: null,
        timestamp: new Date().toISOString(),
        marketStatus: "CLOSED",
        dataSource: this.name,
        provenance: "UNAVAILABLE",
        isDelayed: true,
      };
    }
  }

  async getQuotes(symbols: string[]): Promise<Quote[]> {
    const results = await Promise.all(symbols.map((s) => this.getQuote(s)));
    return results.filter((q): q is Quote => q !== null);
  }

  /** Our interval -> Yahoo's own `interval` query param. */
  private static readonly YAHOO_INTERVAL: Record<PriceInterval, string> = {
    MIN_1: "1m",
    MIN_5: "5m",
    MIN_15: "15m",
    MIN_30: "30m",
    HOUR_1: "60m",
    DAY_1: "1d",
    WEEK_1: "1wk",
    MONTH_1: "1mo",
  };

  /** Yahoo only accepts a fixed set of `range` tokens, and limits how far back intraday
   * granularities go (~7d for 1m, ~60d for 5m-60m) — picks the smallest token that both covers
   * the requested span and respects that limit; results are clipped to [from, to] afterward. */
  private static pickRange(yahooInterval: string, days: number): string {
    if (yahooInterval === "1m") return "5d"; // Yahoo caps 1m history at ~7 days regardless
    if (["5m", "15m", "30m", "60m"].includes(yahooInterval)) {
      return days <= 5 ? "5d" : days <= 31 ? "1mo" : "3mo"; // ~60d cap on intraday beyond 1m
    }
    return days <= 31 ? "1mo" : days <= 93 ? "3mo" : days <= 186 ? "6mo" : days <= 366 ? "1y" : days <= 731 ? "2y" : "5y";
  }

  async getHistoricalPrices(symbol: string, interval: PriceInterval, from: Date, to: Date): Promise<PriceBar[]> {
    const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000));
    const yahooInterval = YahooFinanceProvider.YAHOO_INTERVAL[interval];
    const range = YahooFinanceProvider.pickRange(yahooInterval, days);

    try {
      const result = await this.fetchChart(symbol, range, yahooInterval);
      if (!result?.timestamp || !result?.indicators?.quote?.[0]) return [];

      const { timestamp } = result;
      const q = result.indicators.quote[0];
      const fromMs = from.getTime();
      const toMs = to.getTime();
      const bars: PriceBar[] = [];
      for (let i = 0; i < timestamp.length; i++) {
        const close = q.close?.[i];
        if (close == null) continue;
        const ms = timestamp[i] * 1000;
        if (ms < fromMs || ms > toMs) continue; // Yahoo's range token covers more than asked
        bars.push({
          timestamp: new Date(ms).toISOString(),
          open: q.open?.[i] ?? close,
          high: q.high?.[i] ?? close,
          low: q.low?.[i] ?? close,
          close,
          volume: q.volume?.[i] ?? null,
        });
      }
      return bars;
    } catch {
      return [];
    }
  }

  async getMarketStatus(marketCode: string): Promise<MarketSummary | null> {
    return { code: marketCode, name: marketCode, status: "CLOSED", asOf: new Date().toISOString() };
  }

  async getAssets(): Promise<AssetMeta[]> {
    return [];
  }

  async healthCheck() {
    const start = Date.now();
    try {
      const result = await this.fetchChart(this.healthCheckSymbol, "5d", "1d");
      const latencyMs = Date.now() - start;
      if (!result) return { status: "DEGRADED" as const, latencyMs, message: "Empty response" };
      return { status: "HEALTHY" as const, latencyMs };
    } catch (err) {
      return {
        status: "OFFLINE" as const,
        latencyMs: Date.now() - start,
        message: err instanceof Error ? err.message : String(err),
      };
    }
  }

  protected abstract readonly healthCheckSymbol: string;
}
