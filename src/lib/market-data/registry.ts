import type { MarketDataProvider } from "./provider";
import { UnconfiguredProvider } from "./providers/unconfigured-provider";
import { TCMBProvider } from "./providers/tcmb-provider";
import { CommodityProvider } from "./providers/commodity-provider";
import { YahooFinanceBistProvider } from "./providers/yahoo-bist-provider";
import { YahooFinanceUsProvider } from "./providers/yahoo-us-provider";
import { BinanceProvider } from "./providers/binance-provider";
import { withCache } from "./cached-provider";

/**
 * Central place that resolves "the active market data provider" for a given
 * asset class/market. Business logic and API routes should always go
 * through `getProvider()` rather than importing a concrete adapter — that
 * is what lets a provider be swapped from the admin panel without touching
 * application code (section 3/4 of the product spec).
 *
 * The key passed to `getProvider()` is a loose routing key — today it's an
 * `AssetType` ("CURRENCY", "CRYPTO", ...), but it's just a string so a
 * future per-market-code or per-DataProvider-row scheme fits without an
 * interface change. Unregistered keys fall back to `UnconfiguredProvider`,
 * which returns UNAVAILABLE for everything rather than inventing a price —
 * that's what keeps unconfigured asset classes honest by default.
 */
class MarketDataProviderRegistry {
  private defaultProvider: MarketDataProvider = new UnconfiguredProvider();
  private readonly overrides = new Map<string, MarketDataProvider>();

  register(key: string, provider: MarketDataProvider) {
    this.overrides.set(key, provider);
  }

  setDefault(provider: MarketDataProvider) {
    this.defaultProvider = provider;
  }

  getProvider(key?: string): MarketDataProvider {
    if (key && this.overrides.has(key)) {
      return this.overrides.get(key)!;
    }
    return this.defaultProvider;
  }
}

export const marketDataRegistry = new MarketDataProviderRegistry();

// TCMB is a real, free, official, no-key-required public data source — safe
// to wire up by default. Wrapped in Redis caching so quotes survive server
// restarts/instances and never silently show stale data as live (see
// cached-provider.ts). Everything else stays on UnconfiguredProvider until a
// licensed/public adapter is actually implemented for it.
marketDataRegistry.register("CURRENCY", withCache(new TCMBProvider()));

// Truncgil is a free, no-key, community-run aggregator — covers gold
// products. It does not expose a historical archive (see
// truncgil-provider.ts), so gold/silver charts stay on an honest empty
// state until a source with real history is found.
//
// A short Redis TTL (30s, vs the 600s default) keeps the UI close to real
// time — the provider's own in-process fetch is still debounced to once per
// 5 minutes internally, so this doesn't add upstream load, it just re-checks
// that in-process value more often instead of pinning a Redis-cached read
// for up to 10 minutes after it goes stale.
marketDataRegistry.register("COMMODITY", withCache(new CommodityProvider(), { quoteTtlSeconds: 15 }));

// Individual BIST equities AND the BIST 100 index both go through Yahoo
// Finance's public chart endpoint — see yahoo-bist-provider.ts for exactly
// what makes this safe to rely on (plain JSON, no scraping/auth bypass,
// re-verified live) versus the earlier, different attempt this codebase
// once rejected. Yahoo's own symbol search confirms "XU100.IS" (BIST 100)
// resolves there with real quotes AND real historical bars, which Truncgil
// never provided for the index — so this is also what makes the BIST 100
// chart real instead of permanently empty. A 45s Redis TTL keeps quotes
// feeling current without re-hitting Yahoo on every page view.
const yahooBist = withCache(new YahooFinanceBistProvider(), { quoteTtlSeconds: 15 });
marketDataRegistry.register("STOCK", yahooBist);
marketDataRegistry.register("INDEX", yahooBist);
marketDataRegistry.register("US_STOCK", withCache(new YahooFinanceUsProvider(), { quoteTtlSeconds: 15 }));

// Binance's public API — free, no key, real traded prices (converted USDT→TRY via Binance's own
// USDTTRY pair) and a rate limit generous enough for this app's quote-polling volume, unlike the
// CoinGecko free tier this used to hit 429s on. CoinGecko is still used, separately and rarely, to
// fetch a coin's logo when an admin adds it (see entity-actions.ts), which doesn't need this limit.
marketDataRegistry.register("CRYPTO", withCache(new BinanceProvider(), { quoteTtlSeconds: 20, staticTtlSeconds: 900 }));
