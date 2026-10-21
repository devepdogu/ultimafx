"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import type { AssetType } from "@prisma/client";
import { Minus, Plus } from "lucide-react";
import { useToast } from "@/components/ui/Toaster";
import { AssetIcon } from "@/components/market/AssetIcon";
import { AssetPicker, type PickerAsset } from "@/components/trading/AssetPicker";
import {
  cancelOrderAction,
  closePositionAction,
  placeLimitOrderAction,
  placeMarketOrderAction,
  type TradeActionResult,
} from "@/lib/trading/actions";
import { closeLeveragedPositionAction, placeLeveragedOrderAction } from "@/lib/trading/leverage-actions";
import { isAssetSessionOpen, sessionHoursLabel } from "@/lib/trading/session";
import { cn } from "@/lib/utils/cn";
import { formatChangePercent } from "@/lib/utils/format";

export interface TerminalAsset {
  id: string;
  symbol: string;
  name: string;
  type: AssetType;
  currency: string;
  logoUrl: string | null;
  decimalPrecision: number;
  tradingEnabled: boolean;
}

export interface TerminalPosition {
  id: string;
  assetId: string;
  symbol: string;
  type: AssetType;
  logoUrl: string | null;
  currency: string;
  quantity: number;
  averageCost: number;
  currentPrice: number | null;
  marketValue: number | null;
}

export interface TerminalOrder {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  type: "MARKET" | "LIMIT";
  quantity: number;
  limitPrice: number | null;
  status: string;
}

export interface TerminalLeveragedPosition {
  id: string;
  assetId: string;
  symbol: string;
  type: AssetType;
  logoUrl: string | null;
  currency: string;
  side: "BUY" | "SELL";
  quantity: number;
  entryPrice: number;
  leverage: number;
  margin: number;
  currentPrice: number | null;
  pnl: number | null;
}

interface TradeTerminalProps {
  asset: TerminalAsset;
  price: number | null;
  bid: number | null;
  ask: number | null;
  changePercent: number | null;
  cashBalance: number;
  balanceCurrency: "TRY" | "USD";
  heldQuantity: number;
  positions: TerminalPosition[];
  orders: TerminalOrder[];
  leveragedPositions: TerminalLeveragedPosition[];
  maxLeverage: number;
  initialSide?: "BUY" | "SELL";
  loggedIn: boolean;
  pickerAssets: PickerAsset[];
}

const TYPE_LABEL: Partial<Record<AssetType, string>> = {
  STOCK: "Hisse",
  US_STOCK: "Hisse",
  INDEX: "Endeks",
  CURRENCY: "Parite",
  COMMODITY: "Emtia",
  CRYPTO: "Kripto",
  FUND: "Fon",
};

const BUY = "#00A651";
const SELL = "#FF4976";

const money = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const priceFmt = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pfmt = (v: number | null) => (v == null ? "—" : priceFmt.format(v));
const fmtMoney = (v: number | null, currency: string) => (v == null ? "—" : `${money.format(v)} ${currency}`);

export function TradeTerminal(props: TradeTerminalProps) {
  const { asset, price, bid, ask, changePercent, cashBalance, balanceCurrency, heldQuantity, positions, orders, leveragedPositions, maxLeverage, loggedIn, pickerAssets } = props;
  const router = useRouter();
  const [mode, setMode] = useState<"MARKET" | "LIMIT">("MARKET");
  const [side, setSide] = useState<"BUY" | "SELL">(props.initialSide ?? "BUY");
  const isWhole = asset.type === "STOCK" || asset.type === "US_STOCK" || asset.type === "INDEX";
  const step = isWhole ? 1 : 0.01;
  const [quantity, setQuantity] = useState(step);
  const [limitPrice, setLimitPrice] = useState("");
  const [leverage, setLeverage] = useState(1);
  const [tab, setTab] = useState<"positions" | "leveraged" | "orders">("positions");
  const [closeConfirmId, setCloseConfirmId] = useState<string | null>(null);
  const [closeLevConfirmId, setCloseLevConfirmId] = useState<string | null>(null);
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const parsedLimit = Number(limitPrice.replace(",", ".")) || null;
  const buyPrice = ask ?? price;
  const sellPrice = bid ?? price;
  const refPrice = mode === "LIMIT" ? parsedLimit : side === "BUY" ? buyPrice : sellPrice;
  const positionValue = refPrice != null ? quantity * refPrice : null;
  const requiredMargin = positionValue != null ? positionValue / leverage : null;
  const leverageQuickPicks = useMemo(() => {
    const picks = [1, Math.round(maxLeverage / 4), Math.round(maxLeverage / 2), maxLeverage].filter((v) => v > 0);
    return [...new Set(picks)].slice(0, 4);
  }, [maxLeverage]);
  const maxQty = useMemo(() => {
    if (side === "SELL") return heldQuantity;
    return refPrice && refPrice > 0 ? Math.floor((cashBalance / refPrice) * (isWhole ? 1 : 100)) / (isWhole ? 1 : 100) : 0;
  }, [side, heldQuantity, refPrice, cashBalance, isWhole]);

  // null until mounted, so the server render and first client render agree.
  const [sessionOpen, setSessionOpen] = useState<boolean | null>(null);
  useEffect(() => {
    const check = () => setSessionOpen(isAssetSessionOpen(asset.type));
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, [asset.type]);
  const hours = sessionHoursLabel(asset.type);

  const tradable = asset.tradingEnabled && loggedIn && sessionOpen === true;
  const limitOk = mode === "MARKET" || (parsedLimit ?? 0) > 0;
  const canSubmit = tradable && quantity >= step && refPrice != null && limitOk && !pending;

  function setQty(next: number) {
    const clamped = Math.max(step, Math.round(next / step) * step);
    setQuantity(Number(clamped.toFixed(isWhole ? 0 : 2)));
  }

  function submit() {
    const fd = new FormData();
    fd.set("assetId", asset.id);
    fd.set("side", side);
    fd.set("quantity", String(quantity));
    startTransition(async () => {
      let res: TradeActionResult;
      if (mode === "MARKET" && leverage > 1) {
        fd.set("leverage", String(leverage));
        res = await placeLeveragedOrderAction({}, fd);
      } else if (mode === "MARKET") {
        res = await placeMarketOrderAction({}, fd);
      } else {
        fd.set("limitPrice", limitPrice.replace(",", "."));
        res = await placeLimitOrderAction({}, fd);
      }
      if (res.error) toast.error(res.error);
      else if (res.success) toast.success(res.success);
      router.refresh();
    });
  }

  function closeLeveraged(positionId: string) {
    setCloseLevConfirmId(null);
    startTransition(async () => {
      const res = await closeLeveragedPositionAction(positionId);
      if (res.error) toast.error(res.error);
      else if (res.success) toast.success(res.success);
      router.refresh();
    });
  }

  function cancel(orderId: string) {
    startTransition(async () => {
      const res = await cancelOrderAction(orderId);
      if (res.error) toast.error(res.error);
      else if (res.success) toast.success(res.success);
      router.refresh();
    });
  }

  function closePosition(assetId: string) {
    setCloseConfirmId(null);
    startTransition(async () => {
      const res = await closePositionAction(assetId);
      if (res.error) toast.error(res.error);
      else if (res.success) toast.success(res.success);
      router.refresh();
    });
  }

  const openOrders = orders.filter((o) => ["OPEN", "PENDING", "PARTIALLY_FILLED"].includes(o.status));
  const up = (changePercent ?? 0) >= 0;
  const sideColor = side === "BUY" ? BUY : SELL;

  return (
    <div className="flex flex-col gap-4 pb-40">
      <header className="sticky top-0 z-30 flex flex-col gap-3 border-b border-border/60 bg-background/95 px-4 pb-3 pt-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <AssetPicker
            current={{ symbol: asset.symbol, name: asset.name, type: asset.type, logoUrl: asset.logoUrl }}
            assets={pickerAssets}
          />
          <span
            className={cn(
              "num-tabular shrink-0 rounded-full px-2.5 py-1 text-[13px] font-bold",
              up ? "bg-[#00A651]/12 text-[#00A651]" : "bg-[#FF4976]/12 text-[#FF4976]"
            )}
          >
            {formatChangePercent(changePercent)}
          </span>
        </div>
        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <span className="num-tabular text-[26px] font-extrabold leading-none text-foreground">{pfmt(price)}</span>
            <span className="text-[12px] font-semibold text-muted">{asset.currency}</span>
          </div>
          <div className="flex gap-1.5">
            <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-muted">{TYPE_LABEL[asset.type] ?? "Varlık"}</span>
            <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-muted">{leverage}x</span>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-4 px-4">
        <div className="grid grid-cols-2 gap-1 rounded-full bg-surface-2 p-1">
          {(["MARKET", "LIMIT"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                if (m === "LIMIT") setLeverage(1); // leveraged limit orders aren't supported yet
              }}
              className={cn(
                "h-9 rounded-full text-[13px] font-semibold transition-all",
                mode === m ? "bg-surface text-foreground shadow-sm" : "text-muted"
              )}
            >
              {m === "MARKET" ? "Piyasa Fiyatı" : "Limit Emir"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { s: "BUY" as const, label: "ALIŞ", value: buyPrice, color: BUY },
              { s: "SELL" as const, label: "SATIŞ", value: sellPrice, color: SELL },
            ]
          ).map((b) => (
            <button
              key={b.s}
              type="button"
              onClick={() => setSide(b.s)}
              className={cn(
                "flex flex-col items-start gap-1 rounded-2xl border p-3.5 text-left transition-all",
                side === b.s ? "bg-surface shadow-sm" : "border-border bg-surface/60"
              )}
              style={side === b.s ? { borderColor: b.color, boxShadow: `inset 0 0 0 1px ${b.color}` } : undefined}
            >
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted">{b.label}</span>
              <span className="num-tabular text-[20px] font-extrabold" style={{ color: b.color }}>
                {pfmt(b.value)}
              </span>
            </button>
          ))}
        </div>

        {mode === "LIMIT" && (
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-semibold text-muted">Limit fiyat</span>
            <input
              inputMode="decimal"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value.replace(/[^\d.,]/g, ""))}
              placeholder={price != null ? priceFmt.format(price) : "0.00"}
              className="h-14 rounded-2xl border border-border bg-surface px-4 text-[18px] font-bold text-foreground outline-none focus:border-brand"
            />
          </label>
        )}

        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between text-[12px] font-semibold text-muted">
            <span>Lot · min {step}</span>
            <span>Maks {isWhole ? Math.floor(maxQty) : maxQty.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setQty(quantity - step)}
              aria-label="Azalt"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 text-foreground active:scale-95"
            >
              <Minus size={18} />
            </button>
            <input
              inputMode="decimal"
              value={quantity}
              onChange={(e) => {
                const v = Number(e.target.value.replace(",", "."));
                if (Number.isFinite(v)) setQuantity(v);
              }}
              className="num-tabular min-w-0 flex-1 bg-transparent text-center text-[28px] font-extrabold text-foreground outline-none"
            />
            <button
              type="button"
              onClick={() => setQty(quantity + step)}
              aria-label="Artır"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 text-foreground active:scale-95"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 5, 10].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQty(q)}
                className="h-9 rounded-full bg-surface-2 text-[13px] font-semibold text-foreground"
              >
                {q}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setQty(Math.max(step, maxQty))}
              className="h-9 rounded-full bg-surface-2 text-[13px] font-semibold text-foreground"
            >
              Maks
            </button>
          </div>
        </div>

        {mode === "MARKET" && maxLeverage > 1 && (
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between text-[12px] font-semibold text-muted">
              <span>Kaldıraç</span>
              <span>1x - {maxLeverage}x</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {leverageQuickPicks.map((lv) => (
                <button
                  key={lv}
                  type="button"
                  onClick={() => setLeverage(lv)}
                  className={cn(
                    "h-9 rounded-full text-[13px] font-semibold transition-colors",
                    leverage === lv ? "bg-brand text-brand-foreground" : "bg-surface-2 text-foreground"
                  )}
                >
                  {lv}x
                </button>
              ))}
              <input
                inputMode="numeric"
                value={leverage}
                onChange={(e) => {
                  const v = Math.round(Number(e.target.value));
                  if (Number.isFinite(v)) setLeverage(Math.min(maxLeverage, Math.max(1, v)));
                }}
                className="num-tabular h-9 rounded-full bg-surface-2 text-center text-[13px] font-semibold text-foreground outline-none"
              />
            </div>
          </div>
        )}

        <div className="divide-y divide-border rounded-2xl border border-border bg-surface px-4">
          <SummaryRow label="Pozisyon değeri" value={fmtMoney(positionValue, asset.currency)} />
          <SummaryRow label="Gerekli marjin" value={fmtMoney(requiredMargin, asset.currency)} />
          <SummaryRow label="Kaldıraç" value={`${leverage}x`} />
          <SummaryRow label="Kullanılabilir bakiye" value={fmtMoney(cashBalance, balanceCurrency)} tone="positive" />
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-dashed border-border px-4 py-3 opacity-70">
          <span className="text-[13px] text-muted">Kâr Al / Zarar Durdur (TP/SL)</span>
          <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] font-semibold text-muted">Yakında</span>
        </div>

        {!loggedIn && (
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
            <div className="text-[14px] font-semibold text-foreground">İşlem yapmak için giriş yapın</div>
            <div className="flex gap-2">
              <Link href="/giris" className="flex h-11 flex-1 items-center justify-center rounded-full border border-border text-[14px] font-semibold text-foreground">
                Giriş Yap
              </Link>
              <Link href="/kayit" className="flex h-11 flex-1 items-center justify-center rounded-full bg-brand text-[14px] font-semibold text-brand-foreground">
                Müşteri Ol
              </Link>
            </div>
          </div>
        )}
        {loggedIn && !asset.tradingEnabled && (
          <p className="text-center text-[12px] text-muted">Bu varlıkta işlem yapılamaz.</p>
        )}

        <div className="grid grid-cols-3 gap-1 rounded-full bg-surface-2 p-1">
          <TabButton active={tab === "positions"} onClick={() => setTab("positions")}>
            Pozisyonlar ({positions.length})
          </TabButton>
          <TabButton active={tab === "leveraged"} onClick={() => setTab("leveraged")}>
            Kaldıraçlı ({leveragedPositions.length})
          </TabButton>
          <TabButton active={tab === "orders"} onClick={() => setTab("orders")}>
            Emirler ({openOrders.length})
          </TabButton>
        </div>

        {tab === "positions" &&
          (positions.length === 0 ? (
            <Empty text="Açık pozisyon bulunmuyor" />
          ) : (
            <div className="flex flex-col gap-3">
              {positions.map((p) => (
                <PositionCard
                  key={p.id}
                  position={p}
                  pending={pending}
                  confirming={closeConfirmId === p.assetId}
                  onRequestClose={() => setCloseConfirmId(p.assetId)}
                  onCancelClose={() => setCloseConfirmId(null)}
                  onConfirmClose={() => closePosition(p.assetId)}
                />
              ))}
            </div>
          ))}

        {tab === "leveraged" &&
          (leveragedPositions.length === 0 ? (
            <Empty text="Açık kaldıraçlı pozisyon bulunmuyor" />
          ) : (
            <div className="flex flex-col gap-3">
              {leveragedPositions.map((p) => (
                <LeveragedPositionCard
                  key={p.id}
                  position={p}
                  pending={pending}
                  confirming={closeLevConfirmId === p.id}
                  onRequestClose={() => setCloseLevConfirmId(p.id)}
                  onCancelClose={() => setCloseLevConfirmId(null)}
                  onConfirmClose={() => closeLeveraged(p.id)}
                />
              ))}
            </div>
          ))}

        {tab === "orders" &&
          (openOrders.length === 0 ? (
            <Empty text="Bekleyen emir bulunmuyor" />
          ) : (
            <div className="flex flex-col gap-2">
              {openOrders.map((o) => (
                <div key={o.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5">
                  <span
                    className="rounded-md px-2 py-1 text-[11px] font-bold text-white"
                    style={{ background: o.side === "BUY" ? BUY : SELL }}
                  >
                    {o.side === "BUY" ? "ALIŞ" : "SATIŞ"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-bold text-foreground">{o.symbol}</div>
                    <div className="text-[12px] text-muted">
                      {o.type === "LIMIT" ? "Limit" : "Piyasa"} · {o.quantity} adet
                      {o.limitPrice != null && ` @ ${priceFmt.format(o.limitPrice)}`}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => cancel(o.id)}
                    className="h-9 rounded-full bg-surface-2 px-3.5 text-[12px] font-semibold text-foreground disabled:opacity-50"
                  >
                    İptal
                  </button>
                </div>
              ))}
            </div>
          ))}
      </div>

      {loggedIn && (
        <div className="fixed inset-x-4 bottom-[88px] z-40 mx-auto max-w-[628px] rounded-3xl border border-border bg-background/95 p-2 shadow-[0_-8px_24px_-8px_rgba(0,0,0,0.25)] backdrop-blur">
          {sessionOpen === false && asset.tradingEnabled && (
            <div className="mb-2 rounded-xl bg-negative-bg px-3 py-2 text-center text-[12px] font-semibold text-negative">
              Piyasa kapalı{hours ? ` · ${hours}` : ""}
            </div>
          )}
          <button
            type="button"
            disabled={!canSubmit}
            onClick={submit}
            className={cn(
              "flex h-16 w-full flex-col items-center justify-center gap-0.5 rounded-2xl transition-transform active:scale-[0.99]",
              canSubmit ? "text-white" : "bg-surface-3 text-muted"
            )}
            style={canSubmit ? { background: sideColor, boxShadow: `0 10px 30px -8px ${sideColor}` } : undefined}
          >
            {pending ? (
              <span className="text-[15px] font-bold">Gönderiliyor…</span>
            ) : (
              <>
                <span className="text-[13px] font-bold tracking-wide opacity-90">
                  {side === "BUY" ? "ALIŞ" : "SATIŞ"} · {asset.symbol}
                </span>
                <span className="num-tabular text-[16px] font-extrabold">
                  {quantity} adet · {pfmt(refPrice)} {asset.currency}
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value, tone }: { label: string; value: string; tone?: "positive" }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-[13px] text-muted">{label}</span>
      <span className={cn("num-tabular text-[14px] font-semibold text-foreground", tone === "positive" && "text-[#00A651]")}>{value}</span>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("h-9 rounded-full text-[13px] font-semibold transition-all", active ? "bg-surface text-foreground shadow-sm" : "text-muted")}
    >
      {children}
    </button>
  );
}

function PositionCard({
  position: p,
  pending,
  confirming,
  onRequestClose,
  onCancelClose,
  onConfirmClose,
}: {
  position: TerminalPosition;
  pending: boolean;
  confirming: boolean;
  onRequestClose: () => void;
  onCancelClose: () => void;
  onConfirmClose: () => void;
}) {
  const cost = p.quantity * p.averageCost;
  const pnl = p.marketValue != null ? p.marketValue - cost : null;
  const pnlPercent = pnl != null && cost > 0 ? (pnl / cost) * 100 : null;
  const pnlTone = pnl == null ? "text-muted" : pnl >= 0 ? "text-positive" : "text-negative";
  const money = (v: number | null) => (v != null ? priceFmt.format(v) : "—");

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface">
      <div className="flex items-start gap-3 p-4">
        <AssetIcon symbol={p.symbol} type={p.type} logoUrl={p.logoUrl} size={44} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-foreground">{p.symbol}</span>
            <span className="rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ background: BUY }}>
              ALIŞ
            </span>
          </div>
          <div className="num-tabular text-[12px] text-muted">
            {p.quantity} adet · Maliyet: {money(cost)} {p.currency}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className={cn("num-tabular text-[15px] font-bold", pnlTone)}>
            {pnl != null ? `${pnl >= 0 ? "+" : ""}${priceFmt.format(pnl)}` : "—"}
          </div>
          <div className={cn("num-tabular text-[12px] font-semibold", pnlTone)}>
            {pnlPercent != null ? formatChangePercent(pnlPercent) : "—"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-border px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-muted">Giriş</span>
          <span className="num-tabular text-[13px] font-semibold text-foreground">{money(p.averageCost)}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[11px] text-muted">Güncel</span>
          <span className="num-tabular text-[13px] font-semibold text-foreground">{money(p.currentPrice)}</span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[11px] text-muted">Değer</span>
          <span className="num-tabular text-[13px] font-semibold text-foreground">{money(p.marketValue)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-border px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-semibold text-positive">KAR AL (TP)</span>
          <span className="text-[13px] text-muted">— Belirsiz</span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[11px] font-semibold text-negative">ZARAR DUR (SL)</span>
          <span className="text-[13px] text-muted">— Belirsiz</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-border p-3">
        <button
          type="button"
          disabled
          className="flex h-10 items-center justify-center rounded-xl bg-surface-2 text-[13px] font-semibold text-muted disabled:opacity-60"
        >
          Düzenle · Yakında
        </button>
        {confirming ? (
          <div className="grid grid-cols-2 gap-1.5">
            <button type="button" onClick={onCancelClose} disabled={pending} className="h-10 rounded-xl bg-surface-2 text-[12px] font-semibold text-foreground disabled:opacity-50">
              Vazgeç
            </button>
            <button
              type="button"
              onClick={onConfirmClose}
              disabled={pending}
              className="h-10 rounded-xl text-[12px] font-bold text-white disabled:opacity-50"
              style={{ background: SELL }}
            >
              {pending ? "Gönderiliyor…" : "Satışı onayla"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onRequestClose}
            disabled={pending}
            className="h-10 rounded-xl text-[13px] font-bold text-white disabled:opacity-50"
            style={{ background: `linear-gradient(90deg, #E8305A, ${SELL}, #FF6B8A)` }}
          >
            Kapat
          </button>
        )}
      </div>
    </div>
  );
}

function LeveragedPositionCard({
  position: p,
  pending,
  confirming,
  onRequestClose,
  onCancelClose,
  onConfirmClose,
}: {
  position: TerminalLeveragedPosition;
  pending: boolean;
  confirming: boolean;
  onRequestClose: () => void;
  onCancelClose: () => void;
  onConfirmClose: () => void;
}) {
  const pnlPercent = p.pnl != null && p.margin > 0 ? (p.pnl / p.margin) * 100 : null;
  const pnlTone = p.pnl == null ? "text-muted" : p.pnl >= 0 ? "text-positive" : "text-negative";
  const sideColor = p.side === "BUY" ? BUY : SELL;
  const money2 = (v: number | null) => (v != null ? priceFmt.format(v) : "—");

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface">
      <div className="flex items-start gap-3 p-4">
        <AssetIcon symbol={p.symbol} type={p.type} logoUrl={p.logoUrl} size={44} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-foreground">{p.symbol}</span>
            <span className="rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ background: sideColor }}>
              {p.side === "BUY" ? "ALIŞ" : "SATIŞ"}
            </span>
            <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[10px] font-bold text-muted">1:{p.leverage}</span>
          </div>
          <div className="num-tabular text-[12px] text-muted">
            {p.quantity} adet · Teminat: {money2(p.margin)} {p.currency}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className={cn("num-tabular text-[15px] font-bold", pnlTone)}>
            {p.pnl != null ? `${p.pnl >= 0 ? "+" : ""}${priceFmt.format(p.pnl)}` : "—"}
          </div>
          <div className={cn("num-tabular text-[12px] font-semibold", pnlTone)}>
            {pnlPercent != null ? formatChangePercent(pnlPercent) : "—"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-border px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-muted">Giriş</span>
          <span className="num-tabular text-[13px] font-semibold text-foreground">{money2(p.entryPrice)}</span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[11px] text-muted">Güncel</span>
          <span className="num-tabular text-[13px] font-semibold text-foreground">{money2(p.currentPrice)}</span>
        </div>
      </div>

      <div className="border-t border-border p-3">
        {confirming ? (
          <div className="grid grid-cols-2 gap-1.5">
            <button type="button" onClick={onCancelClose} disabled={pending} className="h-10 rounded-xl bg-surface-2 text-[12px] font-semibold text-foreground disabled:opacity-50">
              Vazgeç
            </button>
            <button
              type="button"
              onClick={onConfirmClose}
              disabled={pending}
              className="h-10 rounded-xl text-[12px] font-bold text-white disabled:opacity-50"
              style={{ background: SELL }}
            >
              {pending ? "Gönderiliyor…" : "Kapatmayı onayla"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onRequestClose}
            disabled={pending}
            className="h-10 w-full rounded-xl text-[13px] font-bold text-white disabled:opacity-50"
            style={{ background: `linear-gradient(90deg, #E8305A, ${SELL}, #FF6B8A)` }}
          >
            Pozisyonu kapat
          </button>
        )}
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-8 text-center text-[13px] text-muted">{text}</p>;
}
