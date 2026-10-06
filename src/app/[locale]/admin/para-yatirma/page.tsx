import { prisma } from "@/lib/prisma/client";
import { AdminEmpty, AdminPageHeader, AdminPanel, AdminStatCard, relativeTime } from "@/components/admin/AdminUi";
import { CalendarDays, Clock, Hourglass, Wallet } from "lucide-react";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { RequestCard } from "@/components/admin/RequestCard";
import { approveDepositAction, rejectDepositAction } from "@/lib/wallet/admin-actions";
import { formatDateTime, formatPrice } from "@/lib/utils/format";
import { BANK_PRESETS, CRYPTO_NETWORK_PRESETS, presetFor } from "@/lib/admin/presets";

export default async function AdminDepositsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "" } = await searchParams;
  const [deposits, pendingAgg] = await Promise.all([
    prisma.deposit.findMany({
      where: status ? { status: status as "PENDING" } : {},
      include: { user: true, bankAccount: true, cryptoAddress: true },
      orderBy: [{ status: "asc" }, { requestedAt: "desc" }],
      take: 100,
    }),
    prisma.deposit.aggregate({ where: { status: "PENDING" }, _sum: { amount: true }, _count: true }),
  ]);
  const pendingTotal = Number(pendingAgg._sum.amount ?? 0);
  const [oldest, todayCount] = await Promise.all([
    prisma.deposit.findFirst({ where: { status: "PENDING" }, orderBy: { requestedAt: "asc" }, select: { requestedAt: true } }),
    prisma.deposit.count({ where: { requestedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
  ]);

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <AdminPageHeader title="Para Yatırma" description="Gelen yatırma talepleri. Dekontu ve referans kodunu hesapla karşılaştırıp onaylayın." />

      <div className="grid gap-3 md:grid-cols-4">
        <AdminStatCard icon={Clock} label="Onay bekleyen" value={String(pendingAgg._count)} hint={pendingAgg._count > 0 ? "Onayınızı bekliyor" : "Bekleyen talep yok"} tone={pendingAgg._count > 0 ? "warning" : "neutral"} />
        <AdminStatCard icon={Wallet} label="Bekleyen toplam" value={formatPrice(pendingTotal)} hint="Tüm bekleyen talepler" />
        <AdminStatCard icon={Hourglass} label="En eski bekleyen" value={oldest ? relativeTime(oldest.requestedAt) : "—"} hint={oldest ? formatDateTime(oldest.requestedAt.toISOString()) : "Kuyruk boş"} />
        <AdminStatCard icon={CalendarDays} label="Bugün gelen" value={String(todayCount)} hint="Bugün açılan talep" />
      </div>

      <AdminPanel title={`Talepler (${deposits.length})`}>
        <AdminFilters
          q=""
          status={status}
          basePath="/admin/para-yatirma"
          statuses={[
            { value: "PENDING", label: "Bekleyen" },
            { value: "COMPLETED", label: "Tamamlanan" },
            { value: "REJECTED", label: "Reddedilen" },
          ]}
        />
        {deposits.length === 0 ? (
          <AdminEmpty>Bu filtrede talep yok.</AdminEmpty>
        ) : (
          <div className="flex flex-col gap-3">
            {deposits.map((d) => {
              const isCrypto = d.method === "CRYPTO";
              const bank = presetFor(BANK_PRESETS, d.bankAccount?.bankName);
              const net = presetFor(CRYPTO_NETWORK_PRESETS, d.cryptoAddress?.network);
              return (
                <RequestCard
                  key={d.id}
                  id={d.id}
                  email={d.user.email ?? d.user.phone ?? "-"}
                  amount={formatPrice(Number(d.amount))}
                  reference={d.reference}
                  provider={
                    isCrypto
                      ? { label: `USDT · ${net.value}`, color: net.color, logoUrl: d.cryptoAddress?.logoUrl ?? net.logoUrl }
                      : { label: bank.label, color: bank.color, logoUrl: d.bankAccount?.logoUrl ?? bank.logoUrl }
                  }
                  detail={isCrypto ? (d.cryptoAddress?.address ?? "-") : (d.bankAccount?.iban ?? "-")}
                  requestedAt={formatDateTime(d.requestedAt.toISOString())}
                  status={d.status}
                  approve={approveDepositAction}
                  reject={rejectDepositAction}
                />
              );
            })}
          </div>
        )}
      </AdminPanel>
    </div>
  );
}

