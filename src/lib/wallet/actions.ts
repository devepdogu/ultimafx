"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { requireUser } from "@/lib/auth/rbac";
import { depositRequestSchema, withdrawalRequestSchema } from "./schemas";

export interface WalletActionResult {
  error?: string;
  success?: string;
}

export async function createDepositRequestAction(
  _prev: WalletActionResult,
  formData: FormData
): Promise<WalletActionResult> {
  const user = await requireUser();
  const parsed = depositRequestSchema.safeParse({ amount: formData.get("amount") });
  if (!parsed.success) return { error: "Lütfen geçerli bir tutar girin." };

  const activeBankAccount = await prisma.bankAccount.findFirst({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  await prisma.deposit.create({
    data: {
      userId: user.id,
      amount: parsed.data.amount.toString(),
      bankAccountId: activeBankAccount?.id,
      status: "PENDING",
    },
  });

  revalidatePath("/cuzdan");
  return { success: "Para yatırma talebiniz oluşturuldu. Durum: BEKLEMEDE." };
}

export async function createWithdrawalRequestAction(
  _prev: WalletActionResult,
  formData: FormData
): Promise<WalletActionResult> {
  const user = await requireUser();
  const parsed = withdrawalRequestSchema.safeParse({
    amount: formData.get("amount"),
    destinationIban: formData.get("destinationIban"),
    destinationBankName: formData.get("destinationBankName"),
    destinationAccountHolder: formData.get("destinationAccountHolder"),
  });
  if (!parsed.success) return { error: "Lütfen tüm alanları doğru şekilde doldurun." };

  const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  if (!wallet || Number(wallet.cashBalance) < parsed.data.amount) {
    return { error: "Yetersiz bakiye. Lütfen tutarı kontrol edin." };
  }

  await prisma.withdrawal.create({
    data: {
      userId: user.id,
      amount: parsed.data.amount.toString(),
      destinationIban: parsed.data.destinationIban,
      destinationBankName: parsed.data.destinationBankName,
      destinationAccountHolder: parsed.data.destinationAccountHolder,
      status: "PENDING",
    },
  });

  revalidatePath("/cuzdan");
  return { success: "Para çekme talebiniz oluşturuldu. Durum: BEKLEMEDE." };
}
