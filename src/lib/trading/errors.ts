export class TradingError extends Error {
  constructor(public readonly turkishMessage: string) {
    super(turkishMessage);
    this.name = "TradingError";
  }
}

export const InsufficientBalanceError = () =>
  new TradingError("Yetersiz bakiye. Lütfen tutarı kontrol edin.");

export const InsufficientUsdBalanceError = () =>
  new TradingError("Yetersiz dolar bakiyesi. Bu varlık dolar ile alınır; önce TL'yi dolara çevirin.");

export const InsufficientHoldingsError = () =>
  new TradingError("Yetersiz miktar. Elinizdeki miktardan fazlasını satamazsınız.");

export const PriceUnavailableError = () =>
  new TradingError(
    "Bu varlık için şu anda güncel bir referans fiyat bulunmuyor. Lütfen daha sonra tekrar deneyin."
  );

export const InvalidQuantityError = () =>
  new TradingError("Geçersiz miktar. Lütfen pozitif bir miktar girin.");

export const AssetNotTradableError = () =>
  new TradingError("Bu varlık şu anda işleme kapalı.");

export const MarketClosedError = (hours: string | null) =>
  new TradingError(
    hours
      ? `Piyasa şu anda kapalı. Bu varlıkta emir yalnızca seans saatlerinde verilebilir: ${hours}.`
      : "Piyasa şu anda kapalı."
  );
