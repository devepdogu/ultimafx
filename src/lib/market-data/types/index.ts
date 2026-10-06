// Normalized market-data domain types shared by every provider adapter.
// A provider must map its own wire format into these shapes — nothing
// downstream (API routes, React components) should ever see provider-native
// payloads directly. See section 6/26 of the product spec.

export type AssetType =
  | "STOCK"
  | "INDEX"
  | "FUND"
  | "CURRENCY"
  | "COMMODITY"
  | "CRYPTO"
  | "INTEREST_PRODUCT"
  | "CUSTOM";

export type MarketStatus =
  | "OPEN"
  | "CLOSED"
  | "PRE_MARKET"
  | "OPENING_AUCTION"
  | "CLOSING_AUCTION"
  | "HALTED"
  | "HOLIDAY";

/**
 * Every value shown to a user carries a provenance. The UI must render this
 * and must never present DELAYED/CACHED/MANUAL_OVERRIDE data as if it were
 * LIVE. See section 26.
 */
export type DataProvenance =
  | "LIVE"
  | "DELAYED"
  | "MANUAL_OVERRIDE"
  | "CACHED"
  | "UNAVAILABLE";

export interface AssetRef {
  symbol: string;
  type: AssetType;
}

/**
 * Not every provider exposes every field (e.g. a delayed REST feed may have
 * no bid/ask). Fields a provider cannot supply must be left null/undefined
 * rather than fabricated.
 */
export interface Quote {
  symbol: string;
  name?: string;
  lastPrice: number | null;
  previousClose: number | null;
  change: number | null;
  changePercent: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  volume: number | null;
  turnover: number | null;
  bid: number | null;
  ask: number | null;
  bidSize: number | null;
  askSize: number | null;
  timestamp: string; // ISO 8601, as produced by the provider
  marketStatus: MarketStatus;
  dataSource: string;
  provenance: DataProvenance;
  isDelayed: boolean;
}

export type PriceInterval =
  | "MIN_1"
  | "MIN_5"
  | "MIN_15"
  | "MIN_30"
  | "HOUR_1"
  | "DAY_1"
  | "WEEK_1"
  | "MONTH_1";

export interface PriceBar {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
}

export interface OrderBookLevel {
  price: number;
  quantity: number;
}

export interface OrderBook {
  symbol: string;
  timestamp: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  /** Which data package produced this depth — maps to BIST Level 1+/2/2+. */
  depthLevel: "L1_PLUS" | "L2" | "L2_PLUS";
  provenance: DataProvenance;
}

export interface MarketSummary {
  code: string;
  name: string;
  status: MarketStatus;
  asOf: string;
}

export interface IndexValue {
  code: string;
  name: string;
  value: number | null;
  change: number | null;
  changePercent: number | null;
  timestamp: string;
  provenance: DataProvenance;
}

export interface AssetMeta {
  symbol: string;
  name: string;
  type: AssetType;
  currency: string;
  sector?: string;
  market?: string;
}

export interface NewsItem {
  title: string;
  summary?: string;
  source: string;
  publishedAt: string;
  originalUrl: string;
  relatedSymbols?: string[];
}

export interface CorporateActionEvent {
  symbol: string;
  type: string;
  announcementDate?: string;
  recordDate?: string;
  exDate?: string;
  paymentDate?: string;
  ratio?: number;
  amount?: number;
  description?: string;
  sourceUrl?: string;
}
