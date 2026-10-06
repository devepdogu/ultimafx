import { prisma } from "@/lib/prisma/client";
import { ToggleButton } from "@/components/admin/ContentForms";
import { IpoEditor } from "@/components/admin/EntityEditors";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminRecord, RecordActions } from "@/components/admin/AdminRecord";
import { AdminEmpty, AdminPageHeader, AdminPanel, StatusPill, type PillTone } from "@/components/admin/AdminUi";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteIpoAction } from "@/lib/admin/entity-actions";
import { refreshIposAction, toggleIpoPublishedAction } from "@/lib/admin/feed-actions";

const STATUS: Record<string, { label: string; tone: PillTone }> = {
  UPCOMING: { label: "Yakında", tone: "warning" },
  ACTIVE: { label: "Talep toplanıyor", tone: "positive" },
  COMPLETED: { label: "Tamamlandı", tone: "neutral" },
  CANCELLED: { label: "İptal", tone: "negative" },
};

export default async function AdminIposPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { q = "", status = "" } = await searchParams;
  const term = q.trim();
  const ipos = await prisma.iPO.findMany({
    where: {
      ...(term ? { OR: [{ code: { contains: term.toUpperCase() } }, { companyName: { contains: term, mode: "insensitive" } }] } : {}),
      ...(status ? { status: status as "UPCOMING" | "ACTIVE" | "COMPLETED" | "CANCELLED" } : {}),
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 300,
  });

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <AdminPageHeader
        title="Halka Arz"
        description="Halka arz listesi. Kaynaktan çekilenler yayında başlar; gizlenenler kullanıcılara görünmez."
        actions={<ToggleButton label="Kaynaktan güncelle" variant="primary" run={refreshIposAction} />}
      />

      <AdminPanel title="Manuel halka arz ekle" description="Kaynakta olmayan bir halka arzı elle eklemek için.">
        <IpoEditor />
      </AdminPanel>

      <AdminPanel title={`Halka arzlar (${ipos.length})`}>
        <AdminFilters
          q={term}
          status={status}
          basePath="/admin/halka-arz"
          searchPlaceholder="Kod veya şirket adı ara"
          statuses={Object.entries(STATUS).map(([value, s]) => ({ value, label: s.label }))}
        />
        {ipos.length === 0 ? (
          <AdminEmpty>Bu filtrelere uyan halka arz yok.</AdminEmpty>
        ) : (
          <div className="flex flex-col gap-2">
            {ipos.map((ipo) => {
              const st = STATUS[ipo.status] ?? { label: ipo.status, tone: "neutral" as PillTone };
              return (
                <AdminRecord
                  key={ipo.id}
                  summary={
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[14px] font-bold">{ipo.code}</span>
                        <StatusPill tone={st.tone}>{st.label}</StatusPill>
                        {ipo.isPublished ? <StatusPill tone="positive">Yayında</StatusPill> : <StatusPill tone="neutral">Gizli</StatusPill>}
                      </div>
                      <span className="truncate text-[12px] text-muted">{ipo.companyName}</span>
                    </div>
                  }
                  actions={
                    <>
                      <span className="text-[12px] text-muted">{ipo.isPublished ? "Halka arz listesinde görünüyor." : "Listede gizli."}</span>
                      <RecordActions>
                        <ToggleButton label={ipo.isPublished ? "Yayından kaldır" : "Yayınla"} run={toggleIpoPublishedAction.bind(null, ipo.id)} />
                        <DeleteButton label="Sil" confirmText={`${ipo.code} silinecek. Emin misiniz?`} run={deleteIpoAction.bind(null, ipo.id)} />
                      </RecordActions>
                    </>
                  }
                >
                  <IpoEditor
                    ipo={{
                      id: ipo.id,
                      code: ipo.code,
                      companyName: ipo.companyName,
                      market: ipo.market,
                      status: ipo.status,
                      ipoPriceMin: ipo.ipoPriceMin == null ? null : Number(ipo.ipoPriceMin),
                      ipoPriceMax: ipo.ipoPriceMax == null ? null : Number(ipo.ipoPriceMax),
                      demandCollectionStart: ipo.demandCollectionStart?.toISOString() ?? null,
                      demandCollectionEnd: ipo.demandCollectionEnd?.toISOString() ?? null,
                      officialSourceUrl: ipo.officialSourceUrl,
                    }}
                  />
                </AdminRecord>
              );
            })}
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
