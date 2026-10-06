"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui/Toaster";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import { X, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { placeMarketOrderAction, type TradeActionResult } from "@/lib/trading/actions";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const initialState: TradeActionResult = {};

interface TradeSheetProps {
  assetId: string;
  symbol: string;
  name: string;
  price: number | null;
  bid: number | null;
  ask: number | null;
  currency: string;
  availableBalance: number;
  heldQuantity: number;
  dock?: boolean;
}

export function TradeSheet({
  assetId,
  symbol,
  name,
  price,
  bid,
  ask,
  currency,
  availableBalance,
  heldQuantity,
  dock = false,
}: TradeSheetProps) {
  const t = useTranslations("trade");
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"input" | "review">("input");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState("");
  const [state, formAction, pending] = useActionState(placeMarketOrderAction, initialState);
  const toast = useToast();
  useEffect(() => {
    if (state.error) toast.error(state.error);
    else if (state.success) toast.success(state.success);
  }, [state, toast]);
  const dragControls = useDragControls();

  const estimatedTotal = useMemo(() => {
    const qty = Number(quantity);
    if (!price || !Number.isFinite(qty) || qty <= 0) return null;
    return qty * price;
  }, [quantity, price]);

  function openSheet(nextSide: "BUY" | "SELL") {
    setSide(nextSide);
    setQuantity("");
    setStep("input");
    setOpen(true);
  }

  function closeSheet() {
    setOpen(false);
    setStep("input");
  }

  const canTrade = price != null;
  const qty = Number(quantity);
  const canContinue = Number.isFinite(qty) && qty > 0 && (side === "BUY" ? estimatedTotal != null && estimatedTotal <= availableBalance : qty <= heldQuantity);

  return (
    <>
      <div className={dock ? "fixed inset-x-0 bottom-0 z-40 flex gap-2.5 border-t border-border bg-background px-3 pb-2 pt-2" : "flex gap-3"}>
        <Button
          variant="sell"
          size="lg"
          className={dock ? "h-auto flex-1 rounded-xl py-3 !bg-[#FF4976] text-white hover:!bg-[#FF4976]" : "h-auto flex-1 py-2.5"}
          disabled={!canTrade}
          onClick={() => openSheet("SELL")}
        >
          <span className="flex flex-col items-center">
            <span>{tc("sell")}</span>
            <span className={dock ? "num-tabular text-[16px] font-extrabold" : "num-tabular text-xs font-semibold opacity-90"}>
              {formatPrice(bid ?? price, currency)}
            </span>
          </span>
        </Button>
        <Button
          variant="buy"
          size="lg"
          className={dock ? "h-auto flex-1 rounded-xl py-3 !bg-[#00A651] text-white hover:!bg-[#00A651]" : "h-auto flex-1 py-2.5"}
          disabled={!canTrade}
          onClick={() => openSheet("BUY")}
        >
          <span className="flex flex-col items-center">
            <span>{tc("buy")}</span>
            <span className={dock ? "num-tabular text-[16px] font-extrabold" : "num-tabular text-xs font-semibold opacity-90"}>
              {formatPrice(ask ?? price, currency)}
            </span>
          </span>
        </Button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) closeSheet();
            }}
          >
            <motion.div
              className="w-full max-w-md rounded-t-2xl border border-border bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-lg"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 420, damping: 38 }}
              drag="y"
              dragListener={false}
              dragControls={dragControls}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.4 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 120 || info.velocity.y > 600) closeSheet();
              }}
            >
              <div
                className="-mt-1 mb-3 flex cursor-grab touch-none justify-center py-2 active:cursor-grabbing"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="h-1 w-10 rounded-full bg-border-strong" />
              </div>

              <div className="mb-4 flex items-center gap-2">
                {step === "review" && (
                  <button
                    type="button"
                    onClick={() => setStep("input")}
                    className="text-muted hover:text-foreground"
                    aria-label={tc("edit")}
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}
                <h2
                  className={cn(
                    "text-lg font-bold",
                    side === "BUY" ? "text-positive" : "text-negative"
                  )}
                >
                  {side === "BUY" ? tc("buy") : tc("sell")} · {symbol}
                </h2>
                <button
                  type="button"
                  onClick={closeSheet}
                  className="ml-auto text-muted hover:text-foreground"
                  aria-label={tc("cancel")}
                >
                  <X size={18} />
                </button>
              </div>

              <form action={formAction} className="flex flex-col gap-3">
                <input type="hidden" name="assetId" value={assetId} />
                <input type="hidden" name="side" value={side} />

                {step === "input" ? (
                  <>
                    <p className="-mt-1 text-sm text-muted">{name}</p>
                    <p className="num-tabular figure-lg">{formatPrice(price, currency)}</p>

                    <label className="text-xs font-medium text-muted">{t("quantity")}</label>
                    <input
                      name="quantity"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="any"
                      required
                      autoFocus
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-brand"
                    />

                    {side === "SELL" && (
                      <p className="text-xs text-muted">
                        {t("quantity")}: {heldQuantity} {symbol}
                      </p>
                    )}

                    <div className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2 text-sm">
                      <span className="text-muted">{t("estimatedAmount")}</span>
                      <span className="num-tabular font-semibold">
                        {estimatedTotal != null ? formatPrice(estimatedTotal, currency) : "—"}
                      </span>
                    </div>

                    {side === "BUY" && (
                      <div className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2 text-sm">
                        <span className="text-muted">{t("availableBalance")}</span>
                        <span className="num-tabular font-semibold">
                          {formatPrice(availableBalance, "TRY")}
                        </span>
                      </div>
                    )}

                    <Button
                      type="button"
                      variant={side === "BUY" ? "buy" : "sell"}
                      size="lg"
                      disabled={!canContinue}
                      className="mt-1 w-full"
                      onClick={() => setStep("review")}
                    >
                      {tc("confirm")}
                    </Button>
                  </>
                ) : (
                  <>
                    <input type="hidden" name="quantity" value={quantity} />

                    <div className="flex flex-col gap-2 rounded-lg bg-surface-2 p-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted">{symbol}</span>
                        <span className="font-medium">{name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">{t("quantity")}</span>
                        <span className="num-tabular font-semibold">{quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">{t("price")}</span>
                        <span className="num-tabular font-semibold">
                          {formatPrice(price, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-border pt-2">
                        <span className="text-muted">{t("estimatedAmount")}</span>
                        <span className="num-tabular font-bold">
                          {estimatedTotal != null ? formatPrice(estimatedTotal, currency) : "—"}
                        </span>
                      </div>
                    </div>


                    <Button
                      type="submit"
                      variant={side === "BUY" ? "buy" : "sell"}
                      size="lg"
                      loading={pending}
                      className="mt-1 w-full"
                    >
                      {t("confirmOrder")}
                    </Button>
                  </>
                )}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
