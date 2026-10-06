"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/rbac";
import { executeMarketOrder } from "./engine";
import { marketOrderSchema } from "./schemas";
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
