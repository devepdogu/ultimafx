import type { MarketDataProvider } from "../provider";
import { ProviderNotConfiguredError } from "../provider";
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
 * Shared skeleton for provider adapters whose real endpoint integration is
 * deferred to a later phase (once licensing/contract details are final).
 * Every method throws rather than returning invented data, so an adapter
 * can be registered and type-checked today without risking fake prices
 * reaching the UI.
 */
export abstract class UnimplementedProviderBase implements MarketDataProvider {
  abstract readonly id: string;
  abstract readonly name: string;

  async getQuote(_symbol: string): Promise<Quote | null> {
    throw new ProviderNotConfiguredError(this.name);
  }

  async getQuotes(_symbols: string[]): Promise<Quote[]> {
    throw new ProviderNotConfiguredError(this.name);
  }

  async getHistoricalPrices(
    _symbol: string,
    _interval: PriceInterval,
    _from: Date,
    _to: Date
  ): Promise<PriceBar[]> {
    throw new ProviderNotConfiguredError(this.name);
  }

  async getOrderBook(_symbol: string): Promise<OrderBook | null> {
    throw new ProviderNotConfiguredError(this.name);
  }

  async getMarketStatus(_marketCode: string): Promise<MarketSummary | null> {
    throw new ProviderNotConfiguredError(this.name);
  }

  async getIndices(): Promise<IndexValue[]> {
    throw new ProviderNotConfiguredError(this.name);
  }

  async getAssets(): Promise<AssetMeta[]> {
    throw new ProviderNotConfiguredError(this.name);
  }

  async getCorporateActions(_symbol: string): Promise<CorporateActionEvent[]> {
    throw new ProviderNotConfiguredError(this.name);
  }

  async getNews(_symbol?: string): Promise<NewsItem[]> {
    throw new ProviderNotConfiguredError(this.name);
  }

  async healthCheck(): Promise<{
    status: "HEALTHY" | "DELAYED" | "DEGRADED" | "OFFLINE";
    latencyMs: number | null;
    message?: string;
  }> {
    return {
      status: "OFFLINE" as const,
      latencyMs: null,
      message: `${this.name} adapter is not yet implemented.`,
    };
  }
}
