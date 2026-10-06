import { prisma } from "@/lib/prisma/client";
import { resolveAssetPrice } from "@/lib/market-data/resolve-price";
import { getAssetHistory } from "@/lib/market-data/get-history";
import { Sparkline } from "@/components/ui/Sparkline";
import { AssetIcon } from "@/components/market/AssetIcon";
import { Link } from "@/i18n/navigation";
import { getAssetBasePath } from "@/lib/market-data/asset-routes";
import { formatChangePercent } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const CARD_SYMBOLS = ["XU100", "USDTRY", "GRAMALTIN", "THYAO"];

function formatCardPrice(value: number | null, decimals: number) {
  if (value == null) return "—";
  return value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/** 2×2 market cards matching the reference card markup. Sparkline comes from real 1-month history. */
export async function MarketCards() {
  const assets = await prisma.asset.findMany({ where: { symbol: { in: CARD_SYMBOLS }, isActive: true } });
  const bySymbol = new Map(assets.map((a) => [a.symbol, a]));
  const ordered = CARD_SYMBOLS.map((s) => bySymbol.get(s)).filter((a): a is NonNullable<typeof a> => !!a);

  const rows = await Promise.all(
    ordered.map(async (asset) => {
      const [resolved, bars] = await Promise.all([resolveAssetPrice(asset), getAssetHistory(asset, "1m")]);
      return { asset, resolved, closes: bars.map((b) => b.close) };
    })
  );

  const pairs: (typeof rows)[] = [];
  for (let i = 0; i < rows.length; i += 2) pairs.push(rows.slice(i, i + 2));

  return (
    <div className="mt-2 flex flex-col gap-2">
      {pairs.map((pair, rowIndex) => (
        <div key={rowIndex} className="flex flex-row justify-between gap-3">
          {pair.map(({ asset, resolved, closes }) => {
            const isNegative = resolved.changePercent != null && resolved.changePercent < 0;
            const basePath = getAssetBasePath(asset.type);
            const decimals = asset.decimalPrecision ?? 2;
            const body = (
              <div className="flex min-w-0 flex-1 flex-col rounded-[12px] border border-border bg-surface px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <AssetIcon symbol={asset.symbol} type={asset.type} logoUrl={asset.logoUrl} size={20} />
                  <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-muted">{asset.name}</span>
                  <span
                    className={cn(
                      "num-tabular shrink-0 rounded-[6px] px-1.5 py-0.5 text-[10px] font-extrabold leading-none",
                      isNegative ? "bg-negative-bg text-negative" : "bg-positive-bg text-positive"
                    )}
                  >
                    {formatChangePercent(resolved.changePercent)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="num-tabular text-[16px] font-extrabold leading-none text-foreground">
                    {formatCardPrice(resolved.price, decimals)}
                  </span>
                  <div className="h-[22px] min-w-0 flex-1">
                    <Sparkline data={closes} positive={!isNegative} height={22} area strokeWidth={1.8} />
                  </div>
                </div>
              </div>
            );
            return basePath ? (
              <Link key={asset.id} href={`${basePath}/${asset.symbol}`} className="flex min-w-0 flex-1">
                {body}
              </Link>
            ) : (
              <div key={asset.id} className="flex min-w-0 flex-1">
                {body}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
