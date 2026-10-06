import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

export interface StatusOption {
  value: string;
  label: string;
}

/**
 * Filter bar for admin lists. It is a plain GET form, so filters live in the URL and survive a reload.
 * Pass the current search and status values from the page's searchParams.
 */
export function AdminFilters({
  q,
  status,
  statuses,
  searchPlaceholder = "Ara",
  basePath,
}: {
  q: string;
  status: string;
  statuses?: StatusOption[];
  searchPlaceholder?: string;
  basePath: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      {statuses && statuses.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {[{ value: "", label: "Tümü" }, ...statuses].map((s) => {
            const active = status === s.value;
            const href = `${basePath}?${new URLSearchParams({ ...(q ? { q } : {}), ...(s.value ? { status: s.value } : {}) }).toString()}`;
            return (
              <Link
                key={s.value || "all"}
                href={href}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[12px] font-bold transition-colors",
                  active ? "border-foreground bg-foreground text-background" : "border-border text-foreground/70 hover:border-foreground/40"
                )}
              >
                {s.label}
              </Link>
            );
          })}
        </div>
      )}
      <form method="get" className="flex flex-col gap-2 sm:flex-row">
        {status && <input type="hidden" name="status" value={status} />}
        <input
          name="q"
          defaultValue={q}
          placeholder={searchPlaceholder}
          className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-surface-2 px-3 text-[13px] outline-none focus:border-brand"
        />
        <div className="flex gap-2">
          <button type="submit" className="h-10 rounded-lg bg-foreground px-4 text-[13px] font-bold text-background">
            Ara
          </button>
          {(q || status) && (
            <Link href={basePath} className="flex h-10 items-center rounded-lg border border-border px-4 text-[13px] font-bold">
              Temizle
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}
