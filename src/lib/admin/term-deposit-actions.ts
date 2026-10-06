"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { writeAuditLog } from "@/lib/audit/log";
import type { AdminActionResult } from "./content-actions";

const productSchema = z.object({
  currency: z.enum(["TRY", "USD"]),
  termDays: z.coerce.number().int().min(1).max(3650),
  annualRate: z.coerce.number().min(0).max(1000),
  minAmount: z.coerce.number().min(0).max(1e12),
  position: z.coerce.number().int().min(0).max(1000),
});

export async function createTermDepositProductAction(
  _prev: AdminActionResult,
  formData: FormData
): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const parsed = productSchema.safeParse({
    currency: formData.get("currency"),
    termDays: formData.get("termDays"),
    annualRate: formData.get("annualRate"),
    minAmount: formData.get("minAmount"),
    position: formData.get("position") ?? 0,
  });
  if (!parsed.success) return { error: "Geçersiz alanlar. Vade (gün), yıllık oran ve minimum tutar zorunludur." };

  const product = await prisma.termDepositProduct.create({
    data: {
      currency: parsed.data.currency,
      termDays: parsed.data.termDays,
      annualRate: parsed.data.annualRate,
      minAmount: parsed.data.minAmount,
      position: parsed.data.position,
    },
  });
  await writeAuditLog({
    adminUserId: admin.id,
    action: "TERM_DEPOSIT_CREATED",
    entityType: "TermDepositProduct",
    entityId: product.id,
    newValue: parsed.data,
  });
  revalidatePath("/cuzdan/vadeli-mevduat");
  return { success: "Vadeli mevduat ürünü eklendi." };
}

export async function toggleTermDepositProductAction(productId: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const before = await prisma.termDepositProduct.findUniqueOrThrow({ where: { id: productId } });
  await prisma.termDepositProduct.update({ where: { id: productId }, data: { isActive: !before.isActive } });
  await writeAuditLog({
    adminUserId: admin.id,
    action: "TERM_DEPOSIT_UPDATED",
    entityType: "TermDepositProduct",
    entityId: productId,
    oldValue: { isActive: before.isActive },
    newValue: { isActive: !before.isActive },
  });
  revalidatePath("/cuzdan/vadeli-mevduat");
  return { success: "Güncellendi." };
}
