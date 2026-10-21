"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { writeAuditLog } from "@/lib/audit/log";
import { Decimal } from "@/lib/money/decimal";
import { lockWallet } from "@/lib/trading/engine";
import { closeLeveragedPosition, MAX_LEVERAGE } from "@/lib/trading/leverage-engine";
import { TradingError } from "@/lib/trading/errors";
import type { AdminActionResult } from "./content-actions";

/** Force-closes any open leveraged position at the current market price — the admin
 * equivalent of a user closing their own, through the exact same settlement path. */
export async function adminCloseLeveragedPositionAction(positionId: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  try {
    await closeLeveragedPosition(positionId, "ADMIN", null);
  } catch (err) {
    if (err instanceof TradingError) return { error: err.turkishMessage };
    throw err;
  }
  await writeAuditLog({ adminUserId: admin.id, action: "ORDER_EXECUTED", entityType: "LeveragedPosition", entityId: positionId, newValue: { closedBy: "ADMIN" } });
  revalidatePath("/admin/pozisyonlar");
  return { success: "Pozisyon kapatıldı." };
}

const editSchema = z.object({
  positionId: z.string().min(1),
  quantity: z.coerce.number().positive(),
  entryPrice: z.coerce.number().positive(),
  leverage: z.coerce.number().int().min(1).max(MAX_LEVERAGE),
});

/**
 * Corrects an open position's lot/entry price/leverage — unlike the spot Holding editor, this
 * DOES move money: margin is `quantity * entryPrice * contractSize / leverage`, so changing any
 * of those three changes how much of the user's wallet is reserved. The wallet is adjusted by
 * exactly the difference, inside the same row-locked transaction every other wallet mutation
 * uses, so the ledger stays consistent with the correction instead of silently drifting from it.
 */
export async function adminEditLeveragedPositionAction(_prev: AdminActionResult, formData: FormData): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const parsed = editSchema.safeParse({
    positionId: formData.get("positionId"),
    quantity: formData.get("quantity"),
    entryPrice: formData.get("entryPrice"),
    leverage: formData.get("leverage"),
  });
  if (!parsed.success) return { error: "Geçersiz alanlar." };

  const position = await prisma.leveragedPosition.findUnique({ where: { id: parsed.data.positionId } });
  if (!position) return { error: "Pozisyon bulunamadı." };
  if (position.status !== "OPEN") return { error: "Sadece açık pozisyonlar düzenlenebilir." };

  const quantity = new Decimal(parsed.data.quantity);
  const entryPrice = new Decimal(parsed.data.entryPrice);
  const contractSize = new Decimal(position.contractSize.toString());
  const newMargin = quantity.times(entryPrice).times(contractSize).dividedBy(parsed.data.leverage);
  const oldMargin = new Decimal(position.margin.toString());
  const delta = newMargin.minus(oldMargin); // positive = needs MORE reserved from the wallet

  const outcome = await prisma.$transaction(async (tx) => {
    const { walletId, cashBalance, usdBalance } = await lockWallet(tx, position.userId);
    const inUsd = position.currency === "USD";
    const balance = inUsd ? usdBalance : cashBalance;
    if (delta.gt(0) && balance.lt(delta)) {
      return { ok: false as const, error: "Kullanıcının bakiyesi yeni teminatı karşılamıyor." };
    }

    const nextBalance = balance.minus(delta).toString();
    await tx.wallet.update({ where: { id: walletId }, data: inUsd ? { usdBalance: nextBalance } : { cashBalance: nextBalance } });
    await tx.leveragedPosition.update({
      where: { id: position.id },
      data: {
        quantity: quantity.toString(),
        entryPrice: entryPrice.toString(),
        leverage: parsed.data.leverage,
        margin: newMargin.toString(),
      },
    });
    await tx.walletTransaction.create({
      data: {
        walletId,
        type: delta.gte(0) ? "LEVERAGE_OPEN" : "LEVERAGE_CLOSE",
        amount: delta.neg().toString(),
        balanceAfter: nextBalance,
        referenceType: "LEVERAGED_POSITION",
        referenceId: position.id,
        description: "Admin pozisyon düzenlemesi (teminat farkı)",
      },
    });
    return { ok: true as const };
  });

  if (!outcome.ok) return { error: outcome.error };

  await writeAuditLog({
    adminUserId: admin.id,
    action: "ORDER_EXECUTED",
    entityType: "LeveragedPosition",
    entityId: position.id,
    oldValue: { quantity: position.quantity.toString(), entryPrice: position.entryPrice.toString(), leverage: position.leverage },
    newValue: parsed.data,
  });
  revalidatePath("/admin/pozisyonlar");
  return { success: "Pozisyon güncellendi." };
}
