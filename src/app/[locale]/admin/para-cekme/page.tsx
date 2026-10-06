import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentUser, ADMIN_ROLES } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { Card } from "@/components/ui/Card";
import { ReviewRequestForm } from "@/components/admin/ReviewRequestForm";
import { approveWithdrawalAction, rejectWithdrawalAction } from "@/lib/wallet/admin-actions";
import { formatDateTime, formatPrice } from "@/lib/utils/format";

export default async function AdminWithdrawalsPage() {
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user) return redirect({ href: "/giris", locale });
  const isAdmin = user.roles?.some((r) => ADMIN_ROLES.includes(r as (typeof ADMIN_ROLES)[number]));
  if (!isAdmin) return redirect({ href: "/", locale });

  const t = await getTranslations("requests");
  const withdrawals = await prisma.withdrawal.findMany({
    include: { user: true },
    orderBy: [{ status: "asc" }, { requestedAt: "desc" }],
    take: 50,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-6 text-xl font-bold">{t("withdrawalsTitle")}</h1>
      <div className="flex flex-col gap-2">
        {withdrawals.map((w) => (
          <Card key={w.id} className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{w.user.email}</div>
              <div className="num-tabular text-sm">{formatPrice(Number(w.amount))}</div>
              <div className="text-xs text-muted">
                {w.destinationBankName} · {w.destinationIban} · {w.destinationAccountHolder}
              </div>
              <div className="text-xs text-muted">
                {formatDateTime(w.requestedAt.toISOString())} · {w.status}
              </div>
            </div>
            {w.status === "PENDING" ? (
              <div className="flex gap-2">
                <ReviewRequestForm id={w.id} action={approveWithdrawalAction} variant="approve" />
                <ReviewRequestForm id={w.id} action={rejectWithdrawalAction} variant="reject" />
              </div>
            ) : (
              <span className="text-xs text-muted">{t("processed")}</span>
            )}
          </Card>
        ))}
        {withdrawals.length === 0 && (
          <Card>
            <p className="text-sm text-muted">{t("noWithdrawals")}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
