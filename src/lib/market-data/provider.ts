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

/**
 * The contract every market-data source must implement. Business logic,
 * API routes and React components depend only on this interface — never on
 * a specific vendor's SDK or response shape. Swapping BIST/Foreks/KAP/TCMB
 * vendors must never require touching code outside `lib/market-data/providers`.
 *
 * Implementations MUST:
 *  - return `null`/throw a typed error rather than inventing values when the
 *    underlying provider has no data for a symbol;
 *  - set `provenance`/`isDelayed` honestly based on the provider's actual
 *    license tier (realtime vs delayed);
 *  - never be constructed with live credentials unless `DataProvider.isEnabled`
 *    is true in the admin configuration.
 */
export interface MarketDataProvider {
  readonly id: string;
  readonly name: string;

  getQuote(symbol: string): Promise<Quote | null>;
  getQuotes(symbols: string[]): Promise<Quote[]>;
  getHistoricalPrices(
    symbol: string,
    interval: PriceInterval,
    from: Date,
    to: Date
  ): Promise<PriceBar[]>;
  getOrderBook(symbol: string): Promise<OrderBook | null>;
  getMarketStatus(marketCode: string): Promise<MarketSummary | null>;
  getIndices(): Promise<IndexValue[]>;
  getAssets(): Promise<AssetMeta[]>;
  getCorporateActions(symbol: string): Promise<CorporateActionEvent[]>;
  getNews(symbol?: string): Promise<NewsItem[]>;

  /** Cheap connectivity check used by the provider health monitor (section 49). */
  healthCheck(): Promise<{
    status: "HEALTHY" | "DELAYED" | "DEGRADED" | "OFFLINE";
    latencyMs: number | null;
    message?: string;
  }>;
}

export class ProviderNotConfiguredError extends Error {
  constructor(providerName: string) {
    super(
      `Market data provider "${providerName}" is not configured. Configure ` +
        "credentials and enable it from Admin → Veri Sağlayıcıları " +
        "before it can serve data."
    );
    this.name = "ProviderNotConfiguredError";
  }
}
