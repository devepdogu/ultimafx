"use client";

import { useActionState, useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { parseAmount } from "@/lib/term-deposit/amount";
import { openTermDepositAction, type TermDepositActionResult } from "@/lib/term-deposit/actions";
import { computeTermInterest } from "@/lib/term-deposit/interest";

export interface TermDepositProductView {
  id: string;
  currency: "TRY" | "USD";
  termDays: number;
  annualRate: number;
  minAmount: number;
}

export interface TermDepositAccountView {
  id: string;
  currency: "TRY" | "USD";
  principal: number;
  interest: number;
  termDays: number;
  annualRate: number;
  maturesAt: string;
  status: "ACTIVE" | "MATURED";
}

const PERCENTS = [25, 50, 75, 100] as const;
const money = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dateFmt = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
const initial: TermDepositActionResult = {};
const DAY_MS = 24 * 60 * 60 * 1000;

function formatMoney(value: number, currency: "TRY" | "USD" = "TRY") {
  return currency === "TRY" ? `₺${money.format(value)}` : `$${money.format(value)}`;
}

/** Month-by-month balances up to maturity (last row is the maturity day). */
function monthlySchedule(principal: number, annualRate: number, termDays: number) {
  const rows: { day: number; interest: number; balance: number }[] = [];
  for (let day = 30; day < termDays; day += 30) {
    const interest = computeTermInterest(principal, annualRate, day);
    rows.push({ day, interest, balance: principal + interest });
  }
  const interest = computeTermInterest(principal, annualRate, termDays);
  rows.push({ day: termDays, interest, balance: principal + interest });
  return rows;
}

/** Share of the term already elapsed, derived from the maturity date (0–1). */
function elapsedShare(account: TermDepositAccountView, now: number) {
  const start = new Date(account.maturesAt).getTime() - account.termDays * DAY_MS;
  return Math.min(1, Math.max(0, (now - start) / (account.termDays * DAY_MS)));
}

export function TermDepositView({
  products,
  accounts,
  cashBalance,
  usdBalance,
  usdTry,
}: {
  products: TermDepositProductView[];
  accounts: TermDepositAccountView[];
  cashBalance: number;
  usdBalance: number;
  usdTry: number | null;
}) {
  const currencies = useMemo(() => Array.from(new Set(products.map((p) => p.currency))), [products]);
  const [currency, setCurrency] = useState<"TRY" | "USD">(currencies[0] ?? "TRY");
  const termsForCurrency = useMemo(
    () => products.filter((p) => p.currency === currency).sort((a, b) => a.termDays - b.termDays),
    [products, currency]
  );
  const [productId, setProductId] = useState<string | null>(null);
  const selected = termsForCurrency.find((p) => p.id === productId) ?? termsForCurrency[0] ?? null;
  const [amount, setAmount] = useState("");
  const [state, formAction, pending] = useActionState(openTermDepositAction, initial);

  const principal = parseAmount(amount);
  const hasAmount = Number.isFinite(principal) && principal > 0;
  const balance = currency === "TRY" ? cashBalance : usdBalance;
  const canOpen =
    !!selected &&
    hasAmount &&
    principal >= selected.minAmount &&
    balance != null &&
    principal <= balance;
  const schedule = selected && hasAmount ? monthlySchedule(principal, selected.annualRate, selected.termDays) : [];
  const end = schedule.at(-1);
  const otherCurrency = (value: number) => (usdTry ? (currency === "TRY" ? value / usdTry : value * usdTry) : null);

  if (products.length === 0) {
    return (
      <div className="flex flex-col gap-4 px-4 py-8">
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-surface p-6 text-center">
          <p className="text-[15px] font-semibold text-foreground">Vadeli mevduat ürünü yayında değil</p>
          <p className="text-[13px] text-muted">Yayınlanan vade ve oranlar burada listelenir.</p>
        </div>
        <AccountList accounts={accounts} />
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5 px-4 py-4">
      <input type="hidden" name="productId" value={selected?.id ?? ""} />
      <input type="hidden" name="amount" value={amount} />

      <div className="grid grid-cols-2 gap-1 rounded-full bg-surface-2 p-1">
        {currencies.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setCurrency(c);
              setProductId(null);
            }}
            className={cn(
              "h-10 rounded-full text-[14px] font-semibold transition-all",
              currency === c ? "bg-surface text-foreground shadow-sm" : "text-muted"
            )}
          >
            {c === "TRY" ? "₺ Türk Lirası" : "$ Amerikan Doları"}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-1 rounded-3xl bg-[#0B1F3C] px-5 py-6 text-center text-white">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-white/70">Yıllık basit faiz</span>
        <span className="num-tabular text-[52px] font-extrabold leading-none">{selected ? `%${selected.annualRate.toFixed(2)}` : "—"}</span>
        <span className="mt-1 text-[12px] text-white/75">{selected ? `${selected.termDays} gün vade · min. ${formatMoney(selected.minAmount, selected.currency)}` : "Bir vade seçin"}</span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-muted">Vade seçin</span>
        <div className="grid grid-cols-3 gap-2">
          {termsForCurrency.map((t) => {
            const active = selected?.id === t.id;
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={active}
                onClick={() => setProductId(t.id)}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-2xl border-2 py-3 transition-colors",
                  active ? "border-brand bg-brand-bg" : "border-transparent bg-surface"
                )}
              >
                <span className={cn("num-tabular text-[20px] font-bold leading-none", active ? "text-brand" : "text-foreground")}>{t.termDays}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">gün</span>
                <span className="num-tabular mt-1 text-[12px] font-semibold text-positive">%{t.annualRate.toFixed(2)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between text-[12px]">
          <span className="font-semibold uppercase tracking-wide text-muted">Yatırılacak tutar</span>
          <span className="num-tabular text-muted">Bakiye {formatMoney(balance, currency)}</span>
        </div>
        <div className="flex h-14 items-center gap-2 rounded-xl border border-border bg-background px-4 focus-within:border-brand">
          <span className="text-[20px] font-semibold text-muted">{currency === "TRY" ? "₺" : "$"}</span>
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
            placeholder="0,00"
            className="num-tabular min-w-0 flex-1 bg-transparent text-[22px] font-bold text-foreground outline-none placeholder:text-muted/50"
          />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {PERCENTS.map((p) => (
            <button
              key={p}
              type="button"
              disabled={balance == null || balance <= 0}
              onClick={() => balance != null && setAmount(((Math.floor(balance * p) / 100) || 0).toFixed(2).replace(".", ","))}
              className="h-9 rounded-full bg-surface-2 text-[12px] font-semibold text-foreground transition-colors hover:bg-surface-3 disabled:opacity-40"
            >
              {p === 100 ? "Tümü" : `%${p}`}
            </button>
          ))}
        </div>
        {selected && hasAmount && principal < selected.minAmount && (
          <p className="text-[12px] font-medium text-negative">Minimum tutar {formatMoney(selected.minAmount, selected.currency)}.</p>
        )}
        {balance != null && hasAmount && principal > balance && <p className="text-[12px] font-medium text-negative">Yetersiz bakiye.</p>}
      </div>

      {selected && hasAmount && end && (
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-muted">Birikim simülasyonu</span>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1 rounded-xl bg-surface-2 p-3">
              <span className="text-[11px] text-muted">Vade sonu bakiye</span>
              <span className="num-tabular text-[17px] font-bold text-foreground">{formatMoney(end.balance, selected.currency)}</span>
            </div>
            <div className="flex flex-col gap-1 rounded-xl bg-positive-bg p-3">
              <span className="text-[11px] text-positive">Net getiri</span>
              <span className="num-tabular text-[17px] font-bold text-positive">+{formatMoney(end.interest, selected.currency)}</span>
              {otherCurrency(end.interest) != null && (
                <span className="num-tabular text-[11px] text-muted">
                  ≈ {selected.currency === "TRY" ? `$${money.format(otherCurrency(end.interest)!)}` : formatMoney(otherCurrency(end.interest)!)}
                </span>
              )}
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="grid grid-cols-3 bg-surface-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
              <span>Dönem</span>
              <span className="text-right">Bakiye</span>
              <span className="text-right">Getiri</span>
            </div>
            {schedule.map((r) => (
              <div key={r.day} className="grid grid-cols-3 border-t border-border px-3 py-2.5 text-[13px]">
                <span className="text-muted">{r.day === selected.termDays && r.day % 30 !== 0 ? `${r.day}. gün` : `${Math.round(r.day / 30) || 1}. ay`}</span>
                <span className="num-tabular text-right text-foreground">{formatMoney(r.balance, selected.currency)}</span>
                <span className="num-tabular text-right text-positive">+{formatMoney(r.interest, selected.currency)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {state.error && <p className="rounded-xl bg-negative-bg px-3 py-2 text-[13px] font-medium text-negative">{state.error}</p>}
      {state.success && <p className="rounded-xl bg-positive-bg px-3 py-2 text-[13px] font-medium text-positive">{state.success}</p>}

      <button
        type="submit"
        disabled={!canOpen || pending}
        className="flex h-14 w-full items-center justify-center rounded-2xl bg-foreground text-[15px] font-bold text-background transition-opacity disabled:opacity-40"
      >
        {pending ? "Açılıyor…" : selected ? `Mevduat hesabı aç · ${selected.termDays} gün` : "Mevduat hesabı aç"}
      </button>

      <AccountList accounts={accounts} />
    </form>
  );
}

function AccountList({ accounts }: { accounts: TermDepositAccountView[] }) {
  const [now] = useState(() => Date.now());
  if (accounts.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[12px] font-semibold uppercase tracking-wide text-muted">Vadeli hesaplarım</span>
      {accounts.map((a) => {
        const active = a.status === "ACTIVE";
        const share = active ? elapsedShare(a, now) : 1;
        return (
          <div key={a.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="num-tabular text-[17px] font-bold text-foreground">{formatMoney(a.principal, a.currency)}</div>
                <div className="text-[12px] text-muted">
                  {a.termDays} gün · %{a.annualRate.toFixed(2)}
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                  active ? "bg-brand-bg text-brand" : "bg-positive-bg text-positive"
                )}
              >
                {active ? "Devam ediyor" : "Vadesi doldu"}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div className={cn("h-full rounded-full", active ? "bg-brand" : "bg-positive")} style={{ width: `${Math.round(share * 100)}%` }} />
              </div>
              <div className="flex items-center justify-between text-[12px] text-muted">
                <span>
                  {active ? `Vade: ${dateFmt.format(new Date(a.maturesAt))}` : "Getiri hesabınıza aktarıldı"}
                </span>
                <span className="num-tabular font-semibold text-positive">+{formatMoney(a.interest, a.currency)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
