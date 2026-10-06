import { XMLParser } from "fast-xml-parser";
import { UnimplementedProviderBase } from "./unimplemented-provider-base";
import type {
  AssetMeta,
  CorporateActionEvent,
  IndexValue,
  MarketSummary,
  OrderBook,
  PriceBar,
  PriceInterval,
  Quote,
} from "../types";

export interface TCMBProviderConfig {
  /** Defaults to the official public TCMB daily rates feed; no API key required. */
  apiUrl?: string;
  /** How long a successful fetch is considered fresh before being re-fetched. */
  cacheTtlMs?: number;
}

interface TCMBCurrencyRow {
  Kod: string;
  ForexBuying?: string | number;
  ForexSelling?: string | number;
}

interface Rate {
  buying: number | null;
  selling: number;
}

interface CachedRates {
  fetchedAt: number;
  tarihDate: string;
  rates: Map<string, Rate>;
}

const DEFAULT_URL = "https://www.tcmb.gov.tr/kurlar/today.xml";
const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Real adapter for the Central Bank of the Republic of Turkey's public daily
 * FX reference rates (https://www.tcmb.gov.tr/kurlar/today.xml). No API key,
 * no authentication, no scraping or anti-bot bypass — this is TCMB's own
 * published XML feed, intended for public consumption.
 *
 * TCMB publishes once per business day, so every value returned here is
 * DELAYED (official end-of-day reference), never LIVE. On fetch failure the
 * last successfully parsed snapshot is served as CACHED, with an honest
 * timestamp; if no snapshot has ever succeeded, the quote is UNAVAILABLE.
 * Prices are never invented.
 *
 * `getHistoricalPrices` also pulls real data, from TCMB's per-day archive
 * (`/kurlar/YYYYMM/DDMMYYYY.xml` — same published feed, past dates). See its
 * own doc comment below for how long ranges are sampled.
 */
export class TCMBProvider extends UnimplementedProviderBase {
  readonly id = "tcmb";
  readonly name = "TCMB";

  private readonly apiUrl: string;
  private readonly cacheTtlMs: number;
  private cache: CachedRates | null = null;
  private inFlight: Promise<CachedRates> | null = null;
  private lastError: string | null = null;

  constructor(config: TCMBProviderConfig = {}) {
    super();
    this.apiUrl = config.apiUrl ?? DEFAULT_URL;
    this.cacheTtlMs = config.cacheTtlMs ?? DEFAULT_TTL_MS;
  }

  private async fetchRates(): Promise<CachedRates> {
    const res = await fetch(this.apiUrl, {
      headers: { Accept: "application/xml" },
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error(`TCMB feed returned HTTP ${res.status}`);
    const xml = await res.text();

    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
    const doc = parser.parse(xml);
    const root = doc?.Tarih_Date;
    if (!root) throw new Error("TCMB feed: unexpected XML shape (no Tarih_Date root)");

    const rows: TCMBCurrencyRow[] = Array.isArray(root.Currency) ? root.Currency : [root.Currency];
    const rates = new Map<string, Rate>();
    for (const row of rows) {
      const sell = row?.ForexSelling;
      if (row?.Kod && sell !== undefined && sell !== "") {
        const selling = Number(sell);
        if (!Number.isFinite(selling)) continue;
        const buy = row?.ForexBuying;
        const buying = buy !== undefined && buy !== "" && Number.isFinite(Number(buy)) ? Number(buy) : null;
        rates.set(row.Kod, { buying, selling });
      }
    }

    return { fetchedAt: Date.now(), tarihDate: root.Tarih ?? "", rates };
  }

  private async getRates(): Promise<CachedRates | null> {
    const fresh = this.cache && Date.now() - this.cache.fetchedAt < this.cacheTtlMs;
    if (fresh) return this.cache;

    if (!this.inFlight) {
      this.inFlight = this.fetchRates()
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
      // Fall through to whatever we had cached before, if anything.
      return this.cache;
    }
  }

  private symbolToCcyCode(symbol: string): string | null {
    // Expect symbols like "USDTRY", "EURTRY", "GBPTRY".
    const match = /^([A-Z]{3})TRY$/.exec(symbol);
    return match ? match[1] : null;
  }

  async getQuote(symbol: string): Promise<Quote | null> {
    const ccy = this.symbolToCcyCode(symbol);
    if (!ccy) return null;

    const rates = await this.getRates();
    const now = Date.now();
    const isFreshFetch = !!this.cache && now - this.cache.fetchedAt < this.cacheTtlMs;

    if (!rates || !rates.rates.has(ccy)) {
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

    const rate = rates.rates.get(ccy)!;
    return {
      symbol,
      // Selling (what the bank sells FX to you for) is the conventional
      // "reference price" shown everywhere else in the app.
      lastPrice: rate.selling,
      previousClose: null,
      change: null,
      changePercent: null,
      open: null,
      high: null,
      low: null,
      volume: null,
      turnover: null,
      // TCMB's own buying/selling rates double as a real bid/ask spread —
      // not invented, just relabeled (bid = buying, ask = selling).
      bid: rate.buying,
      ask: rate.selling,
      bidSize: null,
      askSize: null,
      timestamp: new Date(rates.fetchedAt).toISOString(),
      marketStatus: "CLOSED",
      dataSource: "TCMB (Türkiye Cumhuriyet Merkez Bankası)",
      // Always DELAYED: this is an official once-per-business-day reference
      // rate, never a live trading price — see class-level note above.
      provenance: isFreshFetch ? "DELAYED" : "CACHED",
      isDelayed: true,
    };
  }

  async getQuotes(symbols: string[]): Promise<Quote[]> {
    const results = await Promise.all(symbols.map((s) => this.getQuote(s)));
    return results.filter((q): q is Quote => q !== null);
  }

  /**
   * TCMB publishes one XML file per business day at a fixed, documented URL
   * (`/kurlar/YYYYMM/DDMMYYYY.xml`) — the same official feed as `today.xml`,
   * just for a past date. This is real historical data, not a fabrication:
   * each bar is the single end-of-day reference rate TCMB published that
   * day, so open/high/low/close are all equal (there is no intraday range
   * to report) and `volume` is honestly null.
   *
   * Weekends/holidays 404 and are silently skipped. To keep a 5-year request
   * from firing ~1250 individual fetches, a range longer than
   * `MAX_FETCHES` business days is stride-sampled rather than fetched in
   * full — still real daily closes, just a coarser resolution when zoomed
   * out (ordinary charting practice, not invented data).
   */
  async getHistoricalPrices(
    symbol: string,
    _interval: PriceInterval,
    from: Date,
    to: Date
  ): Promise<PriceBar[]> {
    const ccy = this.symbolToCcyCode(symbol);
    if (!ccy) return [];

    const MAX_FETCHES = 180;
    const CONCURRENCY = 8;

    const businessDays: Date[] = [];
    const cursor = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()));
    const fromUTC = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
    while (cursor >= fromUTC) {
      const day = cursor.getUTCDay();
      if (day !== 0 && day !== 6) businessDays.push(new Date(cursor));
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    businessDays.reverse();

    const stride = Math.max(1, Math.ceil(businessDays.length / MAX_FETCHES));
    const sampledDays = businessDays.filter((_, i) => i % stride === 0);

    const bars: (PriceBar | null)[] = new Array(sampledDays.length).fill(null);
    for (let start = 0; start < sampledDays.length; start += CONCURRENCY) {
      const batch = sampledDays.slice(start, start + CONCURRENCY);
      const results = await Promise.all(
        batch.map((date) => this.fetchHistoricalDay(date, ccy))
      );
      results.forEach((bar, i) => {
        bars[start + i] = bar;
      });
    }

    return bars.filter((b): b is PriceBar => b !== null);
  }

  private async fetchHistoricalDay(date: Date, ccy: string): Promise<PriceBar | null> {
    const yyyymm = `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    const ddmmyyyy = `${String(date.getUTCDate()).padStart(2, "0")}${String(date.getUTCMonth() + 1).padStart(2, "0")}${date.getUTCFullYear()}`;
    const url = `https://www.tcmb.gov.tr/kurlar/${yyyymm}/${ddmmyyyy}.xml`;

    try {
      const res = await fetch(url, { headers: { Accept: "application/xml" }, next: { revalidate: 0 } });
      if (!res.ok) return null;
      const xml = await res.text();

      const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
      const doc = parser.parse(xml);
      const root = doc?.Tarih_Date;
      if (!root) return null;

      const rows: TCMBCurrencyRow[] = Array.isArray(root.Currency) ? root.Currency : [root.Currency];
      const row = rows.find((r) => r?.Kod === ccy);
      const sell = row?.ForexSelling;
      if (sell === undefined || sell === "") return null;
      const value = Number(sell);
      if (!Number.isFinite(value)) return null;

      return {
        timestamp: date.toISOString(),
        open: value,
        high: value,
        low: value,
        close: value,
        volume: null,
      };
    } catch {
      return null;
    }
  }

  async getOrderBook(_symbol: string): Promise<OrderBook | null> {
    return null;
  }

  async getMarketStatus(marketCode: string): Promise<MarketSummary | null> {
    return { code: marketCode, name: marketCode, status: "CLOSED", asOf: new Date().toISOString() };
  }

  async getIndices(): Promise<IndexValue[]> {
    return [];
  }

  async getAssets(): Promise<AssetMeta[]> {
    return [];
  }

  async getCorporateActions(_symbol: string): Promise<CorporateActionEvent[]> {
    return [];
  }

  async healthCheck() {
    const start = Date.now();
    try {
      await this.getRates();
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
