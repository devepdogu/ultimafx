import type { ReactNode } from "react";
import { AssetIcon } from "@/components/market/AssetIcon";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import { formatChangePercent } from "@/lib/utils/format";
import type { AssetType } from "@prisma/client";

export interface AssetRowData {
  id: string;
  symbol: string;
  name: string;
  type: AssetType;
  currency: string;
  logoUrl?: string | null;
  price: number | null;
  change?: number | null;
  changePercent: number | null;
}

const priceFormatter = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function formatRowPrice(value: number | null, currency: string) {
  if (value == null) return "—";
  const formatted = priceFormatter.format(value);
  if (currency === "TRY") return `${formatted}₺`;
  return `${formatted} ${currency}`;
}

export function AssetRow({
  asset,
  href,
  trailing,
  showChangeAmount = true,
}: {
  asset: AssetRowData;
  href?: string;
  trailing?: ReactNode;
  showChangeAmount?: boolean;
}) {
  const isNegative = asset.changePercent != null && asset.changePercent < 0;
  const changeAmount =
    asset.change == null ? null : `${asset.change > 0 ? "+" : ""}${priceFormatter.format(asset.change)}`;

  const content = (
    <div className="flex items-center border-b border-[#C4D3E5] px-4 py-3">
      <AssetIcon symbol={asset.symbol} type={asset.type} logoUrl={asset.logoUrl} size={36} className="mr-2.5" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-bold leading-[18px] text-foreground">{asset.name}</div>
        <div className="truncate text-[10px] leading-[14px] text-muted">{asset.symbol}</div>
      </div>
      <div className="num-tabular ml-2 whitespace-nowrap text-[14px] font-semibold text-foreground">
        {formatRowPrice(asset.price, asset.currency)}
      </div>
      <span
        className={cn(
          "num-tabular ml-2 whitespace-nowrap rounded-[6px] px-2 py-[5px] text-[12px] font-semibold leading-none text-white",
          isNegative ? "bg-negative" : "bg-[#10B981]"
        )}
      >
        {formatChangePercent(asset.changePercent)}
      </span>
      {showChangeAmount && changeAmount && (
        <span
          className={cn(
            "num-tabular ml-1.5 whitespace-nowrap rounded-[6px] border px-1.5 py-1 text-[12px] font-semibold leading-none",
            isNegative ? "border-negative/40 text-negative" : "border-[#10B981]/40 text-[#10B981]"
          )}
        >
          {changeAmount}
        </span>
      )}
      {trailing}
    </div>
  );

  return href ? <Link href={href} className="block">{content}</Link> : content;
}
