import { ArrowDownLeft, ArrowUpRight, Banknote, RefreshCcw } from "lucide-react";
import { formatDateTime, formatPrice } from "@/lib/utils/format";
import type { WalletTransaction, WalletTransactionType } from "@prisma/client";

const ICONS: Record<WalletTransactionType, typeof ArrowDownLeft> = {
  DEPOSIT: ArrowDownLeft,
  WITHDRAWAL: ArrowUpRight,
  ADJUSTMENT: RefreshCcw,
  FEE: RefreshCcw,
  REFUND: ArrowDownLeft,
  TRANSFER: RefreshCcw,
  TRADE_BUY: Banknote,
  TRADE_SELL: Banknote,
};

export function RecentActivity({ transactions }: { transactions: WalletTransaction[] }) {
  return (
    <ul className="flex flex-col">
      {transactions.map((tx, i) => {
        const Icon = ICONS[tx.type];
        const amount = Number(tx.amount);
        const isLast = i === transactions.length - 1;
        return (
          <li key={tx.id} className="relative flex gap-3 pb-5">
            {!isLast && (
              <span className="absolute left-4 top-9 h-[calc(100%-2rem)] w-px bg-border" />
            )}
            <span
              className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                amount < 0 ? "bg-negative-bg text-negative" : "bg-positive-bg text-positive"
              }`}
            >
              <Icon size={15} />
            </span>
            <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{tx.description ?? tx.type}</div>
                <div className="text-xs text-muted">
                  {formatDateTime(tx.createdAt.toISOString())}
                </div>
              </div>
              <div
                className={`num-tabular shrink-0 text-sm font-semibold ${
                  amount < 0 ? "text-negative" : "text-positive"
                }`}
              >
                {formatPrice(amount)}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
