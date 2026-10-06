import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentUser, ADMIN_ROLES } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { Card } from "@/components/ui/Card";
import { AssetCreateForm, ToggleButton } from "@/components/admin/ContentForms";
import { toggleAssetActiveAction } from "@/lib/admin/content-actions";

export default async function AdminAssetsPage() {
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user) return redirect({ href: "/giris", locale });
  const isAdmin = user.roles?.some((r) => ADMIN_ROLES.includes(r as (typeof ADMIN_ROLES)[number]));
  if (!isAdmin) return redirect({ href: "/", locale });

  const assets = await prisma.asset.findMany({ orderBy: [{ type: "asc" }, { symbol: "asc" }] });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
      <h1 className="text-xl font-bold">Varlık Yönetimi</h1>

      <Card>
        <h2 className="mb-3 text-sm font-semibold">Yeni varlık ekle</h2>
        <AssetCreateForm />
      </Card>

      <div className="flex flex-col gap-2">
        {assets.map((a) => (
          <Card key={a.id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{a.symbol} · {a.name}</div>
              <div className="text-xs text-muted">
                {a.type} · {a.currency} · {a.isActive ? "Aktif" : "Pasif"} · {a.tradingEnabled ? "İşleme açık" : "İşleme kapalı"}
              </div>
            </div>
            <ToggleButton
              label={a.isActive ? "Pasifleştir" : "Aktifleştir"}
              run={toggleAssetActiveAction.bind(null, a.id)}
            />
          </Card>
        ))}
        {assets.length === 0 && (
          <Card>
            <p className="text-sm text-muted">Henüz varlık yok. Yukarıdan ekleyin.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
