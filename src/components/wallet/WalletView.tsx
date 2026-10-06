"use client";

import { useState, type ReactNode } from "react";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Banknote,
  ChevronRight,
  Landmark,
  LineChart,
  ListOrdered,
  Target,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { AssetType } from "@prisma/client";
import { AssetIcon } from "@/components/market/AssetIcon";
import { BalanceCard } from "@/components/wallet/BalanceCard";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { CurrencyFlag } from "@/components/wallet/CurrencyFlag";
import { UsdTransferForm } from "@/components/wallet/UsdTransferForm";
import { PnlOverview, PositionDetail } from "@/components/wallet/PositionSheets";
import { WalletHistory } from "@/components/wallet/WalletHistory";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils/cn";
import { formatChangePercent, formatDateTime, formatPrice } from "@/lib/utils/format";

export interface WalletAssetRow {
  id: string;
  symbol: string;
  name: string;
  type: AssetType;
  logoUrl: string | null;
  quantity: number;
  marketValue: number | null;
  currency: string;
  averageCost: number;
  currentPrice: number | null;
  /** Quantity × average cost, in the asset currency. */
  cost: number;
  /** Unrealised result in the asset currency, and as a percent of cost. */
  pnl: number;
  pnlPercent: number | null;
}

export interface WalletRequestRow {
  id: string;
  kind: "DEPOSIT" | "WITHDRAWAL";
  method: "BANK_TRANSFER" | "CRYPTO";
  amount: number;
  status: string;
  reference: string | null;
  /** Masked bank or crypto destination, e.g. "Ziraat · •••• 1326" or "TRC20 · •••• 9f2a". */
  destination: string | null;
  date: string;
}

export interface WalletOrderRow {
  id: string;
  symbol: string;
  assetType: AssetType;
  logoUrl: string | null;
  side: "BUY" | "SELL";
  quantity: number;
  price: number | null;
  status: string;
  date: string;
}

export interface FxDetails {
  direction: "TRY_TO_USD" | "USD_TO_TRY";
  tryAmount: number;
  usdAmount: number;
  rate: number;
}

export interface WalletTxRow {
  id: string;
  type: string;
  metadata: FxDetails | null;
  description: string;
  amount: number;
  date: string;
}

export interface WalletViewData {
  usdTry: number | null;
  cash: number;
  usdBalance: number;
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number | null;
  assets: WalletAssetRow[];
  requests: WalletRequestRow[];
  openOrders: WalletOrderRow[];
  trades: WalletOrderRow[];
  limitOrders: WalletOrderRow[];
  transactions: WalletTxRow[];
}

const TOP_TABS = [
  { key: "spot", label: "Spot" },
  { key: "open", label: "Açık İşlemler" },
  { key: "history", label: "Geçmiş" },
  { key: "limit", label: "Limit Emri" },
] as const;

const SUB_TABS = [
  { key: "assets", label: "Varlıklar" },
  { key: "deposits", label: "Yatırma Talepleri" },
  { key: "withdrawals", label: "Çekim Talepleri" },
] as const;

const STATUS: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Beklemede", cls: "bg-[#F5A524]/15 text-[#B7791F]" },
  COMPLETED: { label: "Tamamlandı", cls: "bg-positive-bg text-positive" },
  APPROVED: { label: "Tamamlandı", cls: "bg-positive-bg text-positive" },
  FILLED: { label: "Gerçekleşti", cls: "bg-positive-bg text-positive" },
  REJECTED: { label: "Reddedildi", cls: "bg-negative-bg text-negative" },
  CANCELLED: { label: "İptal", cls: "bg-surface-3 text-muted" },
  OPEN: { label: "Açık", cls: "bg-brand-bg text-brand" },
  PARTIALLY_FILLED: { label: "Kısmi", cls: "bg-brand-bg text-brand" },
};

const money = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function StatusChip({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, cls: "bg-surface-3 text-muted" };
  return <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", s.cls)}>{s.label}</span>;
}

function IconBubble({ children, tone }: { children: ReactNode; tone: "positive" | "negative" | "neutral" }) {
  return (
    <span
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
        tone === "positive" && "bg-positive-bg text-positive",
        tone === "negative" && "bg-negative-bg text-negative",
        tone === "neutral" && "bg-surface-2 text-foreground"
      )}
    >
      {children}
    </span>
  );
}

function ListCard({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  const cls = "flex items-center gap-3 rounded-2xl border border-border bg-surface p-4";
  return onClick ? (
    <button type="button" onClick={onClick} className={cn(cls, "w-full text-left")}>
      {children}
    </button>
  ) : (
    <div className={cls}>{children}</div>
  );
}

function Tabs<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: readonly { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-5 overflow-x-auto border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)}>
      {items.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={cn(
            "-mb-px shrink-0 border-b-2 pb-2.5 pt-3 text-[14px]",
            value === t.key ? "border-foreground font-semibold text-foreground" : "border-transparent font-medium text-muted"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function WalletView({ data }: { data: WalletViewData }) {
  const [top, setTop] = useState<(typeof TOP_TABS)[number]["key"]>("spot");
  const [sub, setSub] = useState<(typeof SUB_TABS)[number]["key"]>("assets");
  const [sheet, setSheet] = useState<"transfer" | "pnl" | null>(null);
  const [position, setPosition] = useState<WalletAssetRow | null>(null);
  const pnlPositive = data.totalPnl >= 0;
  const deposits = data.requests.filter((r) => r.kind === "DEPOSIT");
  const withdrawals = data.requests.filter((r) => r.kind === "WITHDRAWAL");

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-30 border-b border-border bg-background">
        <Tabs items={TOP_TABS} value={top} onChange={setTop} className="px-4" />
      </div>

      {top === "spot" && (
        <div className="flex flex-col gap-4 px-4 py-4">
          <BalanceCard label="Spot değeri (toplam)" tryAmount={data.totalValue} usdtRate={data.usdTry} />
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-muted">Toplam K/Z</span>
            <span className={cn("num-tabular font-semibold", pnlPositive ? "text-positive" : "text-negative")}>
              {formatPrice(Math.round(data.totalPnl * 100) / 100)}
              {data.totalPnlPercent != null && ` (${formatChangePercent(data.totalPnlPercent)})`}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <QuickLink href="/cuzdan/para-yatir" icon={ArrowDownLeft} label="Para yatır" />
            <QuickLink href="/cuzdan/para-cek" icon={ArrowUpRight} label="Para çek" />
            <QuickButton onClick={() => setSheet("transfer")} icon={ArrowLeftRight} label="Transfer" />
            <QuickButton onClick={() => setSheet("pnl")} icon={LineChart} label="K/Z" />
          </div>

          <Link href="/cuzdan/vadeli-mevduat" className="flex items-center gap-3 rounded-xl bg-[#0B1F3C] px-4 py-3.5 text-white">
            <Landmark size={22} className="shrink-0 text-[#58ABFF]" />
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-bold">Vadeli Mevduat — Faizde İşlet</div>
              <div className="text-[12px] text-[#BECBDD]">Vadeli mevduat hesabı</div>
            </div>
            <ChevronRight size={18} className="shrink-0 text-[#BECBDD]" />
          </Link>

          <Tabs items={SUB_TABS} value={sub} onChange={setSub} />

          {sub === "assets" && (
            <div className="flex flex-col gap-2">
              <ListCard>
                <IconBubble tone="positive"><Banknote size={18} /></IconBubble>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-bold text-foreground">TRY</div>
                  <div className="text-[12px] text-muted">Türk Lirası · nakit</div>
                </div>
                <div className="text-right">
                  <div className="num-tabular text-[14px] font-bold text-foreground">{formatPrice(data.cash)}</div>
                  <div className="num-tabular text-[11px] text-muted">{data.usdTry ? `≈ ${money.format(data.cash / data.usdTry)}` : "Kur alınamıyor"}</div>
                </div>
              </ListCard>
              <ListCard>
                <CurrencyFlag code="US" size={40} />
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-bold text-foreground">USD</div>
                  <div className="text-[12px] text-muted">Amerikan Doları · vadeli birikim için</div>
                </div>
                <div className="num-tabular text-right text-[14px] font-bold text-foreground">${money.format(data.usdBalance)}</div>
              </ListCard>
              {data.assets.length === 0 ? (
                <EmptyState
                  icon={Wallet}
                  title="Portföyünüzde varlık yok"
                  description="Piyasalardan bir varlık seçip ilk alımınızı yapabilirsiniz."
                  action={
                    <Link href="/emirler" className="rounded-full bg-foreground px-4 py-2 text-[13px] font-semibold text-background">
                      İşlem yap
                    </Link>
                  }
                />
              ) : (
                data.assets.map((a) => (
                  <ListCard key={a.id} onClick={() => setPosition(a)}>
                    <AssetIcon symbol={a.symbol} type={a.type} logoUrl={a.logoUrl} size={40} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-bold text-foreground">{a.symbol}</div>
                      <div className="truncate text-[12px] text-muted">
                        {a.name} · {a.quantity} adet
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="num-tabular text-[14px] font-bold text-foreground">
                        {a.marketValue != null ? formatPrice(a.marketValue, a.currency) : "—"}
                      </div>
                      {a.currentPrice != null && a.pnlPercent != null && (
                        <div className={cn("num-tabular text-[11px] font-semibold", a.pnl >= 0 ? "text-positive" : "text-negative")}>
                          {formatChangePercent(a.pnlPercent)}
                        </div>
                      )}
                    </div>
                  </ListCard>
                ))
              )}
            </div>
          )}

          {sub === "deposits" && (
            <RequestList
              rows={deposits}
              empty={{ icon: ArrowDownLeft, title: "Yatırma talebiniz yok", description: "Para yatırdığınızda talepler burada durumlarıyla listelenir." }}
            />
          )}
          {sub === "withdrawals" && (
            <RequestList
              rows={withdrawals}
              empty={{ icon: ArrowUpRight, title: "Çekim talebiniz yok", description: "Para çektiğinizde talepler burada durumlarıyla listelenir." }}
            />
          )}
        </div>
      )}

      {top === "open" && (
        <div className="px-4 py-4">
          <OrderList rows={data.openOrders} empty={{ icon: ListOrdered, title: "Açık işleminiz yok", description: "Bekleyen emirleriniz burada görünür." }} />
        </div>
      )}
      {top === "limit" && (
        <div className="px-4 py-4">
          <OrderList rows={data.limitOrders} empty={{ icon: Target, title: "Limit emriniz yok", description: "Hedef fiyattan emir vermek için İşlem ekranından limit emri oluşturun." }} />
        </div>
      )}
      {top === "history" && (
        <div className="px-4 py-4">
          <WalletHistory trades={data.trades} transactions={data.transactions} />
        </div>
      )}

      <BottomSheet open={sheet === "transfer"} onClose={() => setSheet(null)} title="Transfer">
        <UsdTransferForm cashBalance={data.cash} usdBalance={data.usdBalance} usdTry={data.usdTry} />
      </BottomSheet>
      <BottomSheet open={sheet === "pnl"} onClose={() => setSheet(null)} title="K/Z">
        <PnlOverview
          assets={data.assets}
          totalValue={data.totalValue}
          totalPnl={data.totalPnl}
          totalPnlPercent={data.totalPnlPercent}
          cash={data.cash}
          usdBalance={data.usdBalance}
          usdTry={data.usdTry}
          onSelect={(a) => {
            setSheet(null);
            setPosition(a);
          }}
        />
      </BottomSheet>
      <BottomSheet open={position !== null} onClose={() => setPosition(null)} title="Varlık detayı">
        {position && <PositionDetail asset={position} trades={data.trades} totalValue={data.totalValue} usdTry={data.usdTry} />}
      </BottomSheet>
    </div>
  );
}

function QuickLink({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-2 text-[12px] font-semibold text-foreground">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-bg text-brand">
        <Icon size={22} />
      </span>
      {label}
    </Link>
  );
}

function QuickButton({ onClick, icon: Icon, label }: { onClick: () => void; icon: LucideIcon; label: string }) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-2 text-[12px] font-semibold text-foreground">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-bg text-brand">
        <Icon size={22} />
      </span>
      {label}
    </button>
  );
}

function RequestList({ rows, empty }: { rows: WalletRequestRow[]; empty: { icon: LucideIcon; title: string; description: string } }) {
  if (rows.length === 0) return <EmptyState icon={empty.icon} title={empty.title} description={empty.description} />;
  return (
    <div className="flex flex-col gap-2">
      {rows.map((r) => {
        const isDeposit = r.kind === "DEPOSIT";
        return (
          <div key={r.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center gap-3">
              <IconBubble tone={isDeposit ? "positive" : "negative"}>
                {isDeposit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
              </IconBubble>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-bold text-foreground">{isDeposit ? "Para yatırma" : "Para çekme"}</div>
                <div className="text-[12px] text-muted">{formatDateTime(r.date)}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="num-tabular text-[14px] font-bold text-foreground">{formatPrice(r.amount)}</span>
                <StatusChip status={r.status} />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-border pt-2.5 text-[12px] text-muted">
              <span>{r.method === "CRYPTO" ? "USDT · kripto" : "Türk Lirası · havale"}</span>
              {r.destination && <span className="truncate">{r.destination}</span>}
              {r.reference && <span className="font-mono">Ref {r.reference}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OrderList({ rows, empty }: { rows: WalletOrderRow[]; empty: { icon: LucideIcon; title: string; description: string } }) {
  if (rows.length === 0) return <EmptyState icon={empty.icon} title={empty.title} description={empty.description} />;
  return (
    <div className="flex flex-col gap-2">
      {rows.map((o) => {
        const buy = o.side === "BUY";
        return (
          <ListCard key={o.id}>
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold",
                buy ? "bg-positive-bg text-positive" : "bg-negative-bg text-negative"
              )}
            >
              {buy ? "AL" : "SAT"}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-bold text-foreground">{o.symbol}</div>
              <div className="text-[12px] text-muted">
                {o.quantity} adet · {formatDateTime(o.date)}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="num-tabular text-[14px] font-bold text-foreground">{o.price != null ? formatPrice(o.price) : "—"}</span>
              <StatusChip status={o.status} />
            </div>
          </ListCard>
        );
      })}
    </div>
  );
}
