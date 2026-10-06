"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createWithdrawalRequestAction, type WalletActionResult } from "@/lib/wallet/actions";
import { Button } from "@/components/ui/Button";

const initialState: WalletActionResult = {};

export function WithdrawalRequestForm() {
  const t = useTranslations("wallet");
  const [state, formAction, pending] = useActionState(createWithdrawalRequestAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="text-xs font-medium text-muted">{t("amount")}</label>
      <input
        name="amount"
        type="number"
        inputMode="decimal"
        min="0"
        step="any"
        required
        className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-brand"
      />
      <label className="text-xs font-medium text-muted">{t("bank")}</label>
      <input
        name="destinationBankName"
        type="text"
        required
        className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-brand"
      />
      <label className="text-xs font-medium text-muted">{t("iban")}</label>
      <input
        name="destinationIban"
        type="text"
        required
        placeholder="TR.."
        className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-brand"
      />
      <label className="text-xs font-medium text-muted">{t("accountHolder")}</label>
      <input
        name="destinationAccountHolder"
        type="text"
        required
        className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-brand"
      />
      {state.error && <p className="text-sm text-negative">{state.error}</p>}
      {state.success && <p className="text-sm text-positive">{state.success}</p>}
      <Button type="submit" variant="secondary" disabled={pending} className="w-full">
        {t("withdraw")}
      </Button>
    </form>
  );
}
