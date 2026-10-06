"use client";

import { useActionState, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { purchaseFundAction, redeemFundAction, type FundPurchaseState } from "@/lib/funds/actions";
import { MIN_FUND_PURCHASE_TRY } from "@/lib/funds/constants";
import { cn } from "@/lib/utils/cn";
import { formatChangePercent, formatPrice } from "@/lib/utils/format";

export interface FundRow {
  id: string;
  name: string;
  companyName: string;
  category: string;
  description: string | null;
  risk: number;
  unitPrice: number | null;
  currency: string;
  ytdReturn: number | null;
  oneYearReturn: number | null;
  aum: number | null;
  investorCount: number | null;
}

export interface FundHoldingRow {
  fundId: string;
  name: string;
  category: string;
  units: number;
  costTry: number;
  unitPrice: number | null;
  currency: string;
}

type Tab = "ALL" | "MINE";

const count = new Intl.NumberFormat("tr-TR");
const tl = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 });
const unitFmt = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 6 });

/** "19 Milyar TRY" style for fund size. */
function aumText(v: number | null) {
  if (v == null) return "-";
  if (v >= 1e9) return `${(v / 1e9).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} Milyar TRY`;
  if (v >= 1e6) return `${(v / 1e6).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} Milyon TRY`;
  return `${count.format(v)} TRY`;
}

function ReturnBox({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-surface-2 px-3 py-2.5">
      <span className="text-[10px] font-bold uppercase tracking-wide text-muted">{label}</span>
      <span className={cn("num-tabular text-[16px] font-extrabold", value == null ? "text-muted" : value < 0 ? "text-negative" : "text-positive")}>
        {value == null ? "—" : formatChangePercent(value)}
      </span>
    </div>
  );
}

function RiskBar({ risk }: { risk: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wide text-muted">
        <span>Risk</span>
        <span className="num-tabular text-foreground">{risk}/7</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <span key={i} className={cn("h-1.5 flex-1 rounded-full", i < risk ? "bg-brand" : "bg-surface-3")} />
        ))}
      </div>
    </div>
  );
}

/** Buy form. Cash comes from the wallet; the units preview uses the same rounding as the server. */
function PurchaseForm({ fund, cash }: { fund: FundRow; cash: number }) {
  const [state, formAction, pending] = useActionState<FundPurchaseState, FormData>(purchaseFundAction, {});
  const [amount, setAmount] = useState("");
  const price = fund.unitPrice ?? 0;
  const value = Number(amount);
  const preview = price > 0 && value > 0 ? Math.floor((value / price) * 1e6) / 1e6 : 0;
  const canBuy = price > 0 && value >= MIN_FUND_PURCHASE_TRY && value <= cash;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="fundId" value={fund.id} />
      <div className="flex items-center justify-between text-[13px]">
        <span className="text-muted">Kullanılabilir TL</span>
        <b className="num-tabular text-foreground">{tl.format(cash)}</b>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-[12px] font-bold text-muted">Alım tutarı (TL)</span>
        <input
          name="amount"
          type="number"
          inputMode="decimal"
          min={MIN_FUND_PURCHASE_TRY}
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-surface-2 px-3.5 text-[15px] font-bold text-foreground outline-none focus:border-brand"
        />
      </label>
      <div className="flex items-center justify-between text-[13px]">
        <span className="text-muted">Alınacak pay</span>
        <b className="num-tabular text-foreground">{preview > 0 ? unitFmt.format(preview) : "—"}</b>
      </div>
      {value > cash && <p className="text-[12px] font-semibold text-negative">Bakiyeniz bu tutar için yetersiz.</p>}
      {state.error && <p className="text-[13px] font-semibold text-negative">{state.error}</p>}
      {state.ok && <p className="text-[13px] font-semibold text-positive">{unitFmt.format(state.units ?? 0)} pay alındı.</p>}
      <button
        type="submit"
        disabled={pending || !canBuy}
        className="h-12 w-full rounded-xl bg-brand text-[14px] font-bold text-brand-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "İşleniyor..." : "Fonu satın al"}
      </button>
      <p className="text-center text-[11px] text-muted">
        Minimum {tl.format(MIN_FUND_PURCHASE_TRY)}. Pay adedi birim fiyattan hesaplanır ve aşağı yuvarlanır.
      </p>
    </form>
  );
}

/** Sell form for one holding. Payout is units times the current unit price, as on the server. */
function RedeemForm({ holding }: { holding: FundHoldingRow }) {
  const [state, formAction, pending] = useActionState<FundPurchaseState, FormData>(redeemFundAction, {});
  const [units, setUnits] = useState("");
  const value = Number(units);
  const price = holding.unitPrice ?? 0;
  const payout = price > 0 && value > 0 ? value * price : 0;
  const canSell = price > 0 && value > 0 && value <= holding.units;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="fundId" value={holding.fundId} />
      <div className="flex items-center justify-between text-[13px]">
        <span className="text-muted">Elinizdeki pay</span>
        <b className="num-tabular text-foreground">{unitFmt.format(holding.units)}</b>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-[12px] font-bold text-muted">Satılacak pay adedi</span>
        <div className="flex gap-2">
          <input
            name="units"
            type="number"
            inputMode="decimal"
            min="0.000001"
            max={holding.units}
            step="0.000001"
            required
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-surface-2 px-3.5 text-[15px] font-bold text-foreground outline-none focus:border-brand"
          />
          <button type="button" onClick={() => setUnits(String(holding.units))} className="h-11 shrink-0 rounded-xl border border-border px-3.5 text-[13px] font-bold text-foreground">
            Tümünü sat
          </button>
        </div>
      </label>
      <div className="flex items-center justify-between text-[13px]">
        <span className="text-muted">Tahmini tutar</span>
        <b className="num-tabular text-foreground">{payout > 0 ? tl.format(payout) : "—"}</b>
      </div>
      {value > holding.units && <p className="text-[12px] font-semibold text-negative">Mevcut paylarınızdan fazla satamazsınız.</p>}
      {state.error && <p className="text-[13px] font-semibold text-negative">{state.error}</p>}
      {state.ok && <p className="text-[13px] font-semibold text-positive">{unitFmt.format(state.units ?? 0)} pay satıldı.</p>}
      <button
        type="submit"
        disabled={pending || !canSell}
        className="h-12 w-full rounded-xl bg-negative text-[14px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "İşleniyor..." : "Fondan çık"}
      </button>
      <p className="text-center text-[11px] text-muted">Satış, birim fiyattan TL bakiyenize yansır.</p>
    </form>
  );
}

function FundDetail({ fund, cash }: { fund: FundRow; cash: number | null }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-bold uppercase tracking-wide text-brand">{fund.category}</span>
        <span className="text-[13px] text-muted">{fund.companyName}</span>
      </div>
      {fund.description && <p className="text-[14px] leading-6 text-foreground">{fund.description}</p>}
      <div className="grid grid-cols-2 gap-2.5">
        <ReturnBox label="YTD getiri" value={fund.ytdReturn} />
        <ReturnBox label="1 yıl getiri" value={fund.oneYearReturn} />
      </div>
      <RiskBar risk={fund.risk} />
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 text-[13px]">
        <div className="flex justify-between"><span className="text-muted">Birim pay</span><b className="num-tabular">{formatPrice(fund.unitPrice, fund.currency)}</b></div>
        <div className="flex justify-between"><span className="text-muted">Fon büyüklüğü</span><b className="num-tabular">{aumText(fund.aum)}</b></div>
        <div className="flex justify-between"><span className="text-muted">Yatırımcı</span><b className="num-tabular">{fund.investorCount == null ? "-" : count.format(fund.investorCount)}</b></div>
      </div>
      {cash == null ? (
        <Link href="/giris" className="flex h-12 items-center justify-center rounded-xl bg-brand text-[14px] font-bold text-brand-foreground">
          Fon almak için giriş yapın
        </Link>
      ) : (
        <PurchaseForm fund={fund} cash={cash} />
      )}
    </div>
  );
}

export function FundsList({
  funds,
  holdings,
  cash,
}: {
  funds: FundRow[];
  holdings: FundHoldingRow[];
  /** TL cash available to buy funds; null for logged-out visitors. */
  cash: number | null;
}) {
  const categories = useMemo(() => Array.from(new Set(funds.map((f) => f.category))), [funds]);
  const [tab, setTab] = useState<Tab>("ALL");
  const [category, setCategory] = useState<string>("ALL");
  const [openId, setOpenId] = useState<string | null>(null);
  const [sellId, setSellId] = useState<string | null>(null);
  const sellHolding = holdings.find((h) => h.fundId === sellId) ?? null;

  const visible = category === "ALL" ? funds : funds.filter((f) => f.category === category);
  const open = funds.find((f) => f.id === openId) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-1 rounded-full bg-surface-2 p-1">
        {(
          [
            { key: "ALL", label: `Tüm Fonlar (${funds.length})` },
            { key: "MINE", label: `Yatırımlarım (${holdings.length})` },
          ] as { key: Tab; label: string }[]
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "h-9 rounded-full text-[13px] font-semibold transition-all",
              tab === t.key ? "bg-surface text-foreground shadow-sm" : "text-muted"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "MINE" ? (
        holdings.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-[13px] text-muted">
            Henüz fon yatırımınız yok.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
          <HoldingsSummary holdings={holdings} />
          <div className="flex flex-col gap-3">
            {holdings.map((h) => {
              const value = h.unitPrice == null ? h.costTry : h.units * h.unitPrice;
              const pnl = value - h.costTry;
              const pnlPct = h.costTry > 0 ? (pnl / h.costTry) * 100 : 0;
              return (
                <article key={h.fundId} className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-5">
                  <div className="flex flex-col gap-1">
                    <span className="w-fit rounded-full bg-brand-bg px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-brand">{h.category}</span>
                    <h2 className="text-[14px] font-bold leading-5 text-foreground">{h.name}</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 text-[13px]">
                    <div className="flex flex-col gap-0.5"><span className="text-[11px] text-muted">Pay adedi</span><b className="num-tabular">{unitFmt.format(h.units)}</b></div>
                    <div className="flex flex-col gap-0.5"><span className="text-[11px] text-muted">Değer</span><b className="num-tabular">{tl.format(value)}</b></div>
                    <div className="flex flex-col gap-0.5"><span className="text-[11px] text-muted">Maliyet</span><b className="num-tabular">{tl.format(h.costTry)}</b></div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] text-muted">Kâr / zarar</span>
                      <b className={cn("num-tabular", pnl < 0 ? "text-negative" : "text-positive")}>
                        {tl.format(pnl)} ({formatChangePercent(pnlPct)})
                      </b>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSellId(h.fundId)}
                    className="h-10 rounded-xl border border-border text-[13px] font-bold text-foreground hover:border-negative"
                  >
                    Fondan çık
                  </button>
                </article>
              );
            })}
          </div>
          </div>
        )
      ) : funds.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-[13px] text-muted">
          Henüz yayınlanmış fon yok.
        </p>
      ) : (
        <>
          <div className="-mx-4 flex gap-2 overflow-x-auto overscroll-x-contain px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {["ALL", ...categories].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
                  category === c ? "border-foreground bg-foreground text-background" : "border-border text-muted"
                )}
              >
                {c === "ALL" ? "Tümü" : c}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {visible.map((f) => (
              <article key={f.id} className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-5">
                <div className="flex flex-col gap-1">
                  <span className="w-fit rounded-full bg-brand-bg px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-brand">{f.category}</span>
                  <h2 className="text-[15px] font-bold leading-5 text-foreground">{f.name}</h2>
                  <span className="text-[12px] text-muted">{f.companyName}</span>
                </div>
                {f.description && <p className="line-clamp-2 text-[13px] leading-5 text-muted">{f.description}</p>}
                <div className="grid grid-cols-2 gap-2.5">
                  <ReturnBox label="YTD getiri" value={f.ytdReturn} />
                  <ReturnBox label="1 yıl getiri" value={f.oneYearReturn} />
                </div>
                <RiskBar risk={f.risk} />
                <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                  <div className="flex min-w-0 flex-col gap-0.5 text-[11px] text-muted">
                    <span>
                      Birim pay <b className="num-tabular text-foreground">{formatPrice(f.unitPrice, f.currency)}</b>
                    </span>
                    <span>
                      AUM <b className="num-tabular text-foreground">{aumText(f.aum)}</b> · {f.investorCount == null ? "-" : count.format(f.investorCount)} yatırımcı
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenId(f.id)}
                    className="h-9 shrink-0 rounded-full bg-foreground px-4 text-[13px] font-bold text-background"
                  >
                    Yatırım Yap
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      <BottomSheet open={sellHolding !== null} onClose={() => setSellId(null)} title={sellHolding?.name ?? "Fon"}>
        {sellHolding && <RedeemForm holding={sellHolding} />}
      </BottomSheet>

      <BottomSheet open={open !== null} onClose={() => setOpenId(null)} title={open?.name ?? "Fon"}>
        {open && <FundDetail fund={open} cash={cash} />}
      </BottomSheet>
    </div>
  );
}

/** Portfolio total on top of the holdings list: market value, cost and profit/loss. */
function HoldingsSummary({ holdings }: { holdings: FundHoldingRow[] }) {
  const value = holdings.reduce((sum, h) => sum + (h.unitPrice == null ? h.costTry : h.units * h.unitPrice), 0);
  const cost = holdings.reduce((sum, h) => sum + h.costTry, 0);
  const pnl = value - cost;
  const pct = cost > 0 ? (pnl / cost) * 100 : 0;
  return (
    <section className="relative overflow-hidden rounded-3xl bg-foreground p-5 text-background">
      <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand/40 blur-3xl" />
      <div className="relative flex flex-col gap-3">
        <span className="text-[11px] font-bold uppercase tracking-wide opacity-70">Fon portföyü değeri</span>
        <span className="num-tabular text-[28px] font-extrabold leading-none">{tl.format(value)}</span>
        <div className="flex items-center justify-between text-[12px]">
          <span className="opacity-70">Maliyet {tl.format(cost)}</span>
          <span className={cn("num-tabular font-bold", pnl < 0 ? "text-negative" : "text-positive")}>
            {tl.format(pnl)} ({formatChangePercent(pct)})
          </span>
        </div>
      </div>
    </section>
  );
}
