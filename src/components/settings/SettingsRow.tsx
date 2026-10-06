import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

/** Section with an uppercase label above a bordered list, as in the mock. */
export function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="px-1 text-[12px] font-bold tracking-wide text-muted">{title}</h2>
      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">{children}</div>
    </section>
  );
}

interface SettingsRowProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  /** Right side control: a Switch, a value, or nothing (chevron is added for links). */
  right?: ReactNode;
  href?: string;
  onClick?: () => void;
  /** Rows without a backend yet: shown with the mock's layout but inert. */
  disabled?: boolean;
  danger?: boolean;
  /** Form submit row (e.g. sign out). */
  asButton?: "submit";
}

export function SettingsRow({ icon: Icon, title, subtitle, right, href, onClick, disabled, danger, asButton }: SettingsRowProps) {
  const body = (
    <>
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          danger ? "bg-negative-bg text-negative" : "bg-surface-2 text-brand"
        )}
      >
        <Icon size={18} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className={cn("text-[15px] font-bold", danger ? "text-negative" : "text-foreground")}>{title}</span>
        {subtitle && <span className="text-[12px] text-muted">{subtitle}</span>}
      </span>
      {right}
      {href && !disabled && <ChevronRight size={18} className="shrink-0 text-muted" />}
    </>
  );
  const cls = cn(
    "flex min-h-[64px] w-full items-center gap-3 px-3.5 py-3 text-left",
    (href || onClick) && !disabled && "transition-colors hover:bg-surface-2",
  );

  if (asButton === "submit") {
    return (
      <button type="submit" className={cls}>
        {body}
      </button>
    );
  }
  if (href && !disabled) {
    return (
      <Link href={href} className={cls}>
        {body}
      </Link>
    );
  }
  if (onClick && !disabled) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {body}
      </button>
    );
  }
  return <div className={cls} aria-disabled={disabled || undefined}>{body}</div>;
}
