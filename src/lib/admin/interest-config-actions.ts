"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { writeAuditLog } from "@/lib/audit/log";
import { recomputeTermProductRates } from "@/lib/interest/config";
import type { AdminActionResult } from "./content-actions";

const configSchema = z.object({
  tryAnnualRate: z.coerce.number().min(0).max(1000),
  usdAnnualRate: z.coerce.number().min(0).max(1000),
  autoDistribute: z.boolean(),
  earlyWithdrawalPenaltyPercent: z.coerce.number().min(0).max(100),
});

/** Updates the two base annual rates, the auto-distribute toggle, and the early-withdrawal
 * penalty — then recomputes every term product's own rate (base × its multiplier) so the
 * change takes effect everywhere at once instead of needing each product re-saved by hand. */
export async function updateInterestConfigAction(_prev: AdminActionResult, formData: FormData): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const parsed = configSchema.safeParse({
    tryAnnualRate: formData.get("tryAnnualRate"),
    usdAnnualRate: formData.get("usdAnnualRate"),
    autoDistribute: formData.get("autoDistribute") === "on",
    earlyWithdrawalPenaltyPercent: formData.get("earlyWithdrawalPenaltyPercent"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz alanlar." };

  const before = await prisma.interestConfig.findUnique({ where: { id: "default" } });
  await prisma.interestConfig.upsert({
    where: { id: "default" },
    update: parsed.data,
    create: { id: "default", ...parsed.data },
  });
  await recomputeTermProductRates();

  await writeAuditLog({
    adminUserId: admin.id,
    action: "DATA_PROVIDER_CHANGED",
    entityType: "InterestConfig",
    entityId: "default",
    oldValue: before,
    newValue: parsed.data,
  });
  revalidatePath("/admin/vadeli-mevduat");
  revalidatePath("/admin/vadeli-mevduat/ayarlar");
  return { success: "Faiz ayarları kaydedildi ve tüm vade ürünlerine uygulandı." };
}
