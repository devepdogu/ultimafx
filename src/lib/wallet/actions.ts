"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";
import { requireUser } from "@/lib/auth/rbac";

export interface WalletActionResult {
  error?: string;
  success?: string;
  reference?: string;
}

const MAX_AMOUNT = 10_000_000;
const amountSchema = z.coerce.number().positive().max(MAX_AMOUNT);
const methodSchema = z.enum(["BANK_TRANSFER", "CRYPTO"]);

function newReference() {
  return `UFX-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function createDepositRequestAction(
  _prev: WalletActionResult,
  formData: FormData
): Promise<WalletActionResult> {
  const user = await requireUser();
  const method = methodSchema.safeParse(formData.get("method"));
  const amount = amountSchema.safeParse(formData.get("amount"));
  const targetId = String(formData.get("targetId") ?? "");
  if (!method.success || !amount.success || !targetId) return { error: "Lütfen yöntem, hesap ve tutarı seçin." };

  let bankAccountId: string | null = null;
  let cryptoAddressId: string | null = null;
  if (method.data === "BANK_TRANSFER") {
    const bank = await prisma.bankAccount.findFirst({ where: { id: targetId, status: "ACTIVE" } });
    if (!bank) return { error: "Seçilen banka hesabı artık kullanılamıyor." };
    bankAccountId = bank.id;
  } else {
    const address = await prisma.cryptoAddress.findFirst({ where: { id: targetId, isActive: true } });
    if (!address) return { error: "Seçilen kripto adresi artık kullanılamıyor." };
    cryptoAddressId = address.id;
  }

  const reference = newReference();
  await prisma.deposit.create({
    data: {
      userId: user.id,
      method: method.data,
      amount: amount.data.toFixed(2),
      currency: "TRY",
      bankAccountId,
      cryptoAddressId,
      reference,
      status: "PENDING",
    },
  });

  revalidatePath("/cuzdan");
  return { success: "Yatırım talebiniz oluşturuldu.", reference };
}

export async function createWithdrawalRequestAction(
  _prev: WalletActionResult,
  formData: FormData
): Promise<WalletActionResult> {
  const user = await requireUser();
  const method = methodSchema.safeParse(formData.get("method"));
  const amount = amountSchema.safeParse(formData.get("amount"));
  if (!method.success || !amount.success) return { error: "Lütfen yöntem ve tutarı kontrol edin." };

  const get = (k: string) => String(formData.get(k) ?? "").trim();
  let data: Record<string, string | null>;
  if (method.data === "BANK_TRANSFER") {
    const iban = get("iban").replace(/\s/g, "").toUpperCase();
    const bankName = get("bankName");
    const holder = get("holder");
    if (!/^TR\d{24}$/.test(iban)) return { error: "Geçerli bir IBAN girin (TR ile başlayan 26 karakter)." };
    if (bankName.length < 2 || holder.length < 2) return { error: "Banka adı ve ad soyad zorunludur." };
    data = { destinationIban: iban, destinationBankName: bankName, destinationAccountHolder: holder };
  } else {
    const address = get("address");
    const network = get("network");
    if (address.length < 10) return { error: "Geçerli bir cüzdan adresi girin." };
    if (network.length < 2) return { error: "Ağ (örn. TRC20) seçin." };
    data = { destinationAddress: address, destinationNetwork: network };
  }

  const reference = newReference();
  const amountValue = amount.data;
  let insufficient = false;
  await prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<{ id: string; cashBalance: string }[]>`
      SELECT id, "cashBalance" FROM "Wallet" WHERE "userId" = ${user.id} FOR UPDATE
    `;
    const wallet = rows[0];
    if (!wallet || Number(wallet.cashBalance) < amountValue) {
      insufficient = true;
      return;
    }
    await tx.withdrawal.create({
      data: {
        userId: user.id,
        method: method.data,
        amount: amountValue.toFixed(2),
        currency: "TRY",
        status: "PENDING",
        reference,
        ...data,
      },
    });
  });
  if (insufficient) return { error: "Yetersiz bakiye. Lütfen tutarı kontrol edin." };

  revalidatePath("/cuzdan");
  return { success: "Çekim talebiniz oluşturuldu.", reference };
}
