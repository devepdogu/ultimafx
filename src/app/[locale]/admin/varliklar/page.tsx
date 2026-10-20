import { prisma } from "@/lib/prisma/client";
import { AssetEditor, ManualAssetPriceForm } from "@/components/admin/EntityEditors";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminRecord, RecordActions } from "@/components/admin/AdminRecord";
import { AdminEmpty, AdminPageHeader, AdminPanel, StatusPill } from "@/components/admin/AdminUi";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ToggleButton } from "@/components/admin/ContentForms";
import { ProviderBadge } from "@/components/admin/ProviderBadge";
import { deleteAssetAction } from "@/lib/admin/entity-actions";
import { toggleAssetActiveAction } from "@/lib/admin/content-actions";

const TYPE_LABEL: Record<string, string> = {
  STOCK: "BIST hisse",
  US_STOCK: "Nasdaq / ABD hisse",
  INDEX: "Endeks",
  CURRENCY: "Parite",
  COMMODITY: "Emtia",
  CRYPTO: "Kripto",
  FUND: "Fon",
};

export default async function AdminAssetsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; type?: string }> }) {
  const { q = "", status = "", type = "" } = await searchParams;
  const term = q.trim();
  const assets = await prisma.asset.findMany({
    where: {
      ...(term ? { OR: [{ symbol: { contains: term.toUpperCase() } }, { name: { contains: term, mode: "insensitive" } }] } : {}),
      ...(status === "hidden" ? { isActive: false } : status === "active" ? { isActive: true } : {}),
      ...(type ? { type: type as "STOCK" | "US_STOCK" | "INDEX" | "CURRENCY" | "COMMODITY" | "CRYPTO" | "FUND" } : {}),
    },
    orderBy: [{ isCustom: "desc" }, { type: "asc" }, { symbol: "asc" }],
    take: 300,
  });

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <AdminPageHeader title="Varlıklar" description="Hisse, endeks, döviz, emtia ve kripto varlıkları. Sanal işleme açık olanlar alım satım ekranında görünür." />

      <AdminPanel title="Yeni varlık ekle" description="Kripto eklerken birim fiyatı CoinGecko'dan gerçek zamanlı çekilir.">
        <AssetEditor />
      </AdminPanel>

      <AdminPanel title={`Varlıklar (${assets.length})`}>
        <div className="flex flex-col gap-3">
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
          <div className="flex flex-wrap gap-1.5">
            {[{ value: "", label: "Tüm türler" }, ...Object.entries(TYPE_LABEL).map(([value, label]) => ({ value, label }))].map((t) => (
              <a
                key={t.value || "all"}
                href={`/admin/varliklar?${new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}), ...(t.value ? { type: t.value } : {}) }).toString()}`}
                className={
                  (type === t.value ? "border-foreground bg-foreground text-background" : "border-border text-foreground/70 hover:border-foreground/40") +
                  " rounded-full border px-3 py-1.5 text-[12px] font-bold"
                }
              >
                {t.label}
              </a>
            ))}
          </div>
        </div>
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
                        <StatusPill tone="neutral">{TYPE_LABEL[a.type] ?? a.type}</StatusPill>
                        {a.tradingEnabled ? <StatusPill tone="positive">İşlem açık</StatusPill> : <StatusPill tone="neutral">İşlem kapalı</StatusPill>}
                        {!a.isActive && <StatusPill tone="negative">Gizli</StatusPill>}
                        {a.type === "CRYPTO" && !a.coingeckoId && <StatusPill tone="warning">Coin id eksik</StatusPill>}
                        {a.isCustom && <StatusPill tone="neutral">Manuel fiyat</StatusPill>}
                      </div>
                      <span className="truncate text-[12px] text-muted">
                        {a.name} · {a.currency}
                        {a.type === "CRYPTO" && a.coingeckoId && ` · ${a.coingeckoId}`}
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
                <div className="flex flex-col gap-4">
                  <AssetEditor
                    asset={{
                      id: a.id,
                      symbol: a.symbol,
                      name: a.name,
                      type: a.type,
                      currency: a.currency,
                      logoUrl: a.logoUrl,
                      tradingEnabled: a.tradingEnabled,
                      coingeckoId: a.coingeckoId,
                      isCustom: a.isCustom,
                      manualBasePrice: a.manualBasePrice != null ? Number(a.manualBasePrice) : null,
                      manualBandPercent: a.manualBandPercent != null ? Number(a.manualBandPercent) : null,
                      manualPrice: a.manualPrice != null ? Number(a.manualPrice) : null,
                    }}
                  />
                  {a.isCustom && (
                    <div className="border-t border-border pt-4">
                      <ManualAssetPriceForm
                        assetId={a.id}
                        currentPrice={a.manualPrice != null ? Number(a.manualPrice) : null}
                        isBist={a.type === "STOCK" || a.type === "INDEX"}
                      />
                    </div>
                  )}
                </div>
              </AdminRecord>
            ))}
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
