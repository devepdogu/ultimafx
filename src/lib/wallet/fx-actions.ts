"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { resolveAssetPrice } from "@/lib/market-data/resolve-price";
import { convertCurrency, TermDepositError } from "@/lib/term-deposit/service";
import { parseAmount } from "@/lib/term-deposit/amount";

export interface FxActionResult {
  error?: string;
  success?: string;
}

/** Converts TRY ↔ USD at the live USDTRY quote. The rate is read on the server, never from the form. */
export async function convertCurrencyAction(_prev: FxActionResult, formData: FormData): Promise<FxActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Devam etmek için giriş yapın." };

  const direction = formData.get("direction") === "USD_TO_TRY" ? "USD_TO_TRY" : "TRY_TO_USD";
  const amount = parseAmount(String(formData.get("amount") ?? ""));
  if (!Number.isFinite(amount)) return { error: "Geçerli bir tutar girin." };

  const usdAsset = await prisma.asset.findUnique({ where: { symbol: "USDTRY" } });
  const quote = usdAsset ? await resolveAssetPrice(usdAsset) : null;
  if (!quote || quote.price == null || quote.provenance === "UNAVAILABLE") {
    return { error: "USD/TRY kuru şu anda alınamıyor. Lütfen daha sonra tekrar deneyin." };
  }

  try {
    await convertCurrency(user.id, direction, amount, quote.price);
    revalidatePath("/cuzdan", "layout");
    revalidatePath("/cuzdan/vadeli-mevduat");
    return {
      success: "Dönüşüm tamamlandı.",
    };
  } catch (err) {
    if (err instanceof TermDepositError) return { error: err.message };
    throw err;
  }
}
