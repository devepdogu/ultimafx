"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { writeAuditLog } from "@/lib/audit/log";
import { decryptSecret, encryptSecret } from "@/lib/crypto/secret-box";
import { cancelOrder, executeMarketOrder } from "@/lib/trading/engine";
import { TradingError } from "@/lib/trading/errors";
import type { AdminActionResult } from "./content-actions";

const round2 = (n: number) => Math.round(n * 100) / 100;
const round6 = (n: number) => Math.round(n * 1_000_000) / 1_000_000;

const STATUSES = ["ACTIVE", "SUSPENDED", "PENDING_VERIFICATION", "CLOSED"] as const;

/** Changes an account's status. Suspended and closed accounts cannot sign in or trade. */
export async function setUserStatusAction(_prev: AdminActionResult, formData: FormData): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const parsed = z.object({ userId: z.string().min(1), status: z.enum(STATUSES) }).safeParse({
    userId: formData.get("userId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: "Geçersiz durum." };

  const before = await prisma.user.findUnique({ where: { id: parsed.data.userId }, select: { status: true } });
  if (!before) return { error: "Kullanıcı bulunamadı." };
  await prisma.user.update({ where: { id: parsed.data.userId }, data: { status: parsed.data.status } });
  await writeAuditLog({
    adminUserId: admin.id,
    action: "USER_STATUS_CHANGED",
    entityType: "User",
    entityId: parsed.data.userId,
    oldValue: { status: before.status },
    newValue: { status: parsed.data.status },
  });
  revalidatePath("/admin/kullanicilar");
  return { success: "Kullanıcı durumu güncellendi." };
}

/**
 * KYC decision for all of a user's documents. Approve marks the documents approved and activates
 * the account. Reject marks them rejected with the note, so the user sees why and can re-upload.
 */
export async function reviewKycAction(_prev: AdminActionResult, formData: FormData): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const parsed = z
    .object({
      userId: z.string().min(1),
      decision: z.enum(["approve", "reject"]),
      note: z.string().trim().max(300).optional(),
    })
    .safeParse({
      userId: formData.get("userId"),
      decision: formData.get("decision"),
      note: formData.get("note") ?? "",
    });
  if (!parsed.success) return { error: "Geçersiz karar." };
  const { userId, decision } = parsed.data;

  const docs = await prisma.kycDocument.findMany({ where: { userId }, select: { side: true } });
  const sides = new Set(docs.map((d) => d.side));
  if (!sides.has("FRONT") || !sides.has("BACK")) {
    return { error: "Onay için ön ve arka yüz belgelerinin ikisi de yüklenmiş olmalı." };
  }
  if (decision === "reject" && !parsed.data.note) return { error: "Red için bir not yazın; kullanıcı nedeni görecek." };

  await prisma.$transaction([
    prisma.kycDocument.updateMany({
      where: { userId },
      data: decision === "approve" ? { reviewStatus: "APPROVED", reviewNote: null } : { reviewStatus: "REJECTED", reviewNote: parsed.data.note ?? null },
    }),
    prisma.user.update({
      where: { id: userId },
      data: decision === "approve" ? { status: "ACTIVE" } : {},
    }),
  ]);
  await writeAuditLog({
    adminUserId: admin.id,
    action: decision === "approve" ? "KYC_APPROVED" : "KYC_REJECTED",
    entityType: "User",
    entityId: userId,
    newValue: { note: parsed.data.note ?? null },
  });
  revalidatePath("/admin/kullanicilar");
  revalidatePath(`/admin/kullanicilar/${userId}`);
  revalidatePath("/profil");
  return { success: decision === "approve" ? "KYC onaylandı, hesap aktif edildi." : "KYC reddedildi, kullanıcıya not iletildi." };
}

// ---------- Bakiye ayarlama ----------

const adjustSchema = z.object({
  userId: z.string().min(1),
  currency: z.enum(["TRY", "USD"]),
  direction: z.enum(["add", "remove"]),
  amount: z.coerce.number().positive("Tutar sıfırdan büyük olmalı."),
  reason: z.string().trim().min(3, "Bir açıklama yazın; kullanıcı geçmişinde ve denetim kaydında görünür.").max(300),
});

/**
 * Manually credits or debits a user's TRY or USD cash balance — the admin equivalent of a deposit
 * or withdrawal that didn't go through the usual request flow (a correction, a goodwill credit,
 * a chargeback, ...). Always writes a real WalletTransaction (type ADJUSTMENT) so it shows up in
 * the user's own wallet history exactly like any other movement, never a silent balance edit.
 */
export async function adjustUserBalanceAction(_prev: AdminActionResult, formData: FormData): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const parsed = adjustSchema.safeParse({
    userId: formData.get("userId"),
    currency: formData.get("currency"),
    direction: formData.get("direction"),
    amount: formData.get("amount"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz alanlar." };
  const { userId, currency, direction, reason } = parsed.data;
  const amount = round2(parsed.data.amount);
  const field = currency === "USD" ? "usdBalance" : "cashBalance";
  const signed = direction === "add" ? amount : -amount;

  const outcome = await prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<{ id: string; cashBalance: string; usdBalance: string }[]>`
      SELECT id, "cashBalance", "usdBalance" FROM "Wallet" WHERE "userId" = ${userId} FOR UPDATE
    `;
    const wallet = rows[0];
    if (!wallet) return { ok: false as const, reason: "no-wallet" as const };
    const before = Number(currency === "USD" ? wallet.usdBalance : wallet.cashBalance);
    const after = round2(before + signed);
    if (after < 0) return { ok: false as const, reason: "insufficient" as const };

    await tx.wallet.update({ where: { id: wallet.id }, data: { [field]: after.toFixed(6) } });
    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "ADJUSTMENT",
        amount: signed.toFixed(6),
        balanceAfter: after.toFixed(6),
        referenceType: "AdminAdjustment",
        referenceId: admin.id,
        description: `Admin düzeltmesi (${currency}): ${reason}`,
      },
    });
    return { ok: true as const, before, after };
  });

  if (!outcome.ok) {
    return { error: outcome.reason === "insufficient" ? "Bakiye negatif olamaz; çıkarılacak tutar mevcut bakiyeden fazla." : "Kullanıcının cüzdanı bulunamadı." };
  }
  const result = outcome;

  await writeAuditLog({
    adminUserId: admin.id,
    action: "USER_BALANCE_ADJUSTED",
    entityType: "User",
    entityId: userId,
    oldValue: { currency, balance: result.before },
    newValue: { currency, balance: result.after, direction, amount, reason },
  });
  revalidatePath(`/admin/kullanicilar/${userId}`);
  revalidatePath("/cuzdan");
  return { success: `${direction === "add" ? "Eklendi" : "Çıkarıldı"}: ${amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ${currency}. Yeni bakiye: ${result.after.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ${currency}.` };
}

// ---------- Pozisyon (lot) düzenleme ----------

const holdingSchema = z.object({
  holdingId: z.string().min(1),
  userId: z.string().min(1),
  quantity: z.coerce.number().min(0, "Adet negatif olamaz."),
  averageCost: z.coerce.number().min(0, "Maliyet negatif olamaz."),
});

/**
 * Directly sets a holding's quantity and average cost — a manual correction tool (a bad trade, a
 * migrated position, a reconciliation), not a trade: it doesn't move cash or write a Trade/Order
 * row. Setting the quantity to 0 closes the position the same way selling it all the way would.
 */
export async function updateHoldingQuantityAction(_prev: AdminActionResult, formData: FormData): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const parsed = holdingSchema.safeParse({
    holdingId: formData.get("holdingId"),
    userId: formData.get("userId"),
    quantity: formData.get("quantity"),
    averageCost: formData.get("averageCost"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz alanlar." };
  const { holdingId, userId, averageCost } = parsed.data;
  const quantity = round6(parsed.data.quantity);

  const holding = await prisma.holding.findUnique({
    where: { id: holdingId },
    select: { id: true, quantity: true, averageCost: true, portfolio: { select: { userId: true } }, asset: { select: { symbol: true } } },
  });
  if (!holding || holding.portfolio.userId !== userId) return { error: "Pozisyon bulunamadı." };

  if (quantity === 0) {
    await prisma.holding.delete({ where: { id: holdingId } });
  } else {
    await prisma.holding.update({ where: { id: holdingId }, data: { quantity: quantity.toFixed(6), averageCost: round2(averageCost).toFixed(6) } });
  }

  await writeAuditLog({
    adminUserId: admin.id,
    action: "HOLDING_QUANTITY_ADJUSTED",
    entityType: "Holding",
    entityId: holdingId,
    oldValue: { symbol: holding.asset.symbol, quantity: holding.quantity.toString(), averageCost: holding.averageCost.toString() },
    newValue: { symbol: holding.asset.symbol, quantity, averageCost },
  });
  revalidatePath(`/admin/kullanicilar/${userId}`);
  revalidatePath("/admin/pozisyonlar");
  revalidatePath("/portfoy");
  return { success: quantity === 0 ? `${holding.asset.symbol} pozisyonu kapatıldı.` : `${holding.asset.symbol} pozisyonu güncellendi.` };
}

// ---------- Şifre belirleme ----------

const newPasswordSchema = z
  .object({
    userId: z.string().min(1),
    newPassword: z.string().min(8, "Şifre en az 8 karakter olmalı.").regex(/[A-Za-z]/, "En az bir harf içermeli.").regex(/[0-9]/, "En az bir rakam içermeli."),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { message: "Şifreler eşleşmiyor.", path: ["confirmPassword"] });

/**
 * Sets a new password for a user — used when a user is locked out, or an admin wants to
 * replace the password outright rather than just viewing it (see revealUserPasswordAction).
 */
export async function setUserPasswordAction(_prev: AdminActionResult, formData: FormData): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const parsed = newPasswordSchema.safeParse({
    userId: formData.get("userId"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz şifre." };

  const user = await prisma.user.findUnique({ where: { id: parsed.data.userId }, select: { id: true } });
  if (!user) return { error: "Kullanıcı bulunamadı." };

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  const passwordEncrypted = encryptSecret(parsed.data.newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash, passwordEncrypted } });
  await writeAuditLog({ adminUserId: admin.id, action: "USER_PASSWORD_RESET", entityType: "User", entityId: user.id });
  revalidatePath(`/admin/kullanicilar/${user.id}`);
  return { success: "Yeni şifre kaydedildi." };
}

/** Decrypts and returns a user's current password, for an admin who explicitly asks to see it
 * (a deliberate click, never shown by default) — see secret-box.ts and the User.passwordEncrypted
 * doc comment for why this is reversible encryption, not the bcrypt hash login checks against. */
export async function revealUserPasswordAction(userId: string): Promise<{ value: string | null; error?: string }> {
  const admin = await requireAdmin();
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, passwordEncrypted: true } });
  if (!user) return { value: null, error: "Kullanıcı bulunamadı." };
  if (!user.passwordEncrypted) {
    return { value: null, error: "Bu kullanıcı bu özellik eklendikten sonra hiç şifre değiştirmedi, şifre görüntülenemiyor." };
  }
  await writeAuditLog({ adminUserId: admin.id, action: "USER_PASSWORD_VIEWED", entityType: "User", entityId: user.id });
  try {
    return { value: decryptSecret(user.passwordEncrypted) };
  } catch {
    return { value: null, error: "Şifre çözülemedi." };
  }
}

/** Decrypts and returns a user's T.C. Kimlik No, for an admin who explicitly asks to see it —
 * see User.tcKimlikEncrypted's doc comment. More sensitive than a password (it can't be reset
 * if ever leaked), so every view is audit-logged same as the password one. */
export async function revealUserTcKimlikAction(userId: string): Promise<{ value: string | null; error?: string }> {
  const admin = await requireAdmin();
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, tcKimlikEncrypted: true } });
  if (!user) return { value: null, error: "Kullanıcı bulunamadı." };
  if (!user.tcKimlikEncrypted) {
    return { value: null, error: "Bu kullanıcı için T.C. Kimlik No girilmemiş veya bu özellik eklenmeden önce kayıt olmuş." };
  }
  await writeAuditLog({ adminUserId: admin.id, action: "USER_TCKIMLIK_VIEWED", entityType: "User", entityId: user.id });
  try {
    return { value: decryptSecret(user.tcKimlikEncrypted) };
  } catch {
    return { value: null, error: "Çözülemedi." };
  }
}

const adminOrderSchema = z.object({
  userId: z.string().min(1),
  symbol: z.string().trim().toUpperCase().min(1).max(20),
  side: z.enum(["BUY", "SELL"]),
  quantity: z.coerce.number().positive().max(1_000_000_000),
});

/** Places a real market order on a user's own wallet/portfolio, through the exact same
 * `executeMarketOrder` engine a user's own trade goes through — not a fabricated holding edit.
 * For when a user asks support to open or close a position for them. */
export async function adminPlaceMarketOrderAction(_prev: AdminActionResult, formData: FormData): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const parsed = adminOrderSchema.safeParse({
    userId: formData.get("userId"),
    symbol: formData.get("symbol"),
    side: formData.get("side"),
    quantity: formData.get("quantity"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz alanlar." };

  const asset = await prisma.asset.findUnique({ where: { symbol: parsed.data.symbol } });
  if (!asset) return { error: `"${parsed.data.symbol}" sembolünde bir varlık bulunamadı.` };

  try {
    const trade = await executeMarketOrder({
      userId: parsed.data.userId,
      assetId: asset.id,
      side: parsed.data.side,
      quantity: parsed.data.quantity,
    });
    await writeAuditLog({
      adminUserId: admin.id,
      action: "ORDER_EXECUTED",
      entityType: "Order",
      entityId: trade.orderId,
      newValue: { onBehalfOfUserId: parsed.data.userId, symbol: asset.symbol, side: parsed.data.side, quantity: parsed.data.quantity },
    });
    revalidatePath(`/admin/kullanicilar/${parsed.data.userId}`);
    revalidatePath("/admin/pozisyonlar");
    const verb = parsed.data.side === "BUY" ? "alındı" : "satıldı";
    return { success: `${trade.quantity.toString()} adet ${asset.symbol} ${verb}.` };
  } catch (err) {
    if (err instanceof TradingError) return { error: err.turkishMessage };
    throw err;
  }
}

/** Sells a holding down to zero at market price — the real "close this spot position" action
 * (not the no-cash-movement quantity editor above), through the same engine a user's own close
 * goes through. Used from the platform-wide /admin/pozisyonlar list. */
export async function adminCloseHoldingAction(holdingId: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const holding = await prisma.holding.findUnique({
    where: { id: holdingId },
    select: { assetId: true, quantity: true, portfolio: { select: { userId: true } }, asset: { select: { symbol: true } } },
  });
  if (!holding) return { error: "Pozisyon bulunamadı." };

  try {
    const trade = await executeMarketOrder({
      userId: holding.portfolio.userId,
      assetId: holding.assetId,
      side: "SELL",
      quantity: holding.quantity.toString(),
    });
    await writeAuditLog({
      adminUserId: admin.id,
      action: "ORDER_EXECUTED",
      entityType: "Order",
      entityId: trade.orderId,
      newValue: { closedHoldingId: holdingId, symbol: holding.asset.symbol, closedBy: "ADMIN" },
    });
    revalidatePath("/admin/pozisyonlar");
    return { success: `${trade.quantity.toString()} adet ${holding.asset.symbol} satılarak pozisyon kapatıldı.` };
  } catch (err) {
    if (err instanceof TradingError) return { error: err.turkishMessage };
    throw err;
  }
}

/** Cancels any user's pending/open order — the admin equivalent of the user's own
 * cancelOrderAction, for the platform-wide /admin/pozisyonlar list. */
export async function adminCancelOrderAction(orderId: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { userId: true } });
  if (!order) return { error: "Emir bulunamadı." };

  try {
    await cancelOrder(order.userId, orderId);
  } catch {
    return { error: "Emir iptal edilemedi (zaten tamamlanmış ya da iptal olmuş olabilir)." };
  }
  await writeAuditLog({ adminUserId: admin.id, action: "ORDER_CANCELLED", entityType: "Order", entityId: orderId });
  revalidatePath("/admin/pozisyonlar");
  return { success: "Emir iptal edildi." };
}
