import { UnimplementedProviderBase } from "./unimplemented-provider-base";

export interface BorsaIstanbulProviderConfig {
  apiUrl: string;
  apiKey: string;
  apiSecret?: string;
  websocketUrl?: string;
  /** Maps to the subscribed BIST market-data package. */
  depthLevel?: "L1_PLUS" | "L2" | "L2_PLUS";
}

/**
 * Adapter skeleton for a licensed Borsa İstanbul data feed (direct or via an
 * authorized redistributor). Real endpoint/auth logic is deferred to Phase
 * 2, once contract and licensing details are final — this class exists so
 * the rest of the app can depend on `MarketDataProvider` today.
 */
export class BorsaIstanbulProvider extends UnimplementedProviderBase {
  readonly id = "borsa-istanbul";
  readonly name = "Borsa İstanbul";

  constructor(private readonly config: BorsaIstanbulProviderConfig) {
    super();
    void this.config;
  }
}
