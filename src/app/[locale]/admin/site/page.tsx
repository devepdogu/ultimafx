import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentUser, ADMIN_ROLES } from "@/lib/auth/rbac";
import { getSiteSettings } from "@/lib/site/settings";
import { Card } from "@/components/ui/Card";
import { SiteSettingsForm } from "@/components/admin/ContentForms";

export default async function AdminSitePage() {
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user) return redirect({ href: "/giris", locale });
  const isAdmin = user.roles?.some((r) => ADMIN_ROLES.includes(r as (typeof ADMIN_ROLES)[number]));
  if (!isAdmin) return redirect({ href: "/", locale });

  const settings = await getSiteSettings();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
      <h1 className="text-xl font-bold">Site Ayarları</h1>
      <Card>
        <h2 className="mb-3 text-sm font-semibold">Site adı ve logo</h2>
        <SiteSettingsForm siteName={settings.siteName} logoUrl={settings.logoUrl ?? ""} />
      </Card>
    </div>
  );
}
