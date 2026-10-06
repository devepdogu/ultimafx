import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentUser, ADMIN_ROLES } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { Card } from "@/components/ui/Card";
import { FundCreateForm, ToggleButton } from "@/components/admin/ContentForms";
import { toggleInvestmentFundAction } from "@/lib/admin/content-actions";

export default async function AdminFundsPage() {
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user) return redirect({ href: "/giris", locale });
  const isAdmin = user.roles?.some((r) => ADMIN_ROLES.includes(r as (typeof ADMIN_ROLES)[number]));
  if (!isAdmin) return redirect({ href: "/", locale });

  const funds = await prisma.investmentFund.findMany({ orderBy: [{ position: "asc" }, { createdAt: "desc" }] });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
      <h1 className="text-xl font-bold">Yatırım Fonları</h1>

      <Card>
        <h2 className="mb-3 text-sm font-semibold">Yeni fon ekle</h2>
        <FundCreateForm />
      </Card>

      <div className="flex flex-col gap-2">
        {funds.map((f) => (
          <Card key={f.id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{f.name}</div>
              <div className="truncate text-xs text-muted">
                {f.companyName} · {f.category} · Risk {f.risk}/7 · Sıra {f.position} · {f.isActive ? "Yayında" : "Taslak"}
              </div>
            </div>
            <ToggleButton
              label={f.isActive ? "Yayından kaldır" : "Yayınla"}
              run={toggleInvestmentFundAction.bind(null, f.id)}
            />
          </Card>
        ))}
        {funds.length === 0 && (
          <Card>
            <p className="text-sm text-muted">Henüz fon yok. Eklenen fonlar /fonlar sayfasında yayınlanır.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
