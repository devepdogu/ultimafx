import { UnimplementedProviderBase } from "./unimplemented-provider-base";
import type { MarketSummary, PriceBar, PriceInterval, Quote } from "../types";

/**
 * Binance's public market-data API — free, no key, and a generous rate limit (~1200 weight/min per
 * IP for public endpoints), unlike CoinGecko's free tier which this app hit 429s on during normal
 * use. Prices are quoted in USDT on Binance; we convert to TRY using Binance's own USDTTRY pair so
 * the number is still a real traded price, not an invented one.
 *
 * Our local ticker (Asset.symbol, e.g. "BTC") is used directly as the Binance base asset — no id
 * mapping table needed. A symbol with no `{SYMBOL}USDT` market on Binance returns UNAVAILABLE.
 */
const API = "https://api.binance.com/api/v3";
const BASE_INTERVAL: Record<PriceInterval, string> = {
  MIN_1: "1m",
  MIN_5: "5m",
  MIN_15: "15m",
  MIN_30: "30m",
  HOUR_1: "1h",
  DAY_1: "1d",
  WEEK_1: "1w",
  MONTH_1: "1M",
};

interface Ticker24h {
  symbol: string;
  lastPrice: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
}

type Kline = [number, string, string, string, string, string, ...unknown[]];

export class BinanceProvider extends UnimplementedProviderBase {
  readonly id = "binance";
  readonly name = "Binance";

  private pairFor(symbol: string): string {
    return symbol.toUpperCase() === "USDT" ? "USDTTRY" : `${symbol.toUpperCase()}USDT`;
  }

  private emptyQuote(symbol: string): Quote {
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
      marketStatus: "OPEN", // crypto trades 24/7; "no quote" is UNAVAILABLE, not a closed market.
      dataSource: this.name,
      provenance: "UNAVAILABLE",
      isDelayed: true,
    };
  }

  async getQuote(symbol: string): Promise<Quote | null> {
    const quotes = await this.getQuotes([symbol]);
    return quotes[0] ?? this.emptyQuote(symbol);
  }

  async getQuotes(symbols: string[]): Promise<Quote[]> {
    if (symbols.length === 0) return [];
    const pairs = [...new Set(symbols.map((s) => this.pairFor(s)).concat("USDTTRY"))];

    try {
      const url = `${API}/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(pairs))}`;
      const res = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(10_000) });
      if (!res.ok) return symbols.map((s) => this.emptyQuote(s));
      const rows: Ticker24h[] = await res.json();
      const byPair = new Map(rows.map((r) => [r.symbol, r]));
      const usdtTry = byPair.get("USDTTRY");
      const usdtTryRate = usdtTry ? Number(usdtTry.lastPrice) : null;

      return symbols.map((symbol) => {
        if (symbol.toUpperCase() === "USDT") {
          if (!usdtTry || usdtTryRate == null) return this.emptyQuote(symbol);
          return this.toQuote(symbol, usdtTry, 1);
        }
        const t = byPair.get(this.pairFor(symbol));
        if (!t || usdtTryRate == null) return this.emptyQuote(symbol);
        return this.toQuote(symbol, t, usdtTryRate);
      });
    } catch {
      return symbols.map((s) => this.emptyQuote(s));
    }
  }

  /** Converts a USDT-quoted (or already-TRY, for the USDTTRY pair itself) ticker to a TRY Quote. */
  private toQuote(symbol: string, t: Ticker24h, usdtTryRate: number): Quote {
    const lastUsdt = Number(t.lastPrice);
    const openUsdt = Number(t.openPrice);
    const lastPrice = lastUsdt * usdtTryRate;
    const previousClose = openUsdt * usdtTryRate;
    const change = lastPrice - previousClose;
    const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : null;

    return {
      symbol,
      lastPrice,
      previousClose,
      change,
      changePercent,
      open: previousClose,
      high: Number(t.highPrice) * usdtTryRate,
      low: Number(t.lowPrice) * usdtTryRate,
      volume: Number(t.volume) || null,
      turnover: null,
      bid: null,
      ask: null,
      bidSize: null,
      askSize: null,
      timestamp: new Date().toISOString(),
      marketStatus: "OPEN",
      dataSource: this.name,
      provenance: "LIVE",
      isDelayed: false,
    };
  }

  private async fetchKlines(pair: string, interval: string, limit: number): Promise<Kline[] | null> {
    const url = `${API}/klines?symbol=${pair}&interval=${interval}&limit=${limit}`;
    const res = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return null;
    return res.json();
  }

  /**
   * Real OHLC candles converted to TRY using the USDTTRY candle from the *same* time bucket
   * (not today's rate scaled over history), so historical bars reflect the actual exchange
   * rate at that point in time rather than an approximation.
   */
  async getHistoricalPrices(symbol: string, interval: PriceInterval, _from: Date, _to: Date): Promise<PriceBar[]> {
    const binanceInterval = BASE_INTERVAL[interval] ?? "1d";
    const limit = 500;
    try {
      if (symbol.toUpperCase() === "USDT") {
        const rows = await this.fetchKlines("USDTTRY", binanceInterval, limit);
        if (!rows) return [];
        return rows.map((k) => ({ timestamp: new Date(k[0]).toISOString(), open: Number(k[1]), high: Number(k[2]), low: Number(k[3]), close: Number(k[4]), volume: Number(k[5]) || null }));
      }

      const [coinRows, fxRows] = await Promise.all([
        this.fetchKlines(this.pairFor(symbol), binanceInterval, limit),
        this.fetchKlines("USDTTRY", binanceInterval, limit),
      ]);
      if (!coinRows || !fxRows) return [];
      const fxByTime = new Map(fxRows.map((k) => [k[0], Number(k[4])]));

      const bars: PriceBar[] = [];
      for (const k of coinRows) {
        const fx = fxByTime.get(k[0]);
        if (fx == null) continue; // No matching FX candle for this bucket — skip rather than guess a rate.
        bars.push({
          timestamp: new Date(k[0]).toISOString(),
          open: Number(k[1]) * fx,
          high: Number(k[2]) * fx,
          low: Number(k[3]) * fx,
          close: Number(k[4]) * fx,
          volume: Number(k[5]) || null,
        });
      }
      return bars;
    } catch {
      return [];
    }
  }

  async getMarketStatus(marketCode: string): Promise<MarketSummary | null> {
    // Crypto has no exchange calendar — the market is always open.
    return { code: marketCode, name: "Kripto", status: "OPEN", asOf: new Date().toISOString() };
  }

  async healthCheck() {
    try {
      const res = await fetch(`${API}/ping`, { signal: AbortSignal.timeout(8_000) });
      return { status: res.ok ? ("HEALTHY" as const) : ("DEGRADED" as const), latencyMs: null };
    } catch {
      return { status: "OFFLINE" as const, latencyMs: null, message: "Binance unreachable." };
    }
  }
}
