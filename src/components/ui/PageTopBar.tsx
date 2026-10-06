import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";

/** Custom top bar for sub-pages that replace the default app header (back arrow + title). */
export function PageTopBar({ title, backHref, right }: { title: string; backHref: string; right?: ReactNode }) {
  return (
    <div className="sticky top-0 z-30 flex h-[68px] items-center gap-3 bg-background px-4">
      <Link href={backHref} aria-label="Geri" className="shrink-0 text-foreground">
        <ArrowLeft size={22} />
      </Link>
      <h1 className="min-w-0 flex-1 truncate text-[18px] font-bold text-foreground">{title}</h1>
      {right}
    </div>
  );
}
