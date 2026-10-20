"use client";

import { useState, useTransition } from "react";
import { revealUserPasswordAction } from "@/lib/admin/user-actions";

/** Decrypts and shows a user's current password only on an explicit admin click — never
 * fetched or rendered on page load. See user-actions.ts's revealUserPasswordAction. */
export function RevealPasswordButton({ userId }: { userId: string }) {
  const [state, setState] = useState<{ password: string | null; error?: string } | null>(null);
  const [visible, setVisible] = useState(false);
  const [pending, startTransition] = useTransition();

  if (visible && state) {
    return (
      <div className="flex flex-col gap-2">
        {state.password ? (
          <code className="num-tabular break-all rounded-lg border border-border bg-surface-2 px-3 py-2 text-[13px] font-bold text-foreground">
            {state.password}
          </code>
        ) : (
          <p className="rounded-lg bg-negative-bg px-3 py-2 text-[12px] font-semibold text-negative">{state.error}</p>
        )}
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="h-9 self-start rounded-lg border border-border px-3 text-[12px] font-bold text-foreground/70 hover:border-foreground/40"
        >
          Gizle
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await revealUserPasswordAction(userId);
          setState(result);
          setVisible(true);
        })
      }
      className="h-9 self-start rounded-lg border border-border px-3 text-[12px] font-bold text-foreground/70 transition-colors hover:border-foreground/40 disabled:opacity-50"
    >
      {pending ? "Çözülüyor..." : "Şifreyi göster"}
    </button>
  );
}
