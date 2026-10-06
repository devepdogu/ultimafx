import { YahooFinanceProvider } from "./yahoo-finance-provider";

/** US-listed equities (Nasdaq/NYSE) — Yahoo uses the bare ticker, no exchange suffix. */
export class YahooFinanceUsProvider extends YahooFinanceProvider {
  readonly id = "yahoo-us";
  readonly name = "Yahoo Finance (US)";
  protected readonly healthCheckSymbol = "AAPL";

  protected yahooSymbol(symbol: string): string {
    return symbol;
  }
}
