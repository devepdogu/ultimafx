"use client";

import { useActionState, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { parseAmount } from "@/lib/term-deposit/amount";
import { convertCurrencyAction, type FxActionResult } from "@/lib/wallet/fx-actions";

const money = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const initial: FxActionResult = {};

type Direction = "TRY_TO_USD" | "USD_TO_TRY";

/** Labels for the USD card on the term deposit page. */
const COPY = {
  usd: {
    title: "Döviz bakiyesi",
    second: "Amerikan Doları",
    buyTab: "TRY ile dolar al",
    sellTab: "Dolar sat",
    buyCta: "Dolar al",
    sellCta: "Dolar sat",
    fromSymbol: { TRY_TO_USD: "₺", USD_TO_TRY: "$" },
    formatSecond: (v: number) => `$${money.format(v)}`,
    formatPreview: (direction: Direction, v: number) => (direction === "TRY_TO_USD" ? `$${money.format(v)}` : `₺${money.format(v)}`),
  },
} as const;

/** Buy or sell USD from the TRY balance at the live USDTRY rate. Both balances stay in one wallet. */
export function CurrencyConvertCard({
  cashBalance,
  usdBalance,
  usdTry,
}: {
  cashBalance: number;
  usdBalance: number;
  usdTry: number | null;
}) {
  const copy = COPY.usd;
  const [direction, setDirection] = useState<Direction>("TRY_TO_USD");
  const [amount, setAmount] = useState("");
  const [state, formAction, pending] = useActionState(convertCurrencyAction, initial);

  const value = parseAmount(amount);
  const hasValue = Number.isFinite(value) && value > 0;
  const available = direction === "TRY_TO_USD" ? cashBalance : usdBalance;
  const enough = hasValue && value <= available;
  const preview = hasValue && usdTry ? (direction === "TRY_TO_USD" ? value / usdTry : value * usdTry) : null;
  const canSubmit = !!usdTry && enough && !pending;

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
      <input type="hidden" name="direction" value={direction} />
      <input type="hidden" name="amount" value={amount} />

      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-muted">{copy.title}</span>
        <span className="num-tabular text-[12px] text-muted">{usdTry ? `1 USD = ₺${money.format(usdTry)}` : "Kur alınamıyor"}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-0.5 rounded-xl bg-surface-2 p-3">
          <span className="text-[11px] text-muted">Türk Lirası</span>
          <span className="num-tabular text-[16px] font-bold text-foreground">₺{money.format(cashBalance)}</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-xl bg-surface-2 p-3">
          <span className="text-[11px] text-muted">{copy.second}</span>
          <span className="num-tabular text-[16px] font-bold text-foreground">{copy.formatSecond(usdBalance)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-full bg-surface-2 p-1">
        {(
          [
            ["TRY_TO_USD", copy.buyTab],
            ["USD_TO_TRY", copy.sellTab],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setDirection(key);
              setAmount("");
            }}
            className={cn(
              "h-9 rounded-full text-[13px] font-semibold transition-all",
              direction === key ? "bg-surface text-foreground shadow-sm" : "text-muted"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex h-12 items-center gap-2 rounded-xl border border-border bg-background px-4 focus-within:border-brand">
        <span className="text-[14px] font-semibold text-muted">{copy.fromSymbol[direction]}</span>
        <input
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
          placeholder="0,00"
          className="num-tabular min-w-0 flex-1 bg-transparent text-[18px] font-bold text-foreground outline-none placeholder:text-muted/50"
        />
        <button
          type="button"
          onClick={() => setAmount(available.toFixed(2).replace(".", ","))}
          className="shrink-0 rounded-full bg-surface-2 px-3 py-1 text-[11px] font-semibold text-foreground"
        >
          Tümü
        </button>
      </div>

      <div className="flex items-center justify-between text-[12px]">
        <span className="text-muted">
          {preview != null ? `Alacağınız: ${copy.formatPreview(direction, preview)}` : "Tutar girin"}
        </span>
        {hasValue && !enough && <span className="font-medium text-negative">Yetersiz bakiye</span>}
      </div>

      {state.error && <p className="rounded-xl bg-negative-bg px-3 py-2 text-[13px] font-medium text-negative">{state.error}</p>}
      {state.success && <p className="rounded-xl bg-positive-bg px-3 py-2 text-[13px] font-medium text-positive">{state.success}</p>}

      <button
        type="submit"
        disabled={!canSubmit}
        className="flex h-11 w-full items-center justify-center rounded-xl bg-surface-3 text-[14px] font-bold text-foreground disabled:opacity-40"
      >
        {pending ? "İşleniyor…" : direction === "TRY_TO_USD" ? copy.buyCta : copy.sellCta}
      </button>
    </form>
  );
}
