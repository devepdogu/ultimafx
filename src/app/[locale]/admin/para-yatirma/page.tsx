import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentUser, ADMIN_ROLES } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { Card } from "@/components/ui/Card";
import { ReviewRequestForm } from "@/components/admin/ReviewRequestForm";
import { approveDepositAction, rejectDepositAction } from "@/lib/wallet/admin-actions";
import { formatDateTime, formatPrice } from "@/lib/utils/format";

export default async function AdminDepositsPage() {
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user) return redirect({ href: "/giris", locale });
  const isAdmin = user.roles?.some((r) => ADMIN_ROLES.includes(r as (typeof ADMIN_ROLES)[number]));
  if (!isAdmin) return redirect({ href: "/", locale });

  const t = await getTranslations("requests");
  const deposits = await prisma.deposit.findMany({
    include: { user: true },
    orderBy: [{ status: "asc" }, { requestedAt: "desc" }],
    take: 50,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-6 text-xl font-bold">{t("depositsTitle")}</h1>
      <div className="flex flex-col gap-2">
        {deposits.map((d) => (
          <Card key={d.id} className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{d.user.email}</div>
              <div className="num-tabular text-sm">{formatPrice(Number(d.amount))}</div>
              <div className="text-xs text-muted">
                {formatDateTime(d.requestedAt.toISOString())} · {d.status}
              </div>
            </div>
            {d.status === "PENDING" ? (
              <div className="flex gap-2">
                <ReviewRequestForm id={d.id} action={approveDepositAction} variant="approve" />
                <ReviewRequestForm id={d.id} action={rejectDepositAction} variant="reject" />
              </div>
            ) : (
              <span className="text-xs text-muted">{t("processed")}</span>
            )}
          </Card>
        ))}
        {deposits.length === 0 && (
          <Card>
            <p className="text-sm text-muted">{t("noDeposits")}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
