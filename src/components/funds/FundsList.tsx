"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { formatChangePercent, formatPrice } from "@/lib/utils/format";

export interface FundRow {
  id: string;
  name: string;
  companyName: string;
  category: string;
  description: string | null;
  risk: number;
  unitPrice: number | null;
  currency: string;
  ytdReturn: number | null;
  oneYearReturn: number | null;
  aum: number | null;
  investorCount: number | null;
}

const compactTry = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", notation: "compact", maximumFractionDigits: 1 });
const count = new Intl.NumberFormat("tr-TR");

function ReturnValue({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase text-muted">{label}</span>
      <span className={cn("num-tabular text-[14px] font-bold", value == null ? "text-muted" : value < 0 ? "text-negative" : "text-positive")}>
        {value == null ? "—" : formatChangePercent(value)}
      </span>
    </div>
  );
}

export function FundsList({ funds }: { funds: FundRow[] }) {
  const categories = useMemo(() => Array.from(new Set(funds.map((f) => f.category))), [funds]);
  const [active, setActive] = useState<string>("ALL");
  const visible = active === "ALL" ? funds : funds.filter((f) => f.category === active);

  if (funds.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-sm text-muted">Henüz yayınlanmış fon yok.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {["ALL", ...categories].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActive(c)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-colors",
              active === c ? "border-foreground bg-foreground text-background" : "border-border text-muted"
            )}
          >
            {c === "ALL" ? "Tümü" : c}
          </button>
        ))}
      </div>

      {visible.map((f) => (
        <article key={f.id} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase text-muted">{f.category}</span>
            <h2 className="text-[15px] font-bold leading-5 text-foreground">{f.name}</h2>
            <span className="text-xs text-muted">{f.companyName}</span>
          </div>
          {f.description && <p className="text-[13px] leading-5 text-muted">{f.description}</p>}
          <div className="grid grid-cols-2 gap-3">
            <ReturnValue label="YTD getiri" value={f.ytdReturn} />
            <ReturnValue label="1 yıl getiri" value={f.oneYearReturn} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase text-muted">Risk {f.risk}/7</span>
            <div className="flex gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <span key={i} className={cn("h-1.5 flex-1 rounded-full", i < f.risk ? "bg-brand" : "bg-surface-3")} />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
            <span>Birim pay: <b className="num-tabular text-foreground">{formatPrice(f.unitPrice, f.currency)}</b></span>
            {f.aum != null && <span>Büyüklük: <b className="num-tabular text-foreground">{compactTry.format(f.aum)}</b></span>}
            {f.investorCount != null && <span>Yatırımcı: <b className="num-tabular text-foreground">{count.format(f.investorCount)}</b></span>}
          </div>
        </article>
      ))}
    </div>
  );
}
