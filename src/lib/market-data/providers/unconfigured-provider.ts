import type { MarketDataProvider } from "../provider";
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
} from "../types";

/**
 * The safe default. Until an admin enables a real provider (BIST/Foreks/
 * TCMB/...) via the Data Provider configuration screen, every lookup
 * resolves to "no data" rather than inventing a price. This is what keeps
 * fake/demo numbers from ever reaching production by accident — see the
 * CRITICAL REQUIREMENT in the product spec.
 */
export class UnconfiguredProvider implements MarketDataProvider {
  readonly id = "unconfigured";
  readonly name = "No provider configured";

  async getQuote(symbol: string): Promise<Quote | null> {
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

  async getQuotes(symbols: string[]): Promise<Quote[]> {
    return Promise.all(symbols.map((s) => this.getQuote(s))) as Promise<Quote[]>;
  }

  async getHistoricalPrices(
    _symbol: string,
    _interval: PriceInterval,
    _from: Date,
    _to: Date
  ): Promise<PriceBar[]> {
    return [];
  }

  async getOrderBook(_symbol: string): Promise<OrderBook | null> {
    return null;
  }

  async getMarketStatus(marketCode: string): Promise<MarketSummary | null> {
    return {
      code: marketCode,
      name: marketCode,
      status: "CLOSED",
      asOf: new Date().toISOString(),
    };
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

  async getNews(_symbol?: string): Promise<NewsItem[]> {
    return [];
  }

  async healthCheck() {
    return {
      status: "OFFLINE" as const,
      latencyMs: null,
      message: "No data provider is enabled in admin configuration.",
    };
  }
}
