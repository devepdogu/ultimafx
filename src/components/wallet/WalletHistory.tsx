"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, History } from "lucide-react";
import { AssetIcon } from "@/components/market/AssetIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import type { WalletOrderRow, WalletTxRow } from "@/components/wallet/WalletView";
import { cn } from "@/lib/utils/cn";
import { formatPrice } from "@/lib/utils/format";

const TZ = "Europe/Istanbul";
const FILTERS = [
  { key: "all", label: "Tümü" },
  { key: "trades", label: "İşlemler" },
  { key: "cash", label: "Hareketler" },
] as const;

type Filter = (typeof FILTERS)[number]["key"];
type Entry = { kind: "trade"; id: string; date: string; row: WalletOrderRow } | { kind: "cash"; id: string; date: string; row: WalletTxRow };

const CASH_TITLES: Record<string, string> = {
  DEPOSIT: "Para yatırma",
  WITHDRAWAL: "Para çekme",
  TERM_DEPOSIT_OPEN: "Vadeli mevduat açılışı",
  TERM_DEPOSIT_PAYOUT: "Vadeli mevduat ödemesi",
  FX_CONVERSION: "Döviz dönüşümü",
  ADJUSTMENT: "Bakiye düzeltmesi",
  FEE: "Ücret",
  REFUND: "İade",
  TRANSFER: "Transfer",
};

const dayFmt = new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, day: "numeric", month: "long", year: "numeric" });
const money = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const timeFmt = new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
const dayKeyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });

/** YYYY-MM-DD in Istanbul time, so grouping matches how the user reads dates. */
function dayKey(date: Date) {
  return dayKeyFmt.format(date);
}

function dayLabel(key: string, today: string, yesterday: string) {
  if (key === today) return "Bugün";
  if (key === yesterday) return "Dün";
  const [y, m, d] = key.split("-").map(Number);
  return dayFmt.format(new Date(Date.UTC(y, m - 1, d, 12)));
}

export function WalletHistory({ trades, transactions }: { trades: WalletOrderRow[]; transactions: WalletTxRow[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const entries = useMemo<Entry[]>(() => {
    // Market buys and sells already appear as trade rows; their wallet movements would show the same event twice.
    const cash = transactions.filter((t) => t.type !== "TRADE_BUY" && t.type !== "TRADE_SELL");
    const all: Entry[] = [
      ...trades.map((row) => ({ kind: "trade" as const, id: `t-${row.id}`, date: row.date, row })),
      ...cash.map((row) => ({ kind: "cash" as const, id: `c-${row.id}`, date: row.date, row })),
    ];
    return all.sort((a, b) => b.date.localeCompare(a.date));
  }, [trades, transactions]);

  const visible = entries.filter((e) => filter === "all" || (filter === "trades" ? e.kind === "trade" : e.kind === "cash"));

  // Read the clock once per mount so render stays pure; "Bugün"/"Dün" labels refresh on the next visit.
  const [now] = useState(() => Date.now());
  const groups = useMemo(() => {
    const today = dayKey(new Date(now));
    const yesterday = dayKey(new Date(now - 86_400_000));
    const map = new Map<string, { label: string; items: Entry[] }>();
    for (const e of visible) {
      const key = dayKey(new Date(e.date));
      if (!map.has(key)) map.set(key, { label: dayLabel(key, today, yesterday), items: [] });
      map.get(key)!.items.push(e);
    }
    return Array.from(map.values());
  }, [visible, now]);

  const counts: Record<Filter, number> = {
    all: entries.length,
    trades: trades.length,
    cash: entries.filter((e) => e.kind === "cash").length,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
              filter === f.key ? "bg-foreground text-background" : "bg-surface-2 text-muted"
            )}
          >
            {f.label}
            <span className={cn("num-tabular text-[11px]", filter === f.key ? "opacity-70" : "text-muted")}>{counts[f.key]}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={History}
          title={filter === "trades" ? "Gerçekleşmiş işlem yok" : filter === "cash" ? "Cüzdan hareketi yok" : "Geçmiş boş"}
          description="Alım, satım, yatırma, çekme ve vadeli mevduat hareketleriniz burada tarih sırasıyla görünür."
        />
      ) : (
        groups.map((g) => (
          <section key={g.label + g.items[0].id} className="flex flex-col gap-2">
            <h3 className="px-1 text-[12px] font-semibold uppercase tracking-wide text-muted">{g.label}</h3>
            <div className="flex flex-col gap-2">{g.items.map((e) => (e.kind === "trade" ? <TradeRow key={e.id} row={e.row} /> : e.row.metadata ? <FxRow key={e.id} row={{ ...e.row, metadata: e.row.metadata }} /> : <CashRow key={e.id} row={e.row} />))}</div>
          </section>
        ))
      )}
    </div>
  );
}

/* Every history card shares one anatomy: p-4, a header row (icon, title, amount) and an optional body grid below a divider. */

function Card({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">{children}</div>;
}

function CardHeader({
  icon,
  title,
  subtitle,
  amount,
  amountTone,
}: {
  icon: ReactNode;
  title: ReactNode;
  subtitle: string;
  amount?: string;
  amountTone?: "positive" | "negative" | "default";
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {icon}
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[14px] font-bold text-foreground">{title}</div>
          <div className="num-tabular text-[12px] text-muted">{subtitle}</div>
        </div>
      </div>
      {amount && (
        <span
          className={cn(
            "num-tabular shrink-0 text-right text-[15px] font-bold",
            amountTone === "positive" && "text-positive",
            amountTone === "negative" && "text-negative",
            (!amountTone || amountTone === "default") && "text-foreground"
          )}
        >
          {amount}
        </span>
      )}
    </div>
  );
}

function Bubble({ tone, children }: { tone: "positive" | "negative" | "brand" | "neutral"; children: ReactNode }) {
  return (
    <span
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
        tone === "positive" && "bg-positive-bg text-positive",
        tone === "negative" && "bg-negative-bg text-negative",
        tone === "brand" && "bg-brand-bg text-brand",
        tone === "neutral" && "bg-surface-2 text-foreground"
      )}
    >
      {children}
    </span>
  );
}

function Cell({ label, value, align = "left" }: { label: string; value: string; align?: "left" | "right" }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-0.5", align === "right" && "items-end text-right")}>
      <span className="text-[11px] text-muted">{label}</span>
      <span className="num-tabular truncate text-[13px] font-semibold text-foreground">{value}</span>
    </div>
  );
}

/** Market buy or sell: the asset, how many, the price it executed at, and the total. */
function TradeRow({ row }: { row: WalletOrderRow }) {
  const buy = row.side === "BUY";
  const total = row.price != null ? row.quantity * row.price : null;
  return (
    <Card>
      <CardHeader
        icon={<AssetIcon symbol={row.symbol} type={row.assetType} logoUrl={row.logoUrl} size={40} />}
        title={
          <>
            <span>{row.symbol}</span>
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[10px] font-extrabold",
                buy ? "bg-positive-bg text-positive" : "bg-negative-bg text-negative"
              )}
            >
              {buy ? "ALIŞ" : "SATIŞ"}
            </span>
          </>
        }
        subtitle={dayTime(row.date)}
        amount={total != null ? `${buy ? "−" : "+"}${formatPrice(total)}` : "—"}
        amountTone={buy ? "default" : "positive"}
      />
      <div className="grid grid-cols-3 gap-3 border-t border-border pt-3">
        <Cell label="Adet" value={String(row.quantity)} />
        <Cell label="Birim fiyat" value={row.price != null ? formatPrice(row.price) : "—"} />
        <Cell label="Yön" value={buy ? "Alım" : "Satım"} align="right" />
      </div>
    </Card>
  );
}

/** TRY ↔ USD conversion: what was given, what was received, and the rate used. */
function FxRow({ row }: { row: WalletTxRow & { metadata: NonNullable<WalletTxRow["metadata"]> } }) {
  const m = row.metadata;
  const toUsd = m.direction === "TRY_TO_USD";
  const given = toUsd ? `₺${money.format(m.tryAmount)}` : `$${money.format(m.usdAmount)}`;
  const received = toUsd ? `$${money.format(m.usdAmount)}` : `₺${money.format(m.tryAmount)}`;
  return (
    <Card>
      <CardHeader
        icon={<Bubble tone="brand"><ArrowLeftRight size={16} /></Bubble>}
        title={toUsd ? "TL → USD" : "USD → TL"}
        subtitle={dayTime(row.date)}
      />
      <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
        <Cell label="Verilen" value={given} />
        <Cell label="Alınan" value={received} align="right" />
      </div>
      <div className="text-[12px] text-muted">
        Kur <span className="num-tabular font-semibold text-foreground">1 USD = ₺{money.format(m.rate)}</span>
      </div>
    </Card>
  );
}

/** Any other wallet movement: a titled row with its amount and the stored description. */
function CashRow({ row }: { row: WalletTxRow }) {
  const out = row.amount < 0;
  const title = CASH_TITLES[row.type] ?? "Hareket";
  const detail = row.description && row.description !== title ? row.description : null;
  const subtitle = detail ? `${detail} · ${dayTime(row.date)}` : dayTime(row.date);
  return (
    <Card>
      <CardHeader
        icon={<Bubble tone={out ? "negative" : "positive"}>{out ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}</Bubble>}
        title={title}
        subtitle={subtitle}
        amount={`${out ? "−" : "+"}${formatPrice(Math.abs(row.amount))}`}
        amountTone={out ? "negative" : "positive"}
      />
    </Card>
  );
}

function dayTime(iso: string) {
  return timeFmt.format(new Date(iso));
}
