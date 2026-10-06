import { UnimplementedProviderBase } from "./unimplemented-provider-base";

export interface KAPProviderConfig {
  apiUrl: string;
}

/**
 * Adapter skeleton for KAP (Kamuyu Aydınlatma Platformu) public disclosures.
 * This feed is disclosure data, not pricing — `getQuote`/`getOrderBook` etc.
 * are expected to stay unimplemented here; disclosures are ingested through
 * a dedicated KAP ingestion job (section 16/47), not the price-quote path.
 */
export class KAPProvider extends UnimplementedProviderBase {
  readonly id = "kap";
  readonly name = "KAP";

  constructor(private readonly config: KAPProviderConfig) {
    super();
    void this.config;
  }
}
