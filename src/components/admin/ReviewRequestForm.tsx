"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import type { WalletActionResult } from "@/lib/wallet/actions";
import { Button } from "@/components/ui/Button";

const initialState: WalletActionResult = {};

interface ReviewRequestFormProps {
  id: string;
  action: (prev: WalletActionResult, formData: FormData) => Promise<WalletActionResult>;
  variant: "approve" | "reject";
}

export function ReviewRequestForm({ id, action, variant }: ReviewRequestFormProps) {
  const t = useTranslations("requests");
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        variant={variant === "approve" ? "buy" : "sell"}
        disabled={pending}
        className="px-3 py-1.5 text-xs"
      >
        {variant === "approve" ? t("approve") : t("reject")}
      </Button>
      {state.error && <span className="text-xs text-negative">{state.error}</span>}
      {state.success && <span className="text-xs text-positive">{state.success}</span>}
    </form>
  );
}
