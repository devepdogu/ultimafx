import { prisma } from "@/lib/prisma/client";
import { FundEditor } from "@/components/admin/FundEditor";
import { ToggleButton } from "@/components/admin/ContentForms";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { toggleInvestmentFundAction } from "@/lib/admin/content-actions";
import { deleteFundAction } from "@/lib/admin/fund-actions";

export default async function AdminFundsPage() {
  const funds = await prisma.investmentFund.findMany({ orderBy: [{ position: "asc" }, { createdAt: "desc" }] });

  return (
    <div className="flex max-w-5xl flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-[24px] font-extrabold tracking-tight">Yatırım Fonları</h1>
        <p className="text-[13px] text-muted">
          Fonlar sayfasındaki kartlar ve alım/satım fiyatları. Bir fonu düzenlemek için satırını açın.
        </p>
      </header>

      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-[15px] font-bold">Yeni fon</h2>
        <FundEditor />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[12px] font-bold uppercase tracking-wide text-muted">Tüm fonlar ({funds.length})</h2>
        {funds.map((f) => (
          <details key={f.id} className="group overflow-hidden rounded-2xl border border-border bg-surface">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-[14px] font-bold">{f.name}</span>
                  <span
                    className={
                      f.isActive
                        ? "rounded-full bg-positive-bg px-2 py-0.5 text-[10px] font-bold text-positive"
                        : "rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-bold text-muted"
                    }
                  >
                    {f.isActive ? "Yayında" : "Taslak"}
                  </span>
                </div>
                <span className="truncate text-[12px] text-muted">
                  {f.companyName} · {f.category} · Risk {f.risk}/7 · Birim pay {f.unitPrice ? f.unitPrice.toString() : "yok"}
                </span>
              </div>
              <span className="text-[12px] font-semibold text-brand group-open:hidden">Düzenle</span>
              <span className="hidden text-[12px] font-semibold text-muted group-open:inline">Kapat</span>
            </summary>
            <div className="flex flex-col gap-5 border-t border-border px-5 py-5">
              <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-2 px-4 py-3">
                <span className="text-[12px] text-muted">{f.isActive ? "Fonlar sayfasında görünüyor." : "Kullanıcılardan gizli."}</span>
                <div className="flex items-start gap-2">
                  <ToggleButton label={f.isActive ? "Yayından kaldır" : "Yayınla"} run={toggleInvestmentFundAction.bind(null, f.id)} />
                  <DeleteButton label="Sil" confirmText="Bu fon kalıcı olarak silinecek. Yatırımcı payı varsa silme engellenir. Emin misiniz?" run={deleteFundAction.bind(null, f.id)} />
                </div>
              </div>
              <FundEditor
                fund={{
                  id: f.id,
                  name: f.name,
                  companyName: f.companyName,
                  category: f.category,
                  description: f.description,
                  risk: f.risk,
                  unitPrice: f.unitPrice == null ? null : Number(f.unitPrice),
                  ytdReturn: f.ytdReturn == null ? null : Number(f.ytdReturn),
                  oneYearReturn: f.oneYearReturn == null ? null : Number(f.oneYearReturn),
                  aum: f.aum == null ? null : Number(f.aum),
                  investorCount: f.investorCount,
                  position: f.position,
                }}
              />
            </div>
          </details>
        ))}
      </section>
    </div>
  );
}
