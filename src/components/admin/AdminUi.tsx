import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** Page title, one-line explanation and optional actions on the right. Same header on every admin page. */
export function AdminPageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-[24px] font-extrabold tracking-tight">{title}</h1>
        {description && <p className="max-w-2xl text-[13px] leading-5 text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

/** Bordered section with a heading. Forms and lists live inside panels so every page reads the same way. */
export function AdminPanel({ title, description, children, className }: { title: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5", className)}>
      <div className="flex flex-col gap-0.5">
        <h2 className="text-[15px] font-bold">{title}</h2>
        {description && <p className="text-[12px] text-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export type PillTone = "positive" | "negative" | "warning" | "neutral" | "brand";

const TONE: Record<PillTone, string> = {
  positive: "bg-positive-bg text-positive",
  negative: "bg-negative-bg text-negative",
  warning: "bg-[#F59E0B]/13 text-[#F59E0B]",
  neutral: "bg-surface-2 text-muted",
  brand: "bg-brand-bg text-brand",
};

export function StatusPill({ tone, children }: { tone: PillTone; children: ReactNode }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold leading-none", TONE[tone])}>{children}</span>;
}

/** Empty state for lists: says what is missing instead of showing an empty table. */
export function AdminEmpty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-[13px] text-muted">{children}</p>;
}

/** Label and value pair for detail lists. */
export function AdminInfo({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</span>
      <span className="text-[14px] font-semibold text-foreground">{value}</span>
    </div>
  );
}

/** Summary tile for list pages: icon, label, large value and a short hint. Tone colours the icon only. */
export function AdminStatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "neutral",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  tone?: "warning" | "neutral";
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</span>
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", tone === "warning" ? "bg-[#F59E0B]/13 text-[#F59E0B]" : "bg-surface-2 text-foreground/70")}>
          <Icon size={16} />
        </span>
      </div>
      <span className="num-tabular text-[24px] font-extrabold leading-none">{value}</span>
      {hint && <span className="text-[12px] text-muted">{hint}</span>}
    </div>
  );
}

/** "3 saat önce" style age for a date, in Turkish, for admin summaries. */
export function relativeTime(date: Date, now: Date = new Date()) {
  const min = Math.max(0, Math.round((now.getTime() - date.getTime()) / 60000));
  if (min < 60) return `${min} dk önce`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} saat önce`;
  return `${Math.round(h / 24)} gün önce`;
}
