import { UnimplementedProviderBase } from "./unimplemented-provider-base";
import type { AssetMeta, MarketSummary, PriceBar, Quote } from "../types";

export interface TruncgilProviderConfig {
  /** Defaults to the free, public, no-key Truncgil finance feed. */
  apiUrl?: string;
  cacheTtlMs?: number;
}

interface TruncgilRow {
  Buying?: number;
  Selling?: number;
  Type: string;
  Name?: string;
  Change?: number;
}

type TruncgilResponse = Record<string, TruncgilRow | string> & { Update_Date: string };

interface CachedSnapshot {
  fetchedAt: number;
  rows: Record<string, TruncgilRow>;
}

const DEFAULT_URL = "https://finans.truncgil.com/v4/today.json";
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

/** Our internal, display-friendly symbols -> Truncgil's raw JSON row keys. */
const SYMBOL_MAP: Record<string, string> = {
  GRAMALTIN: "GRA",
  ONSALTIN: "ONS",
  CEYREKALTIN: "CEYREKALTIN",
  GUMUS: "GUMUS",
  BRENT: "BRENT",
  XU100: "XU100",
};

/**
 * Real adapter for Truncgil's free, public, no-key Turkish finance feed
 * (https://finans.truncgil.com/v4/today.json) — a community-run aggregator,
 * not an official exchange/government API. No authentication, no scraping,
 * no anti-bot bypass: it's a plain public JSON endpoint intended for
 * programmatic consumption (widely used by Turkish fintech hobby projects).
 *
 * Covers gold products (gram/çeyrek/ons altın), silver, Brent, and the
 * BIST 100 (XU100) index level. It does NOT provide individual BIST stock
 * quotes — a free, reliable, no-key source for those was not found; the
 * unofficial Yahoo Finance endpoint we tried started returning anti-bot-
 * style 404s after two requests, and we will not build around that.
 *
 * Treats a `0` value from the source as "no data" (the feed appears to use
 * 0 as a sentinel for fields it hasn't populated this cycle, e.g. ONS/BRENT
 * outside certain hours) rather than ever displaying a fabricated price.
 */
export class TruncgilProvider extends UnimplementedProviderBase {
  readonly id = "truncgil";
  readonly name = "Truncgil Finans API";

  private readonly apiUrl: string;
  private readonly cacheTtlMs: number;
  private cache: CachedSnapshot | null = null;
  private inFlight: Promise<CachedSnapshot> | null = null;
  private lastError: string | null = null;

  constructor(config: TruncgilProviderConfig = {}) {
    super();
    this.apiUrl = config.apiUrl ?? DEFAULT_URL;
    this.cacheTtlMs = config.cacheTtlMs ?? DEFAULT_TTL_MS;
  }

  private async fetchSnapshot(): Promise<CachedSnapshot> {
    const res = await fetch(this.apiUrl, {
      headers: { Accept: "application/json" },
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error(`Truncgil feed returned HTTP ${res.status}`);
    const json = (await res.json()) as TruncgilResponse;

    const rows: Record<string, TruncgilRow> = {};
    for (const [key, value] of Object.entries(json)) {
      if (key === "Update_Date" || typeof value === "string") continue;
      rows[key] = value;
    }

    return { fetchedAt: Date.now(), rows };
  }

  private async getSnapshot(): Promise<CachedSnapshot | null> {
    const fresh = this.cache && Date.now() - this.cache.fetchedAt < this.cacheTtlMs;
    if (fresh) return this.cache;

    if (!this.inFlight) {
      this.inFlight = this.fetchSnapshot()
        .then((result) => {
          this.cache = result;
          this.lastError = null;
          return result;
        })
        .catch((err: unknown) => {
          this.lastError = err instanceof Error ? err.message : String(err);
          throw err;
        })
        .finally(() => {
          this.inFlight = null;
        });
    }

    try {
      return await this.inFlight;
    } catch {
      return this.cache;
    }
  }

  async getQuote(symbol: string): Promise<Quote | null> {
    const snapshot = await this.getSnapshot();
    const now = Date.now();
    const isFreshFetch = !!this.cache && now - this.cache.fetchedAt < this.cacheTtlMs;

    const rowKey = SYMBOL_MAP[symbol] ?? symbol;
    const row = snapshot?.rows[rowKey];
    // Truncgil appears to use 0 as "not populated this cycle" for a few
    // fields (e.g. ONS/BRENT outside certain hours) — never show that as a
    // real price.
    const sellingValid = row?.Selling != null && row.Selling > 0;
    const buyingValid = row?.Buying != null && row.Buying > 0;

    if (!row || (!sellingValid && !buyingValid)) {
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

    const lastPrice = sellingValid ? row.Selling! : row.Buying!;
    const changePercent = row.Change ?? null;
    const previousClose =
      changePercent != null ? lastPrice / (1 + changePercent / 100) : null;
    const change = previousClose != null ? lastPrice - previousClose : null;

    return {
      symbol,
      lastPrice,
      previousClose,
      change,
      changePercent,
      open: null,
      high: null,
      low: null,
      volume: null,
      turnover: null,
      bid: buyingValid ? row.Buying! : null,
      ask: sellingValid ? row.Selling! : null,
      bidSize: null,
      askSize: null,
      timestamp: new Date(snapshot!.fetchedAt).toISOString(),
      marketStatus: "CLOSED",
      dataSource: "Truncgil Finans API (ücretsiz, gayriresmi kaynak)",
      provenance: isFreshFetch ? "DELAYED" : "CACHED",
      isDelayed: true,
    };
  }

  async getQuotes(symbols: string[]): Promise<Quote[]> {
    const results = await Promise.all(symbols.map((s) => this.getQuote(s)));
    return results.filter((q): q is Quote => q !== null);
  }

  async getMarketStatus(marketCode: string): Promise<MarketSummary | null> {
    return { code: marketCode, name: marketCode, status: "CLOSED", asOf: new Date().toISOString() };
  }

  /**
   * Truncgil's feed is a current-snapshot JSON document with no historical
   * archive — unlike TCMB, there is no past-dated endpoint to page through.
   * Returning an empty series (rather than throwing, as the
   * UnimplementedProviderBase default does) lets the chart UI render its
   * designed "no chart data for this source yet" empty state instead of an
   * error screen.
   */
  async getHistoricalPrices(): Promise<PriceBar[]> {
    return [];
  }

  async getAssets(): Promise<AssetMeta[]> {
    return [];
  }

  async healthCheck() {
    const start = Date.now();
    try {
      await this.getSnapshot();
      const latencyMs = Date.now() - start;
      if (this.lastError) {
        return { status: "DEGRADED" as const, latencyMs, message: this.lastError };
      }
      return { status: "HEALTHY" as const, latencyMs };
    } catch (err) {
      return {
        status: "OFFLINE" as const,
        latencyMs: Date.now() - start,
        message: err instanceof Error ? err.message : String(err),
      };
    }
  }
}
