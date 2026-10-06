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
      const previousClose: number | null = meta.regularMarketPreviousClose ?? null;
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
        open: null,
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

  /** Maps a (interval, from, to) request onto the closest Yahoo `range` bucket — Yahoo
   * only accepts a fixed set of range tokens, not arbitrary date bounds. */
  async getHistoricalPrices(
    symbol: string,
    _interval: PriceInterval,
    from: Date,
    to: Date
  ): Promise<PriceBar[]> {
    const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000));
    const range =
      days <= 7 ? "5d" : days <= 31 ? "1mo" : days <= 93 ? "3mo" : days <= 186 ? "6mo" : days <= 366 ? "1y" : "5y";

    try {
      const result = await this.fetchChart(symbol, range, "1d");
      if (!result?.timestamp || !result?.indicators?.quote?.[0]) return [];

      const { timestamp } = result;
      const q = result.indicators.quote[0];
      const bars: PriceBar[] = [];
      for (let i = 0; i < timestamp.length; i++) {
        const close = q.close?.[i];
        if (close == null) continue;
        bars.push({
          timestamp: new Date(timestamp[i] * 1000).toISOString(),
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
