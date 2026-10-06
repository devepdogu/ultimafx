"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import type { AssetType } from "@prisma/client";
import { ChevronDown, Search } from "lucide-react";
import { AssetIcon } from "@/components/market/AssetIcon";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { cn } from "@/lib/utils/cn";

export interface PickerAsset {
  symbol: string;
  name: string;
  type: AssetType;
  logoUrl: string | null;
}

interface AssetPickerProps {
  current: PickerAsset;
  assets: PickerAsset[];
}

/** Filter order follows the trade mock: Parite, Emtia, Endeks, BIST, Nasdaq, Kripto. */
const FILTERS: { key: string; label: string; types: AssetType[] }[] = [
  { key: "CURRENCY", label: "Parite", types: ["CURRENCY"] },
  { key: "COMMODITY", label: "Emtia", types: ["COMMODITY"] },
  { key: "INDEX", label: "Endeks", types: ["INDEX"] },
  { key: "STOCK", label: "BIST", types: ["STOCK"] },
  { key: "US_STOCK", label: "Nasdaq", types: ["US_STOCK"] },
  { key: "CRYPTO", label: "Kripto", types: ["CRYPTO"] },
];

const MAX_ROWS = 120;

/** Header trigger showing the current asset; tapping it opens the asset selector drawer. */
export function AssetPicker({ current, assets }: AssetPickerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<string>("STOCK");
  const [query, setQuery] = useState("");
  const [, startTransition] = useTransition();

  const visible = useMemo(() => {
    const f = FILTERS.find((x) => x.key === filter);
    const q = query.trim().toLocaleLowerCase("tr-TR");
    return assets
      .filter((a) => (f ? f.types.includes(a.type) : true))
      .filter((a) => !q || a.symbol.toLocaleLowerCase("tr-TR").includes(q) || a.name.toLocaleLowerCase("tr-TR").includes(q))
      .slice(0, MAX_ROWS);
  }, [assets, filter, query]);

  function choose(symbol: string) {
    setOpen(false);
    setQuery("");
    startTransition(() => router.push(`/emirler?symbol=${encodeURIComponent(symbol)}`));
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-1 py-1 text-left"
      >
        <AssetIcon symbol={current.symbol} type={current.type} logoUrl={current.logoUrl} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="truncate text-[18px] font-bold leading-6 text-foreground">{current.symbol}</span>
            <ChevronDown size={16} className="shrink-0 text-muted" />
          </div>
          <div className="truncate text-[12px] leading-4 text-muted">{current.name}</div>
        </div>
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Varlık Seç">
        <div className="flex flex-col gap-3 pb-2">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5">
            <Search size={18} className="shrink-0 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Sembol veya isim ara"
              className="min-w-0 flex-1 bg-transparent text-[14px] text-foreground outline-none placeholder:text-muted"
            />
          </div>

          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-1.5 text-[13px] font-semibold",
                  filter === f.key ? "border-foreground bg-foreground text-background" : "border-border text-muted"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col">
            {visible.length === 0 && <p className="py-8 text-center text-sm text-muted">Sonuç bulunamadı.</p>}
            {visible.map((a) => (
              <button
                key={a.symbol}
                type="button"
                onClick={() => choose(a.symbol)}
                className="flex items-center gap-3 border-b border-border py-3 text-left"
              >
                <AssetIcon symbol={a.symbol} type={a.type} logoUrl={a.logoUrl} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-semibold text-foreground">{a.symbol}</div>
                  <div className="truncate text-[12px] text-muted">{a.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
