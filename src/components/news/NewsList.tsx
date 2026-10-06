"use client";

import { useMemo, useState } from "react";
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
            {item.image && (
              // eslint-disable-next-line @next/next/no-img-element -- external news thumbnails of unknown dimensions
              <img src={item.image} alt="" className="aspect-[2/1] w-full object-cover" loading="lazy" />
            )}
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
