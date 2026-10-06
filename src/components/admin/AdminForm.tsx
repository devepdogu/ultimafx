"use client";

import type { ReactNode } from "react";
import { useActionState } from "react";
import type { AdminActionResult } from "@/lib/admin/content-actions";
import { cn } from "@/lib/utils/cn";

export const ADMIN_INPUT =
  "h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted focus:border-brand";
export const ADMIN_TEXTAREA =
  "w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-[13px] leading-5 text-foreground outline-none transition-colors placeholder:text-muted focus:border-brand";

/** A labelled field with an optional hint line under it. Keeps every admin form readable the same way. */
export function AdminField({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-[12px] font-bold text-foreground">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-muted">{hint}</span>}
    </label>
  );
}

/**
 * Form wrapper around a server action that returns { success } or { error }.
 * Shows the result right above the submit button so the admin always sees what happened.
 */
export function AdminActionForm({
  action,
  children,
  submitLabel,
  className,
}: {
  action: (prev: AdminActionResult, formData: FormData) => Promise<AdminActionResult>;
  children: ReactNode;
  submitLabel: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState<AdminActionResult, FormData>(action, {});
  return (
    <form action={formAction} className={cn("flex flex-col gap-4", className)}>
      {children}
      {state.error && <p className="rounded-lg bg-negative-bg px-3 py-2 text-[12px] font-semibold text-negative">{state.error}</p>}
      {state.success && <p className="rounded-lg bg-positive-bg px-3 py-2 text-[12px] font-semibold text-positive">{state.success}</p>}
      <div>
        <button
          type="submit"
          disabled={pending}
          className="h-10 rounded-lg bg-brand px-5 text-[13px] font-bold text-brand-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Kaydediliyor..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
