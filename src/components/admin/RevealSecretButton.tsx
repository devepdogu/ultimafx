"use client";

import { useState, useTransition } from "react";

export interface RevealSecretResult {
  value: string | null;
  error?: string;
}

/** Decrypts and shows a reversibly-encrypted admin secret (password, T.C. Kimlik No, ...) only
 * on an explicit click — never fetched or rendered on page load. `reveal` is a server action
 * bound to the specific user/field (see revealUserPasswordAction / revealUserTcKimlikAction in
 * user-actions.ts). */
export function RevealSecretButton({
  reveal,
  showLabel,
}: {
  reveal: () => Promise<RevealSecretResult>;
  showLabel: string;
}) {
  const [state, setState] = useState<RevealSecretResult | null>(null);
  const [visible, setVisible] = useState(false);
  const [pending, startTransition] = useTransition();

  if (visible && state) {
    return (
      <div className="flex flex-col gap-2">
        {state.value ? (
          <code className="num-tabular break-all rounded-lg border border-border bg-surface-2 px-3 py-2 text-[13px] font-bold text-foreground">
            {state.value}
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
          const result = await reveal();
          setState(result);
          setVisible(true);
        })
      }
      className="h-9 self-start rounded-lg border border-border px-3 text-[12px] font-bold text-foreground/70 transition-colors hover:border-foreground/40 disabled:opacity-50"
    >
      {pending ? "Çözülüyor..." : showLabel}
    </button>
  );
}
