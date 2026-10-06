import { prisma } from "@/lib/prisma/client";
import { AssetEditor } from "@/components/admin/EntityEditors";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminRecord, RecordActions } from "@/components/admin/AdminRecord";
import { AdminEmpty, AdminPageHeader, AdminPanel, StatusPill } from "@/components/admin/AdminUi";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ToggleButton } from "@/components/admin/ContentForms";
import { ProviderBadge } from "@/components/admin/ProviderBadge";
import { deleteAssetAction } from "@/lib/admin/entity-actions";
import { toggleAssetActiveAction } from "@/lib/admin/content-actions";

export default async function AdminAssetsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { q = "", status = "" } = await searchParams;
  const term = q.trim();
  const assets = await prisma.asset.findMany({
    where: {
      ...(term ? { OR: [{ symbol: { contains: term.toUpperCase() } }, { name: { contains: term, mode: "insensitive" } }] } : {}),
      ...(status === "hidden" ? { isActive: false } : status === "active" ? { isActive: true } : {}),
    },
    orderBy: [{ type: "asc" }, { symbol: "asc" }],
    take: 300,
  });

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <AdminPageHeader title="Varlıklar" description="Hisse, endeks, döviz, emtia ve kripto varlıkları. Sanal işleme açık olanlar alım satım ekranında görünür." />

      <AdminPanel title="Yeni varlık ekle">
        <AssetEditor />
      </AdminPanel>

      <AdminPanel title={`Varlıklar (${assets.length})`}>
        <AdminFilters
          q={term}
          status={status}
          basePath="/admin/varliklar"
          searchPlaceholder="Sembol veya ad ara"
          statuses={[
            { value: "active", label: "Gösterilen" },
            { value: "hidden", label: "Gizli" },
          ]}
        />
        {assets.length === 0 ? (
          <AdminEmpty>Bu filtrelere uyan varlık yok.</AdminEmpty>
        ) : (
          <div className="flex flex-col gap-2">
            {assets.map((a) => (
              <AdminRecord
                key={a.id}
                summary={
                  <div className="flex items-center gap-3">
                    <ProviderBadge label={a.symbol} color="#64748B" logoUrl={a.logoUrl} size={36} />
                    <div className="flex min-w-0 flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[14px] font-bold">{a.symbol}</span>
                        <StatusPill tone="neutral">{a.type}</StatusPill>
                        {a.tradingEnabled ? <StatusPill tone="positive">İşlem açık</StatusPill> : <StatusPill tone="neutral">İşlem kapalı</StatusPill>}
                        {!a.isActive && <StatusPill tone="negative">Gizli</StatusPill>}
                      </div>
                      <span className="truncate text-[12px] text-muted">
                        {a.name} · {a.currency}
                      </span>
                    </div>
                  </div>
                }
                actions={
                  <>
                    <span className="text-[12px] text-muted">{a.isActive ? "Kullanıcılara görünüyor." : "Kullanıcılardan gizli."}</span>
                    <RecordActions>
                      <ToggleButton label={a.isActive ? "Gizle" : "Göster"} run={toggleAssetActiveAction.bind(null, a.id)} />
                      <DeleteButton label="Sil" confirmText={`${a.symbol} silinecek. İşlem geçmişi varsa silme engellenir. Emin misiniz?`} run={deleteAssetAction.bind(null, a.id)} />
                    </RecordActions>
                  </>
                }
              >
                <AssetEditor
                  asset={{ id: a.id, symbol: a.symbol, name: a.name, type: a.type, currency: a.currency, logoUrl: a.logoUrl, tradingEnabled: a.tradingEnabled }}
                />
              </AdminRecord>
            ))}
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
