import { getTranslations } from "next-intl/server";
import { requireUserForPage } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { Card } from "@/components/ui/Card";
import { DepositRequestForm } from "@/components/wallet/DepositRequestForm";
import { WithdrawalRequestForm } from "@/components/wallet/WithdrawalRequestForm";
import { formatDateTime, formatPrice } from "@/lib/utils/format";

export default async function WalletPage() {
  const t = await getTranslations("wallet");
  const tr = await getTranslations("requests");
  const user = await requireUserForPage();

  const statusLabels: Record<string, string> = {
    PENDING: tr("pending"),
    COMPLETED: tr("completed"),
    REJECTED: tr("rejected"),
    APPROVED: tr("completed"),
    CANCELLED: tr("cancelled"),
  };

  const [wallet, transactions, deposits, withdrawals] = await Promise.all([
    prisma.wallet.findUnique({ where: { userId: user.id } }),
    prisma.walletTransaction.findMany({
      where: { wallet: { userId: user.id } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.deposit.findMany({ where: { userId: user.id }, orderBy: { requestedAt: "desc" }, take: 5 }),
    prisma.withdrawal.findMany({ where: { userId: user.id }, orderBy: { requestedAt: "desc" }, take: 5 }),
  ]);

  return (
    <div className=" px-4 py-6">
      <h1 className="mb-6 text-xl font-bold">{t("title")}</h1>

      <Card className="mb-4">
        <div className="text-sm text-muted">{t("cashBalance")}</div>
        <div className="num-tabular text-2xl font-bold">
          {formatPrice(wallet ? Number(wallet.cashBalance) : 0)}
        </div>
        {wallet && Number(wallet.pendingBalance) > 0 && (
          <div className="mt-1 text-xs text-muted">
            {t("pendingBalance")}: {formatPrice(Number(wallet.pendingBalance))}
          </div>
        )}
      </Card>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold">{t("deposit")}</h2>
          <DepositRequestForm />
        </Card>
        <Card>
          <h2 className="mb-3 text-sm font-semibold">{t("withdraw")}</h2>
          <WithdrawalRequestForm />
        </Card>
      </div>

      {(deposits.length > 0 || withdrawals.length > 0) && (
        <Card className="mb-4">
          <h2 className="mb-3 text-sm font-semibold">{t("requests")}</h2>
          <div className="flex flex-col gap-2 text-sm">
            {deposits.map((d) => (
              <div key={d.id} className="flex items-center justify-between">
                <span>
                  {t("deposit")} · {formatPrice(Number(d.amount))}
                </span>
                <span className="text-xs text-muted">{statusLabels[d.status]}</span>
              </div>
            ))}
            {withdrawals.map((w) => (
              <div key={w.id} className="flex items-center justify-between">
                <span>
                  {t("withdraw")} · {formatPrice(Number(w.amount))}
                </span>
                <span className="text-xs text-muted">{statusLabels[w.status]}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <h2 className="mb-2 text-sm font-semibold text-muted">{t("transactionHistory")}</h2>
      {transactions.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">{t("noTransactions")}</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {transactions.map((tx) => (
            <Card key={tx.id} className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm font-medium">{tx.description ?? tx.type}</div>
                <div className="text-xs text-muted">{formatDateTime(tx.createdAt.toISOString())}</div>
              </div>
              <div
                className={`num-tabular text-sm font-semibold ${Number(tx.amount) < 0 ? "text-negative" : "text-positive"}`}
              >
                {formatPrice(Number(tx.amount))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
