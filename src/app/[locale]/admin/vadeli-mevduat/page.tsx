import { CircleCheck, CircleX } from "lucide-react";
import { prisma } from "@/lib/prisma/client";
import { Link } from "@/i18n/navigation";
import { getInterestConfig } from "@/lib/interest/config";
import { AdminEmpty, AdminPageHeader, AdminPanel, AdminStatCard } from "@/components/admin/AdminUi";
import { formatDateTime } from "@/lib/utils/format";

const num = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function userLabel(u: { name: string | null; phone: string | null }) {
  return u.name ?? u.phone ?? "İsimsiz kullanıcı";
}

export default async function AdminInterestDashboardPage() {
  const [config, active, settled] = await Promise.all([
    getInterestConfig(),
    prisma.termDepositAccount.findMany({
      where: { status: "ACTIVE" },
      include: { user: { select: { id: true, name: true, phone: true } } },
      orderBy: { maturesAt: "asc" },
      take: 100,
    }),
    prisma.termDepositAccount.findMany({
      where: { status: "MATURED" },
      include: { user: { select: { id: true, name: true, phone: true } } },
      orderBy: { settledAt: "desc" },
      take: 100,
    }),
  ]);

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <AdminPageHeader
        title="Faiz Yönetimi"
        description="Vadeli mevduat oranları + dağıtım kuralları."
        actions={
          <Link href="/admin/vadeli-mevduat/ayarlar" className="flex h-9 items-center rounded-lg bg-brand px-3 text-[12px] font-bold text-brand-foreground">
            Faiz Konfigürasyonu
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <AdminStatCard icon={CircleCheck} label="TRY (₺) Yıllık" value={`%${num.format(config.tryAnnualRate)}`} hint={`aylık ≈ %${num.format(config.tryAnnualRate / 12)}`} />
        <AdminStatCard icon={CircleCheck} label="USDT ($) Yıllık" value={`%${num.format(config.usdAnnualRate)}`} hint={`aylık ≈ %${num.format(config.usdAnnualRate / 12)}`} />
        <AdminStatCard
          icon={config.autoDistribute ? CircleCheck : CircleX}
          label="Otomatik Dağıtım"
          value={config.autoDistribute ? "AÇIK" : "KAPALI"}
          hint="vadesi dolanlar yatırılır"
          tone={config.autoDistribute ? "neutral" : "warning"}
        />
      </div>

      <AdminPanel title={`Aktif Vadeli Mevduatlar (${active.length})`}>
        {active.length === 0 ? (
          <AdminEmpty>Açık vadeli mevduat yok.</AdminEmpty>
        ) : (
          <div className="flex flex-col gap-2">
            {active.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface p-3.5">
                <div className="flex flex-col gap-0.5">
                  <Link href={`/admin/kullanicilar/${a.userId}`} className="text-[13px] font-bold text-brand">
                    {userLabel(a.user)}
                  </Link>
                  <span className="num-tabular text-[12px] text-muted">
                    {num.format(Number(a.principal))} {a.currency} · %{num.format(Number(a.annualRate))} yıllık · {a.termDays} gün
                  </span>
                </div>
                <span className="text-[11px] text-muted">Vade: {formatDateTime(a.maturesAt.toISOString())}</span>
              </div>
            ))}
          </div>
        )}
      </AdminPanel>

      <AdminPanel title="Dağıtılmış / Çekilmiş Yatırımlar">
        {settled.length === 0 ? (
          <AdminEmpty>Henüz vadesi dolmuş bir mevduat yok.</AdminEmpty>
        ) : (
          <div className="flex flex-col gap-2">
            {settled.map((a) => {
              const principal = Number(a.principal);
              const interest = Number(a.interest);
              return (
                <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface p-3.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-bold">{num.format(principal)} {a.currency}</span>
                    <span className="num-tabular text-[12px] text-muted">
                      Kazanılan: +{num.format(interest)} | Toplam: {num.format(principal + interest)}
                    </span>
                  </div>
                  <Link href={`/admin/kullanicilar/${a.userId}`} className="text-[12px] font-bold text-brand">
                    ↩ {userLabel(a.user)}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
