import type { ReactNode } from "react";

/**
 * One record in an admin list: a summary row that opens to show its actions and its edit form.
 * Every list uses this so editing, hiding and deleting look and behave the same everywhere.
 */
export function AdminRecord({
  summary,
  actions,
  children,
  editLabel = "Düzenle",
}: {
  summary: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  editLabel?: string;
}) {
  return (
    <details className="group overflow-hidden rounded-xl border border-border bg-surface">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-surface-2">
        <div className="min-w-0 flex-1">{summary}</div>
        <span className="shrink-0 text-[12px] font-bold text-foreground/70 group-open:hidden">{editLabel}</span>
        <span className="hidden shrink-0 text-[12px] font-bold text-foreground/70 group-open:inline">Kapat</span>
      </summary>
      <div className="flex flex-col gap-5 border-t border-border px-4 py-5">
        {actions && <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg bg-surface-2 px-4 py-3">{actions}</div>}
        {children}
      </div>
    </details>
  );
}

/** Row of action buttons used inside AdminRecord. */
export function RecordActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-start gap-2">{children}</div>;
}
