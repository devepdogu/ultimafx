import { UnimplementedProviderBase } from "./unimplemented-provider-base";

export interface CryptoProviderConfig {
  apiUrl: string;
  apiKey?: string;
  websocketUrl?: string;
}

/**
 * Adapter skeleton for a licensed crypto market-data feed. Kept separate
 * from BIST-facing providers since crypto market semantics (24/7 trading,
 * no auction sessions, different settlement) must not be conflated with
 * BIST session/market-status logic — see section 22 of the product spec.
 */
export class CryptoProvider extends UnimplementedProviderBase {
  readonly id = "crypto";
  readonly name = "Crypto";

  constructor(private readonly config: CryptoProviderConfig) {
    super();
    void this.config;
  }
}
