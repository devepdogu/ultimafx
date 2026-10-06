import type { Asset } from "@prisma/client";
import { marketDataRegistry } from "./registry";
import type { DataProvenance } from "./types";

export interface ResolvedPrice {
  price: number | null;
  previousClose: number | null;
  change: number | null;
  changePercent: number | null;
  volume: number | null;
  bid: number | null;
  ask: number | null;
  provenance: DataProvenance;
  dataSource: string;
  timestamp: string;
}

/**
 * Single choke point for "what price should this asset trade at right now".
 * Honors an admin manual override before ever asking a provider — this is
 * the only place that logic should live, since both the trading engine and
 * the UI must agree on the same reference price (section 25/27 of the spec).
 */
export async function resolveAssetPrice(asset: Asset): Promise<ResolvedPrice> {
  if (asset.manualOverrideEnabled && asset.manualPrice != null) {
    return {
      price: Number(asset.manualPrice),
      previousClose: null,
      change: asset.manualChange != null ? Number(asset.manualChange) : null,
      changePercent:
        asset.manualChangePercent != null ? Number(asset.manualChangePercent) : null,
      volume: null,
      bid: null,
      ask: null,
      provenance: "MANUAL_OVERRIDE",
      dataSource: "admin",
      timestamp: new Date().toISOString(),
    };
  }

  const provider = marketDataRegistry.getProvider(asset.type);
  const quote = await provider.getQuote(asset.symbol);

  if (!quote || quote.lastPrice == null) {
    return {
      price: null,
      previousClose: null,
      change: null,
      changePercent: null,
      volume: null,
      bid: null,
      ask: null,
      provenance: "UNAVAILABLE",
      dataSource: provider.name,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    price: quote.lastPrice,
    previousClose: quote.previousClose,
    change: quote.change,
    changePercent: quote.changePercent,
    volume: quote.volume,
    bid: quote.bid,
    ask: quote.ask,
    provenance: quote.provenance,
    dataSource: quote.dataSource,
    timestamp: quote.timestamp,
  };
}

/**
 * Resolves many assets' prices with bounded concurrency. A plain
 * `Promise.all` over a long list (e.g. the full BIST stock catalog) would
 * fire that many concurrent upstream requests at once per page view —
 * fine for a handful of FX/gold assets, but a real rate-limit risk once a
 * list grows into the hundreds. Redis caching in `withCache` still absorbs
 * most repeat page loads; this just keeps a cold/expired-cache load from
 * bursting every request at the provider simultaneously.
 */
export async function resolveAssetPrices(
  assets: Asset[],
  concurrency = 16
): Promise<ResolvedPrice[]> {
  const results: ResolvedPrice[] = new Array(assets.length);
  let next = 0;

  async function worker() {
    while (next < assets.length) {
      const i = next++;
      results[i] = await resolveAssetPrice(assets[i]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, assets.length) }, worker));
  return results;
}
