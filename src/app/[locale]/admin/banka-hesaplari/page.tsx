import { prisma } from "@/lib/prisma/client";
import { BankEditor } from "@/components/admin/EntityEditors";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminRecord, RecordActions } from "@/components/admin/AdminRecord";
import { AdminEmpty, AdminPageHeader, AdminPanel, StatusPill } from "@/components/admin/AdminUi";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ProviderBadge } from "@/components/admin/ProviderBadge";
import { ToggleButton } from "@/components/admin/ContentForms";
import { BANK_PRESETS, presetFor } from "@/lib/admin/presets";
import { deleteBankAction } from "@/lib/admin/entity-actions";
import { toggleBankAccountAction } from "@/lib/admin/bank-account-actions";

export default async function AdminBankAccountsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { q = "", status = "" } = await searchParams;
  const term = q.trim();
  const rows = await prisma.bankAccount.findMany({
    where: {
      ...(term ? { OR: [{ accountHolder: { contains: term, mode: "insensitive" } }, { iban: { contains: term.toUpperCase().replace(/\s+/g, "") } }] } : {}),
      ...(status === "ACTIVE" || status === "INACTIVE" ? { status } : {}),
    },
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <AdminPageHeader title="Banka Hesapları" description="Para yatırma talimatında gösterilen hesaplar. Yalnızca yayındaki hesaplar kullanıcıya görünür." />

      <AdminPanel title="Yeni banka hesabı ekle" description="Bankayı listeden seçin, IBAN'ı kontrol ederek girin. Yanlış IBAN'a yatan para geri alınamaz.">
        <BankEditor />
      </AdminPanel>

      <AdminPanel title={`Hesaplar (${rows.length})`}>
        <AdminFilters
          q={term}
          status={status}
          basePath="/admin/banka-hesaplari"
          searchPlaceholder="Hesap sahibi veya IBAN ara"
          statuses={[
            { value: "ACTIVE", label: "Yayında" },
            { value: "INACTIVE", label: "Pasif" },
          ]}
        />
        {rows.length === 0 ? (
          <AdminEmpty>Bu filtrelere uyan banka hesabı yok.</AdminEmpty>
        ) : (
          <div className="flex flex-col gap-2">
            {rows.map((r) => {
              const preset = presetFor(BANK_PRESETS, r.bankName);
              const active = r.status === "ACTIVE";
              return (
                <AdminRecord
                  key={r.id}
                  summary={
                    <div className="flex items-center gap-3">
                      <ProviderBadge label={preset.label} color={preset.color} logoUrl={r.logoUrl ?? preset.logoUrl} size={40} />
                      <div className="flex min-w-0 flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[14px] font-bold">{preset.label}</span>
                          {active ? <StatusPill tone="positive">Yayında</StatusPill> : <StatusPill tone="neutral">Pasif</StatusPill>}
                        </div>
                        <span className="truncate font-mono text-[12px] text-muted">{r.iban}</span>
                      </div>
                    </div>
                  }
                  actions={
                    <>
                      <span className="text-[12px] text-muted">{r.accountHolder}</span>
                      <RecordActions>
                        <ToggleButton label={active ? "Pasife al" : "Yayınla"} run={toggleBankAccountAction.bind(null, r.id)} />
                        <DeleteButton label="Sil" confirmText="Bu banka hesabı silinecek. Bağlı talep varsa silme engellenir. Emin misiniz?" run={deleteBankAction.bind(null, r.id)} />
                      </RecordActions>
                    </>
                  }
                >
                  <BankEditor
                    bank={{
                      id: r.id,
                      bankName: presetFor(BANK_PRESETS, r.bankName).value,
                      branch: r.branch,
                      iban: r.iban,
                      accountHolder: r.accountHolder,
                      instructions: r.instructions,
                      logoUrl: r.logoUrl,
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
