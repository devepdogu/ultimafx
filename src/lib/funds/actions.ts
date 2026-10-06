"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/rbac";
import { FundError, purchaseFund, redeemFund } from "./service";

export interface FundPurchaseState {
  error?: string;
  ok?: boolean;
  units?: number;
}

export async function purchaseFundAction(_prev: FundPurchaseState, formData: FormData): Promise<FundPurchaseState> {
  const user = await requireUser();
  const fundId = String(formData.get("fundId") ?? "");
  const amount = Number(formData.get("amount"));
  if (!fundId) return { error: "Fon bulunamadı." };

  try {
    const result = await purchaseFund(user.id, fundId, amount);
    revalidatePath("/fonlar");
    revalidatePath("/cuzdan");
    return { ok: true, units: result.units };
  } catch (err) {
    if (err instanceof FundError) return { error: err.message };
    throw err;
  }
}

export async function redeemFundAction(_prev: FundPurchaseState, formData: FormData): Promise<FundPurchaseState> {
  const user = await requireUser();
  const fundId = String(formData.get("fundId") ?? "");
  const units = Number(formData.get("units"));
  if (!fundId) return { error: "Fon bulunamadı." };

  try {
    const result = await redeemFund(user.id, fundId, units);
    revalidatePath("/fonlar");
    revalidatePath("/cuzdan");
    return { ok: true, units: result.units };
  } catch (err) {
    if (err instanceof FundError) return { error: err.message };
    throw err;
  }
}
