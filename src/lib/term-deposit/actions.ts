"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/rbac";
import { openTermDeposit, settleMaturedTermDeposits, TermDepositError } from "./service";
import { parseAmount } from "./amount";

export interface TermDepositActionResult {
  error?: string;
  success?: string;
}

export async function openTermDepositAction(
  _prev: TermDepositActionResult,
  formData: FormData
): Promise<TermDepositActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Devam etmek için giriş yapın." };

  const productId = String(formData.get("productId") ?? "");
  const amount = parseAmount(String(formData.get("amount") ?? ""));
  if (!productId) return { error: "Bir vadeli mevduat ürünü seçin." };
  if (!Number.isFinite(amount)) return { error: "Geçerli bir tutar girin (örn. 10.000,00)." };

  try {
    await settleMaturedTermDeposits(user.id);
    await openTermDeposit(user.id, productId, amount);
  } catch (err) {
    if (err instanceof TermDepositError) return { error: err.message };
    throw err;
  }

  revalidatePath("/cuzdan", "layout");
  revalidatePath("/cuzdan/vadeli-mevduat");
  return { success: "Vadeli mevduat hesabınız açıldı." };
}
