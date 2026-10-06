import { TruncgilProvider } from "./truncgil-provider";
import { YahooFinanceUsProvider } from "./yahoo-us-provider";
import type { Quote } from "../types";

/** Our commodity symbols that Truncgil doesn't populate, mapped to Yahoo futures tickers. */
const YAHOO_COMMODITY: Record<string, string> = {
  ONSALTIN: "GC=F",
};

/** Truncgil for Turkish gold products; Yahoo futures where Truncgil reports no value. */
export class CommodityProvider extends TruncgilProvider {
  private readonly yahoo = new YahooFinanceUsProvider();

  async getQuote(symbol: string): Promise<Quote | null> {
    const yahooSymbol = YAHOO_COMMODITY[symbol];
    if (yahooSymbol) {
      const quote = await this.yahoo.getQuote(yahooSymbol);
      if (quote && quote.lastPrice != null) return { ...quote, symbol };
    }
    return super.getQuote(symbol);
  }
}
