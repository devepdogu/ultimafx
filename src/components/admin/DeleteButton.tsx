"use client";

import { useState, useTransition } from "react";
import type { AdminActionResult } from "@/lib/admin/content-actions";

/**
 * Destructive action with a confirmation step. The server action decides whether the delete is allowed
 * (for example, a fund with holders is refused) and its message is shown next to the button.
 */
export function DeleteButton({ label, confirmText, run }: { label: string; confirmText: string; run: () => Promise<AdminActionResult> }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  function onClick() {
    if (!window.confirm(confirmText)) return;
    start(async () => {
      const r = await run();
      setMessage(r.error ? { kind: "err", text: r.error } : { kind: "ok", text: r.success ?? "Silindi." });
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="h-9 rounded-lg border border-negative/40 px-3 text-[12px] font-bold text-negative transition-colors hover:bg-negative-bg disabled:opacity-50"
      >
        {pending ? "Siliniyor..." : label}
      </button>
      {message && <span className={message.kind === "err" ? "text-[11px] font-semibold text-negative" : "text-[11px] font-semibold text-positive"}>{message.text}</span>}
    </div>
  );
}
