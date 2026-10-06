"use client";

import { useMemo, useState } from "react";
import { Search, ChevronDown, ChevronUp, Rocket } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { AssetRow, type AssetRowData } from "@/components/market/AssetRow";
import { MarketStatusStrip, useMarketOpen } from "@/components/market/MarketStatusStrip";
import { getAssetBasePath } from "@/lib/market-data/asset-routes";
import { cn } from "@/lib/utils/cn";

export interface StockRowData extends AssetRowData {
  volume: number | null;
}

type AssetClass = "bist" | "nasdaq" | "emtia" | "endeks" | "parite";
type SortKey = "all" | "gainers" | "losers" | "favorites";

const VISIBLE_COUNT = 8;

function turkishIncludes(haystack: string, needle: string): boolean {
  const norm = (s: string) => s.toLocaleLowerCase("tr-TR");
  return norm(haystack).includes(norm(needle));
}

interface MarketsExplorerProps {
  bist: StockRowData[];
  nasdaq: AssetRowData[];
  emtia: AssetRowData[];
  endeks: AssetRowData[];
  parite: AssetRowData[];
  favoriteIds: string[];
}

export function MarketsExplorer({ bist, nasdaq, emtia, endeks, parite, favoriteIds }: MarketsExplorerProps) {
  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const [assetClass, setAssetClass] = useState<AssetClass>("bist");
  const [sort, setSort] = useState<SortKey>("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const isOpen = useMarketOpen();

  const rows: AssetRowData[] = useMemo(
    () =>
      assetClass === "bist"
        ? bist
        : assetClass === "nasdaq"
          ? nasdaq
          : assetClass === "emtia"
            ? emtia
            : assetClass === "endeks"
              ? endeks
              : assetClass === "parite"
                ? parite
                : [],
    [assetClass, bist, nasdaq, emtia, endeks, parite]
  );

  const filtered = useMemo(() => {
    let list = rows;
    if (query.trim()) {
      list = list.filter((r) => turkishIncludes(r.symbol, query) || turkishIncludes(r.name, query));
    }
    switch (sort) {
      case "gainers":
        return [...list].sort((a, b) => (b.changePercent ?? -Infinity) - (a.changePercent ?? -Infinity));
      case "losers":
        return [...list].sort((a, b) => (a.changePercent ?? Infinity) - (b.changePercent ?? Infinity));
      case "favorites":
        return list.filter((r) => favoriteIdSet.has(r.id));
      default:
        return list;
    }
  }, [rows, query, sort, favoriteIdSet]);

  const visible = expanded ? filtered : filtered.slice(0, VISIBLE_COUNT);

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-20 bg-background">
        <div className="flex flex-col gap-3  pb-3 pt-3">
          <div className="px-4">
            <div className="flex items-center gap-2 rounded-sm border border-border bg-surface px-3 py-2.5">
              <Search size={18} className="shrink-0 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Sembol veya isim ara..."
                className="min-w-0 flex-1 bg-transparent text-[14px] text-foreground outline-none placeholder:text-muted"
              />
            </div>
          </div>
          <UnderlineTabs
            value={assetClass}
            className="px-3"
            onChange={(v) => {
              setAssetClass(v);
              setExpanded(false);
            }}
            options={[
              { value: "bist", label: "BIST" },
              { value: "nasdaq", label: "Nasdaq" },
              { value: "emtia", label: "Emtia" },
              { value: "endeks", label: "Endeks" },
              { value: "parite", label: "Parite" },
            ]}
          />
        </div>
        <div className="px-1">
          <UnderlineTabs
            value={sort}
            onChange={setSort}
            options={[
              { value: "all", label: "Tümü" },
              { value: "gainers", label: "Yükselen" },
              { value: "losers", label: "Düşen" },
              { value: "favorites", label: "Favoriler" },
            ]}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-3">
        {assetClass === "nasdaq" && nasdaq.length === 0 ? (
          <Card className="mx-4">
            <EmptyState
              icon={Rocket}
              title="Nasdaq varlığı henüz eklenmedi"
              description="ABD hisseleri yönetim panelinden eklendiğinde burada listelenir."
            />
          </Card>
        ) : (
          <>
            {assetClass !== "nasdaq" && (
              <MarketStatusStrip />
            )}

            <div className="flex flex-col">
              {visible.map((asset) => (
                <AssetRow
                  key={asset.id}
                  asset={asset}
                  href={`${getAssetBasePath(asset.type)}/${asset.symbol}`}
                  showChangeAmount={false}
                  trailing={
                    <span className="ml-2 whitespace-nowrap rounded-[6px] border border-border bg-surface-3 px-2 py-1 text-[12px] font-semibold leading-none text-muted">
                      {isOpen ? "Açık" : "Kapalı"}
                    </span>
                  }
                />
              ))}
              {filtered.length === 0 && (
                <Card>
                  <p className="py-4 text-center text-sm text-muted">Sonuç bulunamadı.</p>
                </Card>
              )}
            </div>

            {filtered.length > VISIBLE_COUNT && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mx-4 flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold text-brand hover:bg-surface-2"
              >
                {expanded ? "Daha Az Göster" : "Devamını Gör"}
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function UnderlineTabs<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  className?: string;
  onChange: (v: T) => void;
}) {
  return (
    <div className="border-b border-border">
      <div className="flex gap-4 px-4">
        {options.map((o) => {
          const buttonClassName = value === o.value
            ? "-mb-px border-b-2 border-foreground pb-2.5 pt-2 text-[14px] font-semibold text-foreground"
            : "-mb-px border-b-2 border-transparent pb-2.5 pt-2 text-[14px] font-medium text-muted";
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={cn(buttonClassName, className)}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  );
}
