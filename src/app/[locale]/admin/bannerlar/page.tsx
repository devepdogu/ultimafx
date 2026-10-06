import { prisma } from "@/lib/prisma/client";
import { ToggleButton } from "@/components/admin/ContentForms";
import { BannerEditor } from "@/components/admin/BannerEditor";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { AdminEmpty, AdminPageHeader, AdminPanel, StatusPill } from "@/components/admin/AdminUi";
import { deleteBannerAction } from "@/lib/admin/banner-actions";
import { toggleBannerAction } from "@/lib/admin/content-actions";

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({ orderBy: [{ position: "asc" }, { createdAt: "desc" }] });

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <AdminPageHeader title="Bannerlar" description="Ana sayfadaki tanıtım kartları. Küçük sıra numarası önce gösterilir." />

      <AdminPanel title="Yeni banner ekle">
        <BannerEditor />
      </AdminPanel>

      <AdminPanel title={`Tüm bannerlar (${banners.length})`}>
        {banners.length === 0 ? (
          <AdminEmpty>Henüz banner yok.</AdminEmpty>
        ) : (
          <div className="flex flex-col gap-3">
            {banners.map((b) => (
              <details key={b.id} className="group overflow-hidden rounded-xl border border-border">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                  <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-bold">{b.title}</span>
                      {b.isActive ? <StatusPill tone="positive">Yayında</StatusPill> : <StatusPill tone="neutral">Gizli</StatusPill>}
                    </div>
                    <span className="truncate text-[12px] text-muted">Sıra {b.position}</span>
                  </div>
                  <span className="text-[12px] font-semibold text-foreground/70 group-open:hidden">Düzenle</span>
                  <span className="hidden text-[12px] font-semibold text-foreground/70 group-open:inline">Kapat</span>
                </summary>
                <div className="flex flex-col gap-4 border-t border-border px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg bg-surface-2 px-4 py-3">
                    <span className="text-[12px] text-muted">{b.isActive ? "Ana sayfada görünüyor." : "Ana sayfada gizli."}</span>
                    <div className="flex items-start gap-2">
                      <ToggleButton label={b.isActive ? "Gizle" : "Yayına al"} run={toggleBannerAction.bind(null, b.id)} />
                      <DeleteButton label="Sil" confirmText="Bu banner kalıcı olarak silinecek. Emin misiniz?" run={deleteBannerAction.bind(null, b.id)} />
                    </div>
                  </div>
                  <BannerEditor
                    banner={{ id: b.id, title: b.title, subtitle: b.subtitle, imageUrl: b.imageUrl, linkUrl: b.linkUrl, position: b.position }}
                  />
                </div>
              </details>
            ))}
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
