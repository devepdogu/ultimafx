"use client";

import { useActionState, useState } from "react";
import { ArrowUpDown, Banknote } from "lucide-react";
import { CurrencyFlag } from "@/components/wallet/CurrencyFlag";
import { cn } from "@/lib/utils/cn";
import { parseAmount } from "@/lib/term-deposit/amount";
import { convertCurrencyAction, type FxActionResult } from "@/lib/wallet/fx-actions";

const money = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const initial: FxActionResult = {};

type Direction = "TRY_TO_USD" | "USD_TO_TRY";

/** Turkish lira ↔ US dollar at the live USD/TRY rate. */
export function UsdTransferForm({
  cashBalance,
  usdBalance,
  usdTry,
}: {
  cashBalance: number;
  usdBalance: number;
  usdTry: number | null;
}) {
  const [direction, setDirection] = useState<Direction>("TRY_TO_USD");
  const [amount, setAmount] = useState("");
  const [state, formAction, pending] = useActionState(convertCurrencyAction, initial);

  const fromTry = direction === "TRY_TO_USD";
  const available = fromTry ? cashBalance : usdBalance;
  const value = parseAmount(amount);
  const hasValue = Number.isFinite(value) && value > 0;
  const enough = hasValue && value <= available;
  const receive = hasValue && usdTry ? (fromTry ? value / usdTry : value * usdTry) : null;
  const canSubmit = !!usdTry && enough && !pending;

  const fromLabel = fromTry ? "Türk Lirası" : "Amerikan Doları";
  const toLabel = fromTry ? "Amerikan Doları" : "Türk Lirası";
  const fromSymbol = fromTry ? "₺" : "$";
  const toSymbol = fromTry ? "$" : "₺";
  const fromBalance = fromTry ? `₺${money.format(cashBalance)}` : `$${money.format(usdBalance)}`;

  function swap() {
    setDirection(fromTry ? "USD_TO_TRY" : "TRY_TO_USD");
    setAmount("");
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="direction" value={direction} />
      <input type="hidden" name="amount" value={amount} />

      <div className="flex items-center justify-between rounded-xl bg-surface-2 px-3.5 py-2.5 text-[13px]">
        <span className="text-muted">Kur</span>
        <span className="num-tabular font-semibold text-foreground">
          {usdTry ? `1 USD = ₺${money.format(usdTry)}` : "Kur alınamıyor"}
        </span>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-4">
        <div className="flex items-center justify-between text-[12px]">
          <span className="font-semibold uppercase tracking-wide text-muted">Gönderilen · {fromLabel}</span>
          <span className="num-tabular text-muted">Bakiye {fromBalance}</span>
        </div>
        <div className="flex items-center gap-3">
          {fromTry ? (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2 text-foreground">
              <Banknote size={18} />
            </span>
          ) : (
            <CurrencyFlag code="US" size={40} />
          )}
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
            placeholder="0,00"
            className="num-tabular min-w-0 flex-1 bg-transparent text-[26px] font-bold text-foreground outline-none placeholder:text-muted/50"
          />
          <span className="text-[14px] font-semibold text-muted">{fromSymbol}</span>
        </div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setAmount(available.toFixed(2).replace(".", ","))}
            className="rounded-full bg-surface-2 px-3 py-1 text-[12px] font-semibold text-foreground"
          >
            Tümü
          </button>
          {hasValue && !enough && <span className="text-[12px] font-medium text-negative">Yetersiz bakiye</span>}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={swap}
          aria-label="Yönü değiştir"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-brand"
        >
          <ArrowUpDown size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-4">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-muted">Alacağınız · {toLabel}</span>
        <div className="flex items-center gap-3">
          {fromTry ? (
            <CurrencyFlag code="US" size={40} />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2 text-foreground">
              <Banknote size={18} />
            </span>
          )}
          <span className={cn("num-tabular min-w-0 flex-1 text-[26px] font-bold", receive != null ? "text-foreground" : "text-muted/50")}>
            {receive != null ? money.format(receive) : "0,00"}
          </span>
          <span className="text-[14px] font-semibold text-muted">{toSymbol}</span>
        </div>
      </div>

      {state.error && <p className="rounded-xl bg-negative-bg px-3 py-2 text-[13px] font-medium text-negative">{state.error}</p>}
      {state.success && <p className="rounded-xl bg-positive-bg px-3 py-2 text-[13px] font-medium text-positive">{state.success}</p>}

      <button
        type="submit"
        disabled={!canSubmit}
        className="flex h-12 w-full items-center justify-center rounded-2xl bg-foreground text-[15px] font-bold text-background disabled:opacity-40"
      >
        {pending
          ? "İşleniyor…"
          : hasValue && receive != null
            ? `${fromTry ? "₺" : "$"}${money.format(value)} → ${fromTry ? "$" : "₺"}${money.format(receive)}`
            : "Dönüştür"}
      </button>
      <p className="text-center text-[11px] text-muted">Dönüşüm anlık kurla yapılır ve hemen hesabınıza yansır.</p>
    </form>
  );
}
