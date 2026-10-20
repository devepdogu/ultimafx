"use client";

import { useEffect, useState } from "react";
import type { AssetType } from "@prisma/client";
import { ChevronRight, X } from "lucide-react";
import { AssetIcon } from "@/components/market/AssetIcon";
import { cn } from "@/lib/utils/cn";
import { formatDateTime } from "@/lib/utils/format";

export type IpoStatus = "UPCOMING" | "ACTIVE" | "COMPLETED" | "CANCELLED";

/** One IPO as the page passes it down. Only our own fields; no upstream copy. */
export interface IpoRow {
  code: string;
  companyName: string;
  market: string | null;
  status: IpoStatus;
  priceMin: number | null;
  priceMax: number | null;
  totalValue: number | null;
  numberOfShares: number | null;
  lotSize: number | null;
  demandStart: string | null;
  demandEnd: string | null;
  listingDate: string | null;
  demandRatio: number | null;
  applicationCount: number | null;
  totalDemand: number | null;
  intermediary: string | null;
  maxLotPerUser: number | null;
  minAmountTry: number | null;
  sourceUrl: string | null;
  /** Logo set directly on the IPO by an admin — shown before falling back to a matching asset. */
  logoUrl: string | null;
  /** Logo from our own asset list when the same symbol is listed; null otherwise. */
  logo: { type: string; logoUrl: string | null } | null;
}

type Tab = "ACTIVE" | "UPCOMING" | "PAST";
const TABS: { key: Tab; label: string }[] = [
  { key: "ACTIVE", label: "Aktif" },
  { key: "UPCOMING", label: "Yaklaşan" },
  { key: "PAST", label: "Geçmiş" },
];

const tabOf = (s: IpoStatus): Tab => (s === "ACTIVE" ? "ACTIVE" : s === "UPCOMING" ? "UPCOMING" : "PAST");

const STATUS: Record<IpoStatus, { label: string; cls: string }> = {
  UPCOMING: { label: "YAKLAŞAN", cls: "bg-[#F59E0B]/13 text-[#F59E0B]" },
  ACTIVE: { label: "AKTİF", cls: "bg-positive-bg text-positive" },
  COMPLETED: { label: "TAMAMLANDI", cls: "bg-surface-3 text-muted" },
  CANCELLED: { label: "İPTAL", cls: "bg-negative-bg text-negative" },
};

const FOOTER: Record<IpoStatus, string> = {
  UPCOMING: "Talep dönemi henüz başlamadı",
  ACTIVE: "Talep toplanıyor",
  COMPLETED: "Talep dönemi tamamlandı",
  CANCELLED: "Halka arz iptal edildi",
};

const tl = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 });
const num = new Intl.NumberFormat("tr-TR");

/** "3,85 Mr" style for large TL amounts (Mr = milyar, Mn = milyon). */
function compactTry(v: number | null) {
  if (v == null) return "-";
  if (v >= 1e9) return `₺${(v / 1e9).toLocaleString("tr-TR", { maximumFractionDigits: 2 })} Mr`;
  if (v >= 1e6) return `₺${(v / 1e6).toLocaleString("tr-TR", { maximumFractionDigits: 2 })} Mn`;
  return tl.format(v);
}

function priceText(row: IpoRow) {
  if (row.priceMin == null && row.priceMax == null) return "-";
  if (row.priceMin != null && row.priceMax != null && row.priceMin !== row.priceMax) {
    return `${tl.format(row.priceMin)} – ${tl.format(row.priceMax)}`;
  }
  return tl.format(row.priceMin ?? row.priceMax ?? 0);
}

const dateText = (iso: string | null) => (iso ? formatDateTime(iso) : "-");

function Logo({ row, size }: { row: IpoRow; size: number }) {
  if (row.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- admin-provided logo, any host
      <img src={row.logoUrl} alt="" width={size} height={size} className="shrink-0 rounded-full border border-border bg-white object-contain" style={{ width: size, height: size }} />
    );
  }
  if (row.logo) {
    return <AssetIcon symbol={row.code} type={row.logo.type as AssetType} logoUrl={row.logo.logoUrl} size={size} />;
  }
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full border border-border bg-white text-[11px] font-extrabold text-[#0C304D]"
      style={{ width: size, height: size }}
    >
      {row.code.replace(/-+$/, "").slice(0, 4)}
    </span>
  );
}

function StatusPill({ status }: { status: IpoStatus }) {
  return (
    <span className={cn("rounded-[6px] px-1.5 py-[3px] text-[10px] font-extrabold leading-none", STATUS[status].cls)}>
      {STATUS[status].label}
    </span>
  );
}

export function IpoList({ ipos, initialCode }: { ipos: IpoRow[]; initialCode: string | null }) {
  const firstWithActive = ipos.some((i) => i.status === "ACTIVE") ? "ACTIVE" : "UPCOMING";
  const [tab, setTab] = useState<Tab>(firstWithActive);
  const [openCode, setOpenCode] = useState<string | null>(initialCode);

  const visible = ipos.filter((i) => tabOf(i.status) === tab);
  const open = ipos.find((i) => i.code === openCode) ?? null;

  // Keep the drawer linkable (?ipo=CODE) without a navigation or a new page.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (openCode) url.searchParams.set("ipo", openCode);
    else url.searchParams.delete("ipo");
    window.history.replaceState(null, "", url.toString());
  }, [openCode]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-1 rounded-full bg-surface-2 p-1">
        {TABS.map((t) => {
          const count = ipos.filter((i) => tabOf(i.status) === t.key).length;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "h-9 rounded-full text-[13px] font-semibold transition-all",
                tab === t.key ? "bg-surface text-foreground shadow-sm" : "text-muted"
              )}
            >
              {t.label} <span className="num-tabular text-[11px] opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-[13px] text-muted">
          {tab === "ACTIVE" ? "Şu an talep toplayan halka arz yok." : tab === "UPCOMING" ? "Yaklaşan halka arz yok." : "Geçmiş halka arz yok."}
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {visible.map((row) => (
            <button
              key={row.code}
              type="button"
              onClick={() => setOpenCode(row.code)}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5 text-left"
            >
              <Logo row={row} size={44} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-extrabold text-foreground">{row.code}</span>
                  <StatusPill status={row.status} />
                </div>
                <div className="line-clamp-2 text-[12px] text-muted">{row.companyName}</div>
              </div>
              <ChevronRight size={18} className="shrink-0 text-muted" />
            </button>
          ))}
        </div>
      )}

      {open && <IpoDrawer row={open} onClose={() => setOpenCode(null)} />}
    </div>
  );
}

function IpoDrawer({ row, onClose }: { row: IpoRow; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={row.companyName}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[22px] border-t border-border bg-background"
      >
        <div className="flex justify-center pt-2 pb-1">
          <span className="h-1 w-10 rounded-full bg-border-strong" />
        </div>

        <div className="flex items-center gap-3 border-b border-border px-4 pb-3 pt-2">
          <Logo row={row} size={48} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[17px] font-extrabold text-foreground">{row.code}</span>
              <StatusPill status={row.status} />
            </div>
            <div className="line-clamp-2 text-[12px] text-muted">{row.companyName}</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Kapat" className="shrink-0 text-muted">
            <X size={22} />
          </button>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto p-4 pb-8">
          <div className="grid grid-cols-2 gap-2.5">
            <Stat label="Hisse Fiyatı" value={priceText(row)} />
            <Stat label="Lot Büyüklüğü" value={row.lotSize != null ? num.format(row.lotSize) : "-"} />
            <Stat label="Toplam Hisse" value={row.numberOfShares != null ? num.format(row.numberOfShares) : "-"} />
            <Stat label="Arz Büyüklüğü" value={compactTry(row.totalValue)} />
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-muted">TALEP DURUMU</span>
              <span className="text-[13px] font-extrabold text-brand">
                {row.demandRatio != null ? `${row.demandRatio.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}x talep` : "-"}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(100, row.demandRatio ?? 0)}%` }} />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted">
              <span>{row.applicationCount != null ? `${num.format(row.applicationCount)} başvuran` : "-"}</span>
              <span>Toplam Talep: {compactTry(row.totalDemand)}</span>
            </div>
          </div>

          <Card title="Önemli Tarihler">
            <Row label="Talep Başlangıcı" value={dateText(row.demandStart)} />
            <Row label="Talep Bitişi" value={dateText(row.demandEnd)} />
            <Row label="BİST'te İşleme Başlama" value={dateText(row.listingDate)} />
          </Card>

          <Card title="Şirket Bilgileri">
            <Row label="Sektör / Pazar" value={row.market ?? "-"} />
            <Row label="Aracı Kurum" value={row.intermediary ?? "-"} />
            <Row label="Kişi Başı Maks. Lot" value={row.maxLotPerUser != null ? num.format(row.maxLotPerUser) : "-"} />
            <Row label="Min. Başvuru Tutarı" value={row.minAmountTry != null ? tl.format(row.minAmountTry) : "-"} />
          </Card>

          {row.sourceUrl && (
            <a
              href={row.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 items-center justify-center rounded-2xl border border-border bg-surface text-[13px] font-semibold text-brand"
            >
              Kaynakta incele
            </a>
          )}
        </div>

        <div className="border-t border-border bg-surface px-4 py-3 text-center text-[13px] font-bold text-foreground">
          {FOOTER[row.status]}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-3.5">
      <span className="text-[11px] font-bold text-muted">{label}</span>
      <span className="num-tabular text-[15px] font-extrabold text-foreground">{value}</span>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-4">
      <span className="mb-1 text-[14px] font-bold text-foreground">{title}</span>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-[12px]">
      <span className="font-semibold text-muted">{label}</span>
      <span className="text-right font-bold text-foreground">{value}</span>
    </div>
  );
}
