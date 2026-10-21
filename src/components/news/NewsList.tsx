"use client";

import { useMemo, useState } from "react";
import { Coins, LineChart, Newspaper, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { NewsItem } from "@/lib/news/feed";
import { cn } from "@/lib/utils/cn";

const TABS = [
  { key: "ALL", label: "Tümü" },
  { key: "BIST", label: "BIST" },
  { key: "NASDAQ", label: "Nasdaq" },
  { key: "EMTIA", label: "Emtia" },
  { key: "EKONOMI", label: "Ekonomi" },
  { key: "PARITE", label: "Parite" },
] as const;

// A real per-article photo isn't available for most sources (the free Google News RSS feed —
// this app's main automated source — carries no image field at all; see news/sync.ts). Rather
// than leave a blank gap or fabricate a stock photo, every card gets a themed placeholder tile
// instead — an admin can still set a real image per article from /admin/haberler.
const CATEGORY_TILE: Record<string, { icon: LucideIcon; className: string }> = {
  BIST: { icon: LineChart, className: "bg-brand/10 text-brand" },
  NASDAQ: { icon: TrendingUp, className: "bg-[#6366F1]/10 text-[#6366F1]" },
  EMTIA: { icon: Coins, className: "bg-[#F59E0B]/10 text-[#F59E0B]" },
  EKONOMI: { icon: Newspaper, className: "bg-muted/10 text-muted" },
  PARITE: { icon: TrendingUp, className: "bg-positive/10 text-positive" },
};

function NewsThumbnail({ image, category }: { image: string | null; category: string }) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element -- external news thumbnails of unknown dimensions
    return <img src={image} alt="" className="aspect-[2/1] w-full object-cover" loading="lazy" />;
  }
  const tile = CATEGORY_TILE[category] ?? CATEGORY_TILE.EKONOMI;
  const Icon = tile.icon;
  return (
    <div className={cn("flex aspect-[2/1] w-full items-center justify-center", tile.className)}>
      <Icon size={28} strokeWidth={1.5} />
    </div>
  );
}

export function NewsList({ items }: { items: NewsItem[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("ALL");
  const visible = useMemo(
    () => (tab === "ALL" ? items : items.filter((i) => i.category === tab)),
    [items, tab]
  );

  return (
    <div className="flex flex-col">
      <div className="sticky top-[68px] z-20 border-b border-border bg-background">
        <div className="flex gap-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "-mb-px shrink-0 border-b-2 pb-2.5 pt-2.5 text-[14px]",
                tab === t.key ? "border-foreground font-semibold text-foreground" : "border-transparent font-medium text-muted"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 py-4">
        {visible.length === 0 && (
          <p className="py-8 text-center text-sm text-muted">Bu kategoride haber bulunmuyor.</p>
        )}
        {visible.map((item) => (
          <a
            key={item.id}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-2 overflow-hidden rounded-xl border border-border bg-surface"
          >
            <NewsThumbnail image={item.image} category={item.category} />
            <div className="flex flex-col gap-1.5 px-3 pb-3 pt-1">
              <span className="text-[11px] font-semibold uppercase text-brand">{item.category}</span>
              <h2 className="text-[15px] font-bold leading-5 text-foreground">{item.title}</h2>
              <span className="text-[12px] text-muted">
                {item.source} · {item.timeLabel}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
