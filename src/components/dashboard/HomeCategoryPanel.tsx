"use client";

import { useState } from "react";
import { Bitcoin } from "lucide-react";
import { AssetRow, type AssetRowData } from "@/components/market/AssetRow";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export const CATEGORY_TABS = [
  { key: "all", label: "Tümü" },
  { key: "bist", label: "BIST" },
  { key: "nasdaq", label: "Nasdaq" },
  { key: "emtia", label: "Emtia" },
  { key: "endeks", label: "Endeks" },
  { key: "parite", label: "Parite" },
  { key: "kripto", label: "Kripto" },
] as const;

export type CategoryKey = (typeof CATEGORY_TABS)[number]["key"];
export type HomeRow = AssetRowData & { href?: string };

/** Tabs switch in-place with preloaded rows — no navigation, no re-render of the page shell. */
export function HomeCategoryPanel({ groups }: { groups: Record<CategoryKey, HomeRow[]> }) {
  const [active, setActive] = useState<CategoryKey>("bist");
  const rows = groups[active];

  return (
    <div className="flex flex-col">
      <div className="flex gap-5 overflow-x-auto overscroll-x-contain scrollbar-none overflow-y-hidden border-b border-border">
        {CATEGORY_TABS.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setActive(c.key)}
            className={`-mb-px shrink-0 border-b-3 pb-2 text-[14px] font-bold transition-colors ${
              c.key === active ? "border-brand text-foreground" : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={Bitcoin}
            title={active === "kripto" ? "Kripto veri kaynağı bağlı değil" : "Bu kategoride varlık yok"}
            description="Varlıklar yönetim panelinden eklendiğinde burada listelenir."
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((r) => (
            <AssetRow key={r.id} asset={r} href={r.href} />
          ))}
        </div>
      )}
    </div>
  );
}
