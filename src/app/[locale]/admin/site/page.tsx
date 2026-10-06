import { getSiteSettings } from "@/lib/site/settings";
import { SiteSettingsForm } from "@/components/admin/ContentForms";
import { AdminPageHeader, AdminPanel } from "@/components/admin/AdminUi";

export default async function AdminSitePage() {
  const settings = await getSiteSettings();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <AdminPageHeader title="Site Ayarları" description="Uygulamanın adı ve logosu. Değişiklik bir sonraki sayfa yüklemesinde herkese görünür." />
      <AdminPanel title="Marka">
        <SiteSettingsForm siteName={settings.siteName} logoUrl={settings.logoUrl ?? ""} />
      </AdminPanel>
    </div>
  );
}
