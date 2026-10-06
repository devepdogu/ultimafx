import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { getCurrentUser, ADMIN_ROLES } from "@/lib/auth/rbac";
import { Card } from "@/components/ui/Card";

const SECTIONS = [
  { key: "dashboard", href: null },
  { key: "users", href: null },
  { key: "markets", href: null },
  { key: "stocks", href: "/admin/varliklar" },
  { key: "indices", href: "/admin/varliklar" },
  { key: "funds", href: null },
  { key: "fx", href: null },
  { key: "gold", href: null },
  { key: "commodities", href: null },
  { key: "crypto", href: null },
  { key: "ipos", href: null },
  { key: "dividends", href: null },
  { key: "corporateActions", href: null },
  { key: "news", href: "/admin/haberler" },
  { key: "banners", href: "/admin/bannerlar" },
  { key: "funds", href: "/admin/fonlar" },
  { key: "siteSettings", href: "/admin/site" },
  { key: "kap", href: null },
  { key: "notifications", href: null },
  { key: "dataProviders", href: null },
  { key: "bankInfo", href: null },
  { key: "deposits", href: "/admin/para-yatirma" },
  { key: "withdrawals", href: "/admin/para-cekme" },
  { key: "orders", href: null },
  { key: "portfolios", href: null },
  { key: "auditLog", href: null },
  { key: "systemSettings", href: null },
] as const;

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user) return redirect({ href: "/giris", locale });

  const isAdmin = user.roles?.some((r) =>
    ADMIN_ROLES.includes(r as (typeof ADMIN_ROLES)[number])
  );
  if (!isAdmin) return redirect({ href: "/", locale });

  const t = await getTranslations("admin");

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-6 text-xl font-bold">{t("dashboard")}</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {SECTIONS.map((section) =>
          section.href ? (
            <Link key={section.key} href={section.href}>
              <Card className="text-sm font-medium hover:border-brand/50">{t(section.key)}</Card>
            </Link>
          ) : (
            <Card key={section.key} className="text-sm font-medium opacity-60">
              {t(section.key)}
            </Card>
          )
        )}
      </div>
    </div>
  );
}
