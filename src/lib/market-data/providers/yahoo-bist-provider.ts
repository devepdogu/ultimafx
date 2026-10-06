import { YahooFinanceProvider } from "./yahoo-finance-provider";

/** Individual BIST equities — Yahoo requires a ".IS" suffix for Istanbul-listed symbols. */
export class YahooFinanceBistProvider extends YahooFinanceProvider {
  readonly id = "yahoo-bist";
  readonly name = "Yahoo Finance (BIST)";
  protected readonly healthCheckSymbol = "THYAO.IS";

  protected yahooSymbol(symbol: string): string {
    return `${symbol}.IS`;
  }
}
