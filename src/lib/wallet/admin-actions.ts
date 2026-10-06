"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/auth/rbac";
import { writeAuditLog } from "@/lib/audit/log";
import { Decimal } from "@/lib/money/decimal";
import { reviewRequestSchema } from "./schemas";
import type { WalletActionResult } from "./actions";

async function lockWalletByUserId(tx: Prisma.TransactionClient, userId: string) {
  const rows = await tx.$queryRaw<{ id: string; cashBalance: Prisma.Decimal }[]>`
    SELECT id, "cashBalance" FROM "Wallet" WHERE "userId" = ${userId} FOR UPDATE
  `;
  const row = rows[0];
  if (!row) throw new Error("WALLET_NOT_FOUND");
  return { walletId: row.id, cashBalance: new Decimal(row.cashBalance.toString()) };
}

export async function approveDepositAction(
  _prev: WalletActionResult,
  formData: FormData
): Promise<WalletActionResult> {
  const admin = await requireAdmin();
  const parsed = reviewRequestSchema.safeParse({
    id: formData.get("id"),
    adminNote: formData.get("adminNote") ?? undefined,
  });
  if (!parsed.success) return { error: "Geçersiz istek." };

  const deposit = await prisma.deposit.findUniqueOrThrow({ where: { id: parsed.data.id } });
  if (deposit.status !== "PENDING") return { error: "Bu talep zaten işlenmiş." };

  await prisma.$transaction(async (tx) => {
    const { walletId, cashBalance } = await lockWalletByUserId(tx, deposit.userId);
    const amount = new Decimal(deposit.amount.toString());
    const newBalance = cashBalance.plus(amount);

    await tx.wallet.update({ where: { id: walletId }, data: { cashBalance: newBalance.toString() } });
    await tx.walletTransaction.create({
      data: {
        walletId,
        type: "DEPOSIT",
        amount: amount.toString(),
        balanceAfter: newBalance.toString(),
        referenceType: "DEPOSIT",
        referenceId: deposit.id,
        description: "Para yatırma onayı",
      },
    });
    await tx.deposit.update({
      where: { id: deposit.id },
      data: {
        status: "COMPLETED",
        processedAt: new Date(),
        processedByAdminId: admin.id,
        adminNote: parsed.data.adminNote,
      },
    });
  });

  await writeAuditLog({
    adminUserId: admin.id,
    action: "DEPOSIT_APPROVED",
    entityType: "Deposit",
    entityId: deposit.id,
    oldValue: { status: deposit.status },
    newValue: { status: "COMPLETED", amount: deposit.amount.toString() },
  });

  revalidatePath("/admin/para-yatirma");
  return { success: "Para yatırma talebi onaylandı." };
}

export async function rejectDepositAction(
  _prev: WalletActionResult,
  formData: FormData
): Promise<WalletActionResult> {
  const admin = await requireAdmin();
  const parsed = reviewRequestSchema.safeParse({
    id: formData.get("id"),
    adminNote: formData.get("adminNote") ?? undefined,
  });
  if (!parsed.success) return { error: "Geçersiz istek." };

  const deposit = await prisma.deposit.findUniqueOrThrow({ where: { id: parsed.data.id } });
  if (deposit.status !== "PENDING") return { error: "Bu talep zaten işlenmiş." };

  await prisma.deposit.update({
    where: { id: deposit.id },
    data: {
      status: "REJECTED",
      processedAt: new Date(),
      processedByAdminId: admin.id,
      rejectionReason: parsed.data.adminNote ?? "Belirtilmedi",
      adminNote: parsed.data.adminNote,
    },
  });

  await writeAuditLog({
    adminUserId: admin.id,
    action: "DEPOSIT_REJECTED",
    entityType: "Deposit",
    entityId: deposit.id,
    oldValue: { status: deposit.status },
    newValue: { status: "REJECTED" },
  });

  revalidatePath("/admin/para-yatirma");
  return { success: "Para yatırma talebi reddedildi." };
}

export async function approveWithdrawalAction(
  _prev: WalletActionResult,
  formData: FormData
): Promise<WalletActionResult> {
  const admin = await requireAdmin();
  const parsed = reviewRequestSchema.safeParse({
    id: formData.get("id"),
    adminNote: formData.get("adminNote") ?? undefined,
  });
  if (!parsed.success) return { error: "Geçersiz istek." };

  const withdrawal = await prisma.withdrawal.findUniqueOrThrow({ where: { id: parsed.data.id } });
  if (withdrawal.status !== "PENDING") return { error: "Bu talep zaten işlenmiş." };

  try {
    await prisma.$transaction(async (tx) => {
      const { walletId, cashBalance } = await lockWalletByUserId(tx, withdrawal.userId);
      const amount = new Decimal(withdrawal.amount.toString());

      // Never allow the ledger to go negative, no matter what the request said.
      if (cashBalance.lt(amount)) {
        throw new Error("INSUFFICIENT_BALANCE");
      }
      const newBalance = cashBalance.minus(amount);

      await tx.wallet.update({ where: { id: walletId }, data: { cashBalance: newBalance.toString() } });
      await tx.walletTransaction.create({
        data: {
          walletId,
          type: "WITHDRAWAL",
          amount: amount.neg().toString(),
          balanceAfter: newBalance.toString(),
          referenceType: "WITHDRAWAL",
          referenceId: withdrawal.id,
          description: "Para çekme onayı",
        },
      });
      await tx.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: "COMPLETED",
          processedAt: new Date(),
          processedByAdminId: admin.id,
          adminNote: parsed.data.adminNote,
        },
      });
    });
  } catch (err) {
    if (err instanceof Error && err.message === "INSUFFICIENT_BALANCE") {
      return { error: "Kullanıcının bakiyesi bu çekim talebi için yetersiz." };
    }
    throw err;
  }

  await writeAuditLog({
    adminUserId: admin.id,
    action: "WITHDRAWAL_APPROVED",
    entityType: "Withdrawal",
    entityId: withdrawal.id,
    oldValue: { status: withdrawal.status },
    newValue: { status: "COMPLETED", amount: withdrawal.amount.toString() },
  });

  revalidatePath("/admin/para-cekme");
  return { success: "Para çekme talebi onaylandı." };
}

export async function rejectWithdrawalAction(
  _prev: WalletActionResult,
  formData: FormData
): Promise<WalletActionResult> {
  const admin = await requireAdmin();
  const parsed = reviewRequestSchema.safeParse({
    id: formData.get("id"),
    adminNote: formData.get("adminNote") ?? undefined,
  });
  if (!parsed.success) return { error: "Geçersiz istek." };

  const withdrawal = await prisma.withdrawal.findUniqueOrThrow({ where: { id: parsed.data.id } });
  if (withdrawal.status !== "PENDING") return { error: "Bu talep zaten işlenmiş." };

  await prisma.withdrawal.update({
    where: { id: withdrawal.id },
    data: {
      status: "REJECTED",
      processedAt: new Date(),
      processedByAdminId: admin.id,
      rejectionReason: parsed.data.adminNote ?? "Belirtilmedi",
      adminNote: parsed.data.adminNote,
    },
  });

  await writeAuditLog({
    adminUserId: admin.id,
    action: "WITHDRAWAL_REJECTED",
    entityType: "Withdrawal",
    entityId: withdrawal.id,
    oldValue: { status: withdrawal.status },
    newValue: { status: "REJECTED" },
  });

  revalidatePath("/admin/para-cekme");
  return { success: "Para çekme talebi reddedildi." };
}
