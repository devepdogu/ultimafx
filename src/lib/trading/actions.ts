"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { cancelOrder, executeMarketOrder, placeLimitOrder } from "./engine";
import { marketOrderSchema } from "./schemas";
import { z } from "zod";
import { TradingError } from "./errors";

export interface TradeActionResult {
  error?: string;
  success?: string;
}

export async function placeMarketOrderAction(
  _prev: TradeActionResult,
  formData: FormData
): Promise<TradeActionResult> {
  const user = await requireUser();

  const parsed = marketOrderSchema.safeParse({
    assetId: formData.get("assetId"),
    side: formData.get("side"),
    quantity: formData.get("quantity"),
  });
  if (!parsed.success) {
    return { error: "Lütfen geçerli bir miktar girin." };
  }

  try {
    const trade = await executeMarketOrder({
      userId: user.id,
      assetId: parsed.data.assetId,
      side: parsed.data.side,
      quantity: parsed.data.quantity,
    });

    revalidatePath("/piyasalar");
    revalidatePath("/portfoy");
    revalidatePath("/cuzdan");

    const verb = parsed.data.side === "BUY" ? "alım" : "satım";
    return {
      success: `${trade.quantity.toString()} adet ${verb} emri oluşturuldu.`,
    };
  } catch (err) {
    if (err instanceof TradingError) {
      return { error: err.turkishMessage };
    }
    throw err;
  }
}

const limitOrderSchema = z.object({
  assetId: z.string().min(1),
  side: z.enum(["BUY", "SELL"]),
  quantity: z.coerce.number().positive().max(1_000_000_000),
  limitPrice: z.coerce.number().positive().max(1_000_000_000),
});

export async function placeLimitOrderAction(
  _prev: TradeActionResult,
  formData: FormData
): Promise<TradeActionResult> {
  const user = await requireUser();
  const parsed = limitOrderSchema.safeParse({
    assetId: formData.get("assetId"),
    side: formData.get("side"),
    quantity: formData.get("quantity"),
    limitPrice: formData.get("limitPrice"),
  });
  if (!parsed.success) return { error: "Lütfen geçerli bir miktar ve limit fiyat girin." };

  try {
    await placeLimitOrder({
      userId: user.id,
      assetId: parsed.data.assetId,
      side: parsed.data.side,
      quantity: parsed.data.quantity,
      limitPrice: parsed.data.limitPrice,
    });
  } catch (err) {
    if (err instanceof TradingError) return { error: err.turkishMessage };
    throw err;
  }

  revalidatePath("/emirler");
  return { success: "Limit emri oluşturuldu." };
}

/** Sells the user's whole holding of an asset at market. The quantity is read from the DB, never trusted from the client. */
export async function closePositionAction(assetId: string): Promise<TradeActionResult> {
  const user = await requireUser();
  const holding = await prisma.holding.findFirst({
    where: { assetId, quantity: { gt: 0 }, portfolio: { userId: user.id } },
  });
  if (!holding) return { error: "Bu varlıkta kapatılacak açık pozisyon yok." };

  try {
    const trade = await executeMarketOrder({
      userId: user.id,
      assetId,
      side: "SELL",
      quantity: holding.quantity.toString(),
    });
    revalidatePath("/emirler");
    revalidatePath("/portfoy");
    revalidatePath("/cuzdan");
    return { success: `${trade.quantity.toString()} adet satılarak pozisyon kapatıldı.` };
  } catch (err) {
    if (err instanceof TradingError) return { error: err.turkishMessage };
    throw err;
  }
}

export async function cancelOrderAction(orderId: string): Promise<TradeActionResult> {
  const user = await requireUser();
  try {
    await cancelOrder(user.id, orderId);
  } catch {
    return { error: "Emir iptal edilemedi." };
  }
  revalidatePath("/emirler");
  return { success: "Emir iptal edildi." };
}
