// No `server-only` guard — shared with standalone worker scripts (see redis.ts).
import type { MarketDataProvider } from "./provider";
import type {
  AssetMeta,
  CorporateActionEvent,
  IndexValue,
  MarketSummary,
  NewsItem,
  OrderBook,
  PriceBar,
  PriceInterval,
  Quote,
} from "./types";
import { cacheAside, readCache, writeCacheForever } from "@/lib/cache/cache-aside";

export interface CacheOptions {
  /** TTL for a "fresh" quote before the next call re-fetches from the provider. */
  quoteTtlSeconds?: number;
  /** TTL for historical chart ranges, indices, assets, corporate actions. */
  staticTtlSeconds?: number;
}

const DEFAULT_QUOTE_TTL = 600; // 10 minutes — matches TCMB's once/business-day cadence.
const DEFAULT_STATIC_TTL = 1800; // 30 minutes.

/**
 * Wraps a MarketDataProvider with Redis caching so the rest of the app never
 * has to think about it: business logic always calls `getQuote()` etc. and
 * gets a cache-aside result with an honest provenance.
 *
 * On a cache miss, calls the underlying provider. If that call fails or
 * comes back UNAVAILABLE, falls back to the last successfully fetched value
 * (kept with no expiry) and re-tags its provenance as CACHED — the UI must
 * never show stale data as if it were fresh (see DataProvenance docs).
 *
 * This is the ONLY place caching/fallback logic lives, so adding a new
 * provider never means re-implementing it — wrap once in the registry.
 */
export function withCache(
  provider: MarketDataProvider,
  options: CacheOptions = {}
): MarketDataProvider {
  const quoteTtl = options.quoteTtlSeconds ?? DEFAULT_QUOTE_TTL;
  const staticTtl = options.staticTtlSeconds ?? DEFAULT_STATIC_TTL;
  const inFlightQuotes = new Map<string, Promise<Quote | null>>();

  const freshKey = (symbol: string) => `md:${provider.id}:quote:fresh:${symbol}`;
  const lastGoodKey = (symbol: string) => `md:${provider.id}:quote:last-good:${symbol}`;

  async function getQuote(symbol: string): Promise<Quote | null> {
    const cached = await readCache<Quote>(freshKey(symbol));
    if (cached) return cached;

    const existing = inFlightQuotes.get(symbol);
    if (existing) return existing;

    const promise = (async (): Promise<Quote | null> => {
      try {
        const quote = await provider.getQuote(symbol);
        if (quote && quote.provenance !== "UNAVAILABLE") {
          await cacheAside(freshKey(symbol), quoteTtl, async () => quote);
          await writeCacheForever(lastGoodKey(symbol), quote);
          return quote;
        }

        const lastGood = await readCache<Quote>(lastGoodKey(symbol));
        if (lastGood) return { ...lastGood, provenance: "CACHED" as const };
        return quote;
      } catch {
        const lastGood = await readCache<Quote>(lastGoodKey(symbol));
        if (lastGood) return { ...lastGood, provenance: "CACHED" as const };
        return null;
      } finally {
        inFlightQuotes.delete(symbol);
      }
    })();

    inFlightQuotes.set(symbol, promise);
    return promise;
  }

  return {
    id: provider.id,
    name: provider.name,

    getQuote,

    async getQuotes(symbols: string[]): Promise<Quote[]> {
      const results = await Promise.all(symbols.map((s) => getQuote(s)));
      return results.filter((q): q is Quote => q !== null);
    },

    async getHistoricalPrices(
      symbol: string,
      interval: PriceInterval,
      from: Date,
      to: Date
    ): Promise<PriceBar[]> {
      const key = `md:${provider.id}:history:${symbol}:${interval}:${from.toISOString()}:${to.toISOString()}`;
      return cacheAside(key, staticTtl, () =>
        provider.getHistoricalPrices(symbol, interval, from, to)
      );
    },

    // Order book depth is inherently real-time; never cache it.
    getOrderBook(symbol: string): Promise<OrderBook | null> {
      return provider.getOrderBook(symbol);
    },

    async getMarketStatus(marketCode: string): Promise<MarketSummary | null> {
      const key = `md:${provider.id}:market-status:${marketCode}`;
      return cacheAside(key, Math.min(staticTtl, 60), () => provider.getMarketStatus(marketCode));
    },

    async getIndices(): Promise<IndexValue[]> {
      const key = `md:${provider.id}:indices`;
      return cacheAside(key, quoteTtl, () => provider.getIndices());
    },

    async getAssets(): Promise<AssetMeta[]> {
      const key = `md:${provider.id}:assets`;
      return cacheAside(key, staticTtl, () => provider.getAssets());
    },

    async getCorporateActions(symbol: string): Promise<CorporateActionEvent[]> {
      const key = `md:${provider.id}:corporate-actions:${symbol}`;
      return cacheAside(key, staticTtl, () => provider.getCorporateActions(symbol));
    },

    async getNews(symbol?: string): Promise<NewsItem[]> {
      const key = `md:${provider.id}:news:${symbol ?? "__all__"}`;
      return cacheAside(key, Math.min(staticTtl, 300), () => provider.getNews(symbol));
    },

    // Health must always reflect live status — never cached.
    healthCheck() {
      return provider.healthCheck();
    },
  };
}
