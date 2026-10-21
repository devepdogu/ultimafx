"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/rbac";
import { closeLeveragedPosition, MAX_LEVERAGE, openLeveragedPosition } from "./leverage-engine";
import { TradingError } from "./errors";
import type { TradeActionResult } from "./actions";

const openSchema = z.object({
  assetId: z.string().min(1),
  side: z.enum(["BUY", "SELL"]),
  quantity: z.coerce.number().positive().max(1_000_000_000),
  leverage: z.coerce.number().int().min(1).max(MAX_LEVERAGE),
});

export async function placeLeveragedOrderAction(_prev: TradeActionResult, formData: FormData): Promise<TradeActionResult> {
  const user = await requireUser();
  const parsed = openSchema.safeParse({
    assetId: formData.get("assetId"),
    side: formData.get("side"),
    quantity: formData.get("quantity"),
    leverage: formData.get("leverage"),
  });
  if (!parsed.success) return { error: "Lütfen geçerli bir miktar ve kaldıraç girin." };

  try {
    await openLeveragedPosition({ userId: user.id, ...parsed.data });
  } catch (err) {
    if (err instanceof TradingError) return { error: err.turkishMessage };
    throw err;
  }

  revalidatePath("/piyasalar");
  revalidatePath("/cuzdan");
  const verb = parsed.data.side === "BUY" ? "alış" : "satış";
  return { success: `1:${parsed.data.leverage} kaldıraçlı ${verb} pozisyonu açıldı.` };
}

export async function closeLeveragedPositionAction(positionId: string): Promise<TradeActionResult> {
  const user = await requireUser();
  try {
    await closeLeveragedPosition(positionId, "USER", user.id);
  } catch (err) {
    if (err instanceof TradingError) return { error: err.turkishMessage };
    throw err;
  }
  revalidatePath("/piyasalar");
  revalidatePath("/cuzdan");
  return { success: "Pozisyon kapatıldı." };
}
