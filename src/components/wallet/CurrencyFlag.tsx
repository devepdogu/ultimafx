/** Country flag from the same TradingView CDN the market icons use. */
const FLAG_BASE = "https://s3-symbol-logo.tradingview.com/country";

export function CurrencyFlag({ code, size = 40 }: { code: "US" | "TR"; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote TradingView flag, fixed size
    <img
      src={`${FLAG_BASE}/${code}.svg`}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  );
}
