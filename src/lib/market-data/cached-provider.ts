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

/**
 * Caps how many provider requests run at once across all symbols. With quotes
 * refreshing every 15s, hundreds of stale symbols would otherwise hit the
 * provider in one burst and risk rate limits.
 */
const MAX_CONCURRENT_PROVIDER_CALLS = 8;
let activeProviderCalls = 0;
const providerQueue: (() => void)[] = [];

async function withProviderSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (activeProviderCalls >= MAX_CONCURRENT_PROVIDER_CALLS) {
    await new Promise<void>((resolve) => providerQueue.push(resolve));
  }
  activeProviderCalls++;
  try {
    return await fn();
  } finally {
    activeProviderCalls--;
    providerQueue.shift()?.();
  }
}

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

  /** Fetches from the provider and refreshes both the fresh and last-good caches. Concurrent calls share one request. */
  function refreshQuote(symbol: string, background: boolean): Promise<Quote | null> {
    const existing = inFlightQuotes.get(symbol);
    if (existing) return existing;

    const promise = (async (): Promise<Quote | null> => {
      try {
        // Background refreshes share the concurrency cap; a page waiting on a cold symbol never queues behind them.
        const fetchQuote = () => provider.getQuote(symbol);
        const quote = background ? await withProviderSlot(fetchQuote) : await fetchQuote();
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

  /**
   * Stale-while-revalidate: a page load never waits on the provider when a
   * last-good quote exists. The stale value is returned as CACHED and a refresh
   * starts in the background, so the next load (or the next client refresh)
   * shows the new price. Only a cold symbol waits for the provider.
   */
  async function getQuote(symbol: string): Promise<Quote | null> {
    const cached = await readCache<Quote>(freshKey(symbol));
    if (cached) return cached;

    const lastGood = await readCache<Quote>(lastGoodKey(symbol));
    if (lastGood) {
      void refreshQuote(symbol, true);
      return { ...lastGood, provenance: "CACHED" as const };
    }
    return refreshQuote(symbol, false);
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
