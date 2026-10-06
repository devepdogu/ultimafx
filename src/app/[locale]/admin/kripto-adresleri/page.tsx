import { prisma } from "@/lib/prisma/client";
import { CryptoEditor } from "@/components/admin/EntityEditors";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminRecord, RecordActions } from "@/components/admin/AdminRecord";
import { AdminEmpty, AdminPageHeader, AdminPanel, StatusPill } from "@/components/admin/AdminUi";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ProviderBadge } from "@/components/admin/ProviderBadge";
import { ToggleButton } from "@/components/admin/ContentForms";
import { CRYPTO_NETWORK_PRESETS, presetFor } from "@/lib/admin/presets";
import { deleteCryptoAction } from "@/lib/admin/entity-actions";
import { toggleCryptoAddressAction } from "@/lib/admin/crypto-address-actions";

export default async function AdminCryptoAddressesPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { q = "", status = "" } = await searchParams;
  const term = q.trim();
  const rows = await prisma.cryptoAddress.findMany({
    where: {
      ...(term ? { OR: [{ label: { contains: term, mode: "insensitive" } }, { address: { contains: term } }] } : {}),
      ...(status === "active" ? { isActive: true } : status === "hidden" ? { isActive: false } : {}),
    },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <AdminPageHeader title="Kripto Adresleri" description="Kripto ile yatırma için gösterilen USDT adresleri. Ağ, adresle birebir eşleşmelidir." />

      <AdminPanel title="Yeni adres ekle" description="Ağı listeden seçin ve adresi iki kez kontrol edin. Yanlış ağa gönderilen varlık kurtarılamayabilir.">
        <CryptoEditor />
      </AdminPanel>

      <AdminPanel title={`Adresler (${rows.length})`}>
        <AdminFilters
          q={term}
          status={status}
          basePath="/admin/kripto-adresleri"
          searchPlaceholder="Etiket veya adres ara"
          statuses={[
            { value: "active", label: "Yayında" },
            { value: "hidden", label: "Pasif" },
          ]}
        />
        {rows.length === 0 ? (
          <AdminEmpty>Bu filtrelere uyan adres yok.</AdminEmpty>
        ) : (
          <div className="flex flex-col gap-2">
            {rows.map((r) => {
              const preset = presetFor(CRYPTO_NETWORK_PRESETS, r.network);
              return (
                <AdminRecord
                  key={r.id}
                  summary={
                    <div className="flex items-center gap-3">
                      <ProviderBadge label={preset.value} color={preset.color} logoUrl={r.logoUrl ?? preset.logoUrl} size={40} />
                      <div className="flex min-w-0 flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[14px] font-bold">{r.label}</span>
                          <StatusPill tone="brand">{preset.label}</StatusPill>
                          {r.isActive ? <StatusPill tone="positive">Yayında</StatusPill> : <StatusPill tone="neutral">Pasif</StatusPill>}
                        </div>
                        <span className="truncate font-mono text-[12px] text-muted">{r.address}</span>
                      </div>
                    </div>
                  }
                  actions={
                    <>
                      <span className="text-[12px] text-muted">Sıra {r.position}</span>
                      <RecordActions>
                        <ToggleButton label={r.isActive ? "Pasife al" : "Yayınla"} run={toggleCryptoAddressAction.bind(null, r.id)} />
                        <DeleteButton label="Sil" confirmText="Bu adres silinecek. Bağlı talep varsa silme engellenir. Emin misiniz?" run={deleteCryptoAction.bind(null, r.id)} />
                      </RecordActions>
                    </>
                  }
                >
                  <CryptoEditor
                    crypto={{ id: r.id, network: r.network, label: r.label, address: r.address, logoUrl: r.logoUrl, position: r.position }}
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
