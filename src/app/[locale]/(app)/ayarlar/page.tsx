import { Globe, Headset, LogOut, Trash2, UserRound } from "lucide-react";
import { requireUserForPage } from "@/lib/auth/rbac";
import { logoutAction } from "@/lib/auth/actions";
import { PageTopBar } from "@/components/ui/PageTopBar";
import { SettingsRow, SettingsSection } from "@/components/settings/SettingsRow";
import { ThemeSwitchRow } from "@/components/settings/ThemeSwitchRow";
import { NotificationSwitchRow } from "@/components/settings/NotificationSwitchRow";
import { AccountChangeRows } from "@/components/settings/AccountChangeRows";

export default async function SettingsPage() {
  await requireUserForPage();

  return (
    <div className="flex flex-col">
      <PageTopBar title="Ayarlar" backHref="/profil" />

      <div className="flex flex-col gap-6 px-4 pb-8 pt-2">
        <SettingsSection title="GÜVENLİK">
          <AccountChangeRows />
        </SettingsSection>

        <SettingsSection title="TERCİHLER">
          <ThemeSwitchRow />
          <NotificationSwitchRow />
          <SettingsRow icon={Globe} title="Platform Dili" subtitle="Türkçe" right={<span className="text-[12px] font-bold text-muted">TR</span>} disabled />
        </SettingsSection>

        <SettingsSection title="DESTEK">
          <SettingsRow icon={Headset} title="Canlı Destek" subtitle="7/24 yardım alın" disabled />
          <SettingsRow icon={UserRound} title="Profil Bilgileri" subtitle="Kişisel bilgiler ve KYC" href="/profil" />
        </SettingsSection>

        <SettingsSection title="HESAP">
          <form action={logoutAction}>
            <SettingsRow icon={LogOut} title="Çıkış Yap" danger asButton="submit" />
          </form>
          <SettingsRow icon={Trash2} title="Hesabı Sil" danger disabled />
        </SettingsSection>

        <div className="flex flex-col items-center gap-1 pt-2 text-center text-[12px] text-muted">
          <span>Ultima FX v2.1.0</span>
          <span>© 2026 Tüm hakları saklıdır</span>
        </div>
      </div>
    </div>
  );
}
