import { UnimplementedProviderBase } from "./unimplemented-provider-base";

export interface ForeksProviderConfig {
  apiUrl: string;
  apiKey: string;
  websocketUrl?: string;
}

/** Adapter skeleton for a Foreks market-data feed (FX/BIST/commodities). */
export class ForeksProvider extends UnimplementedProviderBase {
  readonly id = "foreks";
  readonly name = "Foreks";

  constructor(private readonly config: ForeksProviderConfig) {
    super();
    void this.config;
  }
}
