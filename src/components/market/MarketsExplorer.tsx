"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { AssetType } from "@prisma/client";
import { Search, Rocket, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { AssetRow, type AssetRowData } from "@/components/market/AssetRow";
import { hasSession, isAssetSessionOpen, sessionHoursLabel } from "@/lib/trading/session";
import { getAssetBasePath } from "@/lib/market-data/asset-routes";
import { cn } from "@/lib/utils/cn";

const VISIBLE_COUNT = 8;

function subscribeMinute(onChange: () => void) {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}

/** Minutes since epoch: a stable snapshot that only changes once a minute. */
function currentMinute() {
  return Math.floor(Date.now() / 60_000);
}
const SEARCH_DEBOUNCE_MS = 300;

export interface StockRowData extends AssetRowData {
  volume: number | null;
}

type AssetClass = "bist" | "nasdaq" | "emtia" | "endeks" | "parite" | "kripto";
type SortKey = "all" | "gainers" | "losers" | "favorites";

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
  kripto: AssetRowData[];
  favoriteIds: string[];
}

export function MarketsExplorer({ bist, nasdaq, emtia, endeks, parite, kripto, favoriteIds }: MarketsExplorerProps) {
  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const [assetClass, setAssetClass] = useState<AssetClass>("bist");
  const [sort, setSort] = useState<SortKey>("all");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [expanded, setExpanded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  // One clock for the whole list, ticking once a minute. Null on the server so badges never disagree with the first client render.
  const minute = useSyncExternalStore(subscribeMinute, currentMinute, () => null);
  const now = minute == null ? null : new Date(minute * 60_000);

  // Each tab reports its own exchange session; FX, gold and funds have none to report.
  const stripType: AssetType | null =
    assetClass === "bist" ? "STOCK" : assetClass === "endeks" ? "INDEX" : assetClass === "nasdaq" ? "US_STOCK" : null;
  const stripOpen = stripType && now ? isAssetSessionOpen(stripType, now) : null;

  function sessionBadge(type: AssetType) {
    if (!now || !hasSession(type)) return undefined;
    const open = isAssetSessionOpen(type, now);
    return (
      <span className="ml-2 whitespace-nowrap rounded-[6px] border border-border bg-surface-3 px-2 py-1 text-[12px] font-semibold leading-none text-muted">
        {open ? "Açık" : "Kapalı"}
      </span>
    );
  }

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
                : assetClass === "kripto"
                  ? kripto
                  : [],
    [assetClass, bist, nasdaq, emtia, endeks, parite, kripto]
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
                value={draft}
                onChange={(e) => {
                  const next = e.target.value;
                  setDraft(next);
                  if (debounceRef.current) clearTimeout(debounceRef.current);
                  debounceRef.current = setTimeout(() => setQuery(next), SEARCH_DEBOUNCE_MS);
                }}
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
            }}
            options={[
              { value: "bist", label: "BIST" },
              { value: "nasdaq", label: "Nasdaq" },
              { value: "emtia", label: "Emtia" },
              { value: "endeks", label: "Endeks" },
              { value: "parite", label: "Parite" },
              { value: "kripto", label: "Kripto" },
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
        ) : assetClass === "kripto" && kripto.length === 0 ? (
          <Card className="mx-4">
            <EmptyState
              icon={Rocket}
              title="Kripto varlığı henüz eklenmedi"
              description="Kripto paralar yönetim panelinden eklendiğinde burada listelenir."
            />
          </Card>
        ) : (
          <>
            {stripType && stripOpen !== null && (
              <div className={cn("flex items-center gap-2 rounded-xl px-3 py-2 text-[12px]", stripOpen ? "bg-positive-bg" : "bg-negative-bg")}>
                <span className={cn("whitespace-nowrap font-semibold", stripOpen ? "text-positive" : "text-negative")}>
                  {stripOpen ? "Piyasa açık" : "Piyasa kapalı"}
                </span>
                <span className="text-muted">|</span>
                <span className="min-w-0 truncate text-muted">{sessionHoursLabel(stripType)}</span>
              </div>
            )}

            <div className="flex flex-col">
              {visible.map((asset) => (
                <AssetRow
                  key={asset.id}
                  asset={asset}
                  className="px-4"
                  href={`${getAssetBasePath(asset.type)}/${asset.symbol}`}
                  showChangeAmount={false}
                  trailing={sessionBadge(asset.type)}
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
                className="flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold text-brand hover:bg-surface-2"
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
      <div className="flex gap-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
