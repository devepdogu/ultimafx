import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentUser, ADMIN_ROLES } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { Card } from "@/components/ui/Card";
import { BannerCreateForm, ToggleButton } from "@/components/admin/ContentForms";
import { toggleBannerAction } from "@/lib/admin/content-actions";

export default async function AdminBannersPage() {
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user) return redirect({ href: "/giris", locale });
  const isAdmin = user.roles?.some((r) => ADMIN_ROLES.includes(r as (typeof ADMIN_ROLES)[number]));
  if (!isAdmin) return redirect({ href: "/", locale });

  const banners = await prisma.banner.findMany({ orderBy: [{ position: "asc" }, { createdAt: "desc" }] });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
      <h1 className="text-xl font-bold">Ana Sayfa Bannerları</h1>

      <Card>
        <h2 className="mb-3 text-sm font-semibold">Yeni banner ekle</h2>
        <BannerCreateForm />
      </Card>

      <div className="flex flex-col gap-2">
        {banners.map((b) => (
          <Card key={b.id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{b.title}</div>
              <div className="truncate text-xs text-muted">
                Sıra {b.position} · {b.isActive ? "Yayında" : "Taslak"}
                {b.subtitle ? ` · ${b.subtitle}` : ""}
              </div>
            </div>
            <ToggleButton
              label={b.isActive ? "Yayından kaldır" : "Yayınla"}
              run={toggleBannerAction.bind(null, b.id)}
            />
          </Card>
        ))}
        {banners.length === 0 && (
          <Card>
            <p className="text-sm text-muted">Henüz banner yok. Ana sayfada banner alanı gizli kalır.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
