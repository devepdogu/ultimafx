import { prisma } from "@/lib/prisma/client";
import { AdminEmpty, AdminPageHeader, AdminPanel, AdminStatCard, relativeTime } from "@/components/admin/AdminUi";
import { CalendarDays, Clock, Hourglass, Wallet } from "lucide-react";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { RequestCard } from "@/components/admin/RequestCard";
import { approveWithdrawalAction, rejectWithdrawalAction } from "@/lib/wallet/admin-actions";
import { formatDateTime, formatPrice } from "@/lib/utils/format";
import { BANK_PRESETS, CRYPTO_NETWORK_PRESETS, presetFor } from "@/lib/admin/presets";

export default async function AdminWithdrawalsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "" } = await searchParams;
  const [withdrawals, pendingAgg] = await Promise.all([
    prisma.withdrawal.findMany({
      where: status ? { status: status as "PENDING" } : {},
      include: { user: true },
      orderBy: [{ status: "asc" }, { requestedAt: "desc" }],
      take: 100,
    }),
    prisma.withdrawal.aggregate({ where: { status: "PENDING" }, _sum: { amount: true }, _count: true }),
  ]);
  const pendingTotal = Number(pendingAgg._sum.amount ?? 0);
  const [oldest, todayCount] = await Promise.all([
    prisma.withdrawal.findFirst({ where: { status: "PENDING" }, orderBy: { requestedAt: "asc" }, select: { requestedAt: true } }),
    prisma.withdrawal.count({ where: { requestedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
  ]);

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <AdminPageHeader title="Para Çekme" description="Çekme talepleri. Onaylamadan önce hedef hesabı ve tutarı kontrol edin." />

      <div className="grid gap-3 md:grid-cols-4">
        <AdminStatCard icon={Clock} label="Onay bekleyen" value={String(pendingAgg._count)} hint={pendingAgg._count > 0 ? "Onayınızı bekliyor" : "Bekleyen talep yok"} tone={pendingAgg._count > 0 ? "warning" : "neutral"} />
        <AdminStatCard icon={Wallet} label="Ödenecek toplam" value={formatPrice(pendingTotal)} hint="Tüm bekleyen talepler" />
        <AdminStatCard icon={Hourglass} label="En eski bekleyen" value={oldest ? relativeTime(oldest.requestedAt) : "—"} hint={oldest ? formatDateTime(oldest.requestedAt.toISOString()) : "Kuyruk boş"} />
        <AdminStatCard icon={CalendarDays} label="Bugün gelen" value={String(todayCount)} hint="Bugün açılan talep" />
      </div>

      <AdminPanel title={`Talepler (${withdrawals.length})`}>
        <AdminFilters
          q=""
          status={status}
          basePath="/admin/para-cekme"
          statuses={[
            { value: "PENDING", label: "Bekleyen" },
            { value: "COMPLETED", label: "Tamamlanan" },
            { value: "REJECTED", label: "Reddedilen" },
          ]}
        />
        {withdrawals.length === 0 ? (
          <AdminEmpty>Bu filtrede talep yok.</AdminEmpty>
        ) : (
          <div className="flex flex-col gap-3">
            {withdrawals.map((w) => {
              const isCrypto = w.method === "CRYPTO";
              const bank = presetFor(BANK_PRESETS, w.destinationBankName);
              const net = presetFor(CRYPTO_NETWORK_PRESETS, w.destinationNetwork);
              return (
                <RequestCard
                  key={w.id}
                  id={w.id}
                  email={w.user.email ?? w.user.phone ?? "-"}
                  amount={formatPrice(Number(w.amount))}
                  reference={w.reference}
                  provider={isCrypto ? { label: `USDT · ${net.value}`, color: net.color, logoUrl: net.logoUrl } : { label: bank.label, color: bank.color, logoUrl: bank.logoUrl }}
                  detail={
                    isCrypto
                      ? (w.destinationAddress ?? "-")
                      : [w.destinationIban, w.destinationAccountHolder].filter(Boolean).join(" · ") || "-"
                  }
                  requestedAt={formatDateTime(w.requestedAt.toISOString())}
                  status={w.status}
                  approve={approveWithdrawalAction}
                  reject={rejectWithdrawalAction}
                />
              );
            })}
          </div>
        )}
      </AdminPanel>
    </div>
  );
}

