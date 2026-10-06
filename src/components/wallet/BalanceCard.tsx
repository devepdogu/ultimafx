import { CurrencyFlag } from "@/components/wallet/CurrencyFlag";

const tryFmt = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 });
const usdtFmt = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Main balance card: TRY amount with its USDT equivalent and the rate used. Used on wallet and deposit/withdraw pages. */
export function BalanceCard({
  label,
  tryAmount,
  usdtRate,
}: {
  label: string;
  tryAmount: number;
  usdtRate: number | null;
}) {
  const usdt = usdtRate ? tryAmount / usdtRate : null;
  return (
    <section
      className="relative overflow-hidden rounded-3xl p-5 text-white shadow-lg"
      style={{ background: "linear-gradient(135deg, #1F2937 0%, #374151 100%)" }}
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" aria-hidden />
      <div className="relative flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-white/75">{label}</span>
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">TRY</span>
        </div>
        <div className="num-tabular text-[32px] font-extrabold leading-none">{tryFmt.format(tryAmount)}</div>
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/10 px-3.5 py-2.5">
          <div className="flex items-center gap-2.5">
            <CurrencyFlag code="US" size={32} />
            <div>
              <div className="num-tabular text-[15px] font-bold">
                {usdt != null ? `$${usdtFmt.format(usdt)}` : "—"}
              </div>
              <div className="text-[11px] text-white/70">Tahmini dolar karşılığı</div>
            </div>
          </div>
          <div className="text-right">
            <div className="num-tabular text-[12px] font-semibold">
              {usdtRate ? `1 USD ≈ ₺${usdtFmt.format(usdtRate)}` : "Kur alınamıyor"}
            </div>
            <div className="text-[11px] text-white/70">USD/TRY</div>
          </div>
        </div>
      </div>
    </section>
  );
}
