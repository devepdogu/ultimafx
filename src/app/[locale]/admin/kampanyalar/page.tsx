import { prisma } from "@/lib/prisma/client";
import { CampaignEditor } from "@/components/admin/CampaignEditor";
import { ToggleButton } from "@/components/admin/ContentForms";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteCampaignAction, toggleCampaignAction } from "@/lib/admin/campaign-actions";

const STATUS_LABEL: Record<string, string> = { ACTIVE: "Aktif", UPCOMING: "Yakında", ENDED: "Sona erdi" };

export default async function AdminCampaignsPage() {
  const campaigns = await prisma.campaign.findMany({ orderBy: [{ position: "asc" }, { createdAt: "asc" }] });

  return (
    <div className="flex max-w-5xl flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-[24px] font-extrabold tracking-tight">Kampanyalar</h1>
        <p className="text-[13px] text-muted">
          Kullanıcıların Kampanyalar sayfasında gördüğü kartlar. Bir kampanyayı düzenlemek için satırını açın.
        </p>
      </header>

      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-[15px] font-bold">Yeni kampanya</h2>
        <CampaignEditor />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[12px] font-bold uppercase tracking-wide text-muted">Tüm kampanyalar ({campaigns.length})</h2>
        {campaigns.map((c) => (
          <details key={c.id} className="group overflow-hidden rounded-2xl border border-border bg-surface">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[14px] font-bold">{c.title}</span>
                  {c.isFeatured && <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] font-extrabold text-background">ÖNE ÇIKAN</span>}
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-bold text-muted">{STATUS_LABEL[c.status]}</span>
                  {!c.isActive && <span className="rounded-full bg-negative-bg px-2 py-0.5 text-[10px] font-bold text-negative">GİZLİ</span>}
                </div>
                <span className="truncate text-[12px] text-muted">
                  {c.category} · {c.rewardLabel} · sıra {c.position}
                </span>
              </div>
              <span className="text-[12px] font-semibold text-brand group-open:hidden">Düzenle</span>
              <span className="hidden text-[12px] font-semibold text-muted group-open:inline">Kapat</span>
            </summary>
            <div className="flex flex-col gap-5 border-t border-border px-5 py-5">
              <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-2 px-4 py-3">
                <span className="text-[12px] text-muted">
                  {c.isActive ? "Kullanıcılara görünüyor." : "Kullanıcılardan gizli. Kayıt silinmez."}
                </span>
                <div className="flex items-start gap-2">
                  <ToggleButton label={c.isActive ? "Gizle" : "Yayına al"} run={toggleCampaignAction.bind(null, c.id)} />
                  <DeleteButton label="Sil" confirmText="Bu kampanya kalıcı olarak silinecek. Emin misiniz?" run={deleteCampaignAction.bind(null, c.id)} />
                </div>
              </div>
              <CampaignEditor
                campaign={{
                  id: c.id,
                  title: c.title,
                  tagline: c.tagline,
                  description: c.description,
                  rewardLabel: c.rewardLabel,
                  category: c.category,
                  status: c.status,
                  isFeatured: c.isFeatured,
                  position: c.position,
                }}
              />
            </div>
          </details>
        ))}
      </section>
    </div>
  );
}
