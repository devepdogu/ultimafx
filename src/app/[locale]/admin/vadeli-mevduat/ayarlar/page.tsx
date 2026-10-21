import { prisma } from "@/lib/prisma/client";
import { Link } from "@/i18n/navigation";
import { getInterestConfig } from "@/lib/interest/config";
import { TermEditor } from "@/components/admin/EntityEditors";
import { AdminActionForm, AdminField, ADMIN_INPUT } from "@/components/admin/AdminForm";
import { AdminEmpty, AdminPageHeader, AdminPanel, StatusPill } from "@/components/admin/AdminUi";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminRecord, RecordActions } from "@/components/admin/AdminRecord";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ToggleButton } from "@/components/admin/ContentForms";
import { deleteTermProductAction } from "@/lib/admin/entity-actions";
import { toggleTermDepositProductAction } from "@/lib/admin/term-deposit-actions";
import { updateInterestConfigAction } from "@/lib/admin/interest-config-actions";

export default async function AdminInterestConfigPage({ searchParams }: { searchParams: Promise<{ status?: string; currency?: string }> }) {
  const { status = "", currency = "" } = await searchParams;
  const [config, products] = await Promise.all([
    getInterestConfig(),
    prisma.termDepositProduct.findMany({
      where: {
        ...(status === "active" ? { isActive: true } : status === "hidden" ? { isActive: false } : {}),
        ...(currency === "TRY" || currency === "USD" ? { currency } : {}),
      },
      orderBy: [{ currency: "asc" }, { termDays: "asc" }],
    }),
  ]);

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <AdminPageHeader
        title="Faiz Konfigürasyonu"
        description="Taban yıllık faiz oranları + vade seçenekleri. Bir vade ürününün gerçek oranı her zaman taban oran × çarpandır."
        actions={
          <Link href="/admin/vadeli-mevduat" className="flex h-9 items-center rounded-lg border border-border px-3 text-[12px] font-bold">
            Faiz Yönetimine dön
          </Link>
        }
      />

      <AdminPanel title="Yıllık faiz oranları (%)" description="Değişiklik anında tüm vade ürünlerine (çarpanlarıyla) yeniden uygulanır.">
        <AdminActionForm action={updateInterestConfigAction} submitLabel="Kaydet">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField label="TRY yıllık %">
              <input name="tryAnnualRate" type="number" step="0.01" min="0" required defaultValue={config.tryAnnualRate} className={ADMIN_INPUT} />
            </AdminField>
            <AdminField label="USDT yıllık %">
              <input name="usdAnnualRate" type="number" step="0.01" min="0" required defaultValue={config.usdAnnualRate} className={ADMIN_INPUT} />
            </AdminField>
            <AdminField label="Erken çekim cezası (%)" hint="Vadeden önce çekerse biriken faizin yüzdesi kesilir (0-100).">
              <input name="earlyWithdrawalPenaltyPercent" type="number" step="0.01" min="0" max="100" required defaultValue={config.earlyWithdrawalPenaltyPercent} className={ADMIN_INPUT} />
            </AdminField>
            <label className="flex items-center gap-3 self-end pb-2 text-[13px] font-bold">
              <input type="checkbox" name="autoDistribute" defaultChecked={config.autoDistribute} className="h-4 w-4 accent-brand" />
              Otomatik dağıtım — vadesi dolan mevduatlar otomatik müşteri bakiyesine yatırılır
            </label>
          </div>
        </AdminActionForm>
      </AdminPanel>

      <AdminPanel title="Yeni vade seçeneği ekle" description="Çarpan, yukarıdaki taban orana uygulanır (1 = taban oranın aynısı).">
        <TermEditor />
      </AdminPanel>

      <AdminPanel title={`Vade seçenekleri (${products.length})`}>
        <div className="flex flex-col gap-3">
          <AdminFilters
            q=""
            status={status}
            basePath="/admin/vadeli-mevduat/ayarlar"
            statuses={[
              { value: "active", label: "Satışta" },
              { value: "hidden", label: "Satış dışı" },
            ]}
          />
          <div className="flex flex-wrap gap-1.5">
            {[
              { value: "", label: "Tüm para birimleri" },
              { value: "TRY", label: "TL" },
              { value: "USD", label: "USD" },
            ].map((c) => (
              <a
                key={c.value || "all"}
                href={`/admin/vadeli-mevduat/ayarlar?${new URLSearchParams({ ...(status ? { status } : {}), ...(c.value ? { currency: c.value } : {}) }).toString()}`}
                className={
                  (currency === c.value ? "border-foreground bg-foreground text-background" : "border-border text-foreground/70 hover:border-foreground/40") +
                  " rounded-full border px-3 py-1.5 text-[12px] font-bold"
                }
              >
                {c.label}
              </a>
            ))}
          </div>
        </div>

        {products.length === 0 ? (
          <AdminEmpty>Bu filtrelere uyan ürün yok.</AdminEmpty>
        ) : (
          <div className="flex flex-col gap-2">
            {products.map((p) => (
              <AdminRecord
                key={p.id}
                summary={
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-bold">{p.label ?? `${p.termDays} gün`}</span>
                      <span className="text-[11px] text-muted">({p.currency === "TRY" ? "TL" : "USD"})</span>
                      {p.isActive ? <StatusPill tone="positive">Satışta</StatusPill> : <StatusPill tone="neutral">Satış dışı</StatusPill>}
                    </div>
                    <span className="num-tabular text-[12px] text-muted">
                      Yıllık %{Number(p.annualRate).toLocaleString("tr-TR")} (çarpan {Number(p.rateMultiplier)}) · minimum {Number(p.minAmount).toLocaleString("tr-TR")} {p.currency}
                    </span>
                  </div>
                }
                actions={
                  <>
                    <span className="text-[12px] text-muted">{p.isActive ? "Kullanıcılar bu ürünü açabilir." : "Yeni hesap açılamıyor."}</span>
                    <RecordActions>
                      <ToggleButton label={p.isActive ? "Satışı durdur" : "Satışa aç"} run={toggleTermDepositProductAction.bind(null, p.id)} />
                      <DeleteButton label="Sil" confirmText="Bu ürün silinecek. Bu ürünle açılmış hesap varsa silme engellenir. Emin misiniz?" run={deleteTermProductAction.bind(null, p.id)} />
                    </RecordActions>
                  </>
                }
              >
                <TermEditor
                  product={{
                    id: p.id,
                    currency: p.currency,
                    termDays: p.termDays,
                    label: p.label,
                    annualRate: Number(p.annualRate),
                    rateMultiplier: Number(p.rateMultiplier),
                    minAmount: Number(p.minAmount),
                    position: p.position,
                  }}
                />
              </AdminRecord>
            ))}
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
