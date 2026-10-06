import { prisma } from "@/lib/prisma/client";
import { TermEditor } from "@/components/admin/EntityEditors";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminRecord, RecordActions } from "@/components/admin/AdminRecord";
import { AdminEmpty, AdminPageHeader, AdminPanel, StatusPill } from "@/components/admin/AdminUi";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ToggleButton } from "@/components/admin/ContentForms";
import { deleteTermProductAction } from "@/lib/admin/entity-actions";
import { toggleTermDepositProductAction } from "@/lib/admin/term-deposit-actions";

export default async function AdminTermDepositsPage({ searchParams }: { searchParams: Promise<{ status?: string; currency?: string }> }) {
  const { status = "", currency = "" } = await searchParams;
  const products = await prisma.termDepositProduct.findMany({
    where: {
      ...(status === "active" ? { isActive: true } : status === "hidden" ? { isActive: false } : {}),
      ...(currency === "TRY" || currency === "USD" ? { currency } : {}),
    },
    orderBy: [{ currency: "asc" }, { termDays: "asc" }],
  });

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <AdminPageHeader title="Vadeli Mevduat" description="Kullanıcıların açabildiği vadeli ürünler. Faiz basit faizle hesaplanır ve vade sonunda ana para ile birlikte hesaba döner." />

      <AdminPanel title="Yeni ürün ekle" description="Yayındaki bir ürünü değiştirirseniz mevcut hesaplar açıldıkları koşulla devam eder.">
        <TermEditor />
      </AdminPanel>

      <AdminPanel title={`Ürünler (${products.length})`}>
        <div className="flex flex-col gap-3">
          <AdminFilters
            q=""
            status={status}
            basePath="/admin/vadeli-mevduat"
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
                href={`/admin/vadeli-mevduat?${new URLSearchParams({ ...(status ? { status } : {}), ...(c.value ? { currency: c.value } : {}) }).toString()}`}
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
                      <span className="text-[14px] font-bold">
                        {p.termDays} gün · {p.currency === "TRY" ? "TL" : "USD"}
                      </span>
                      {p.isActive ? <StatusPill tone="positive">Satışta</StatusPill> : <StatusPill tone="neutral">Satış dışı</StatusPill>}
                    </div>
                    <span className="num-tabular text-[12px] text-muted">
                      Yıllık %{Number(p.annualRate).toLocaleString("tr-TR")} · minimum {Number(p.minAmount).toLocaleString("tr-TR")} {p.currency}
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
                    annualRate: Number(p.annualRate),
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
