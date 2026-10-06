"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { writeAuditLog } from "@/lib/audit/log";
import type { AdminActionResult } from "./content-actions";

/** Optional number: an empty input means "not published yet" and is stored as null. */
const optionalNumber = z.union([z.literal(""), z.coerce.number()]).transform((v) => (v === "" ? null : v));

const fundSchema = z.object({
  name: z.string().trim().min(3, "Fon adı en az 3 karakter olmalı.").max(200),
  companyName: z.string().trim().min(2, "Yönetici şirket zorunlu.").max(120),
  category: z.string().trim().min(2, "Kategori zorunlu.").max(40),
  description: z.string().trim().max(500),
  risk: z.coerce.number().int().min(1, "Risk 1-7 arasında olmalı.").max(7, "Risk 1-7 arasında olmalı."),
  unitPrice: optionalNumber,
  ytdReturn: optionalNumber,
  oneYearReturn: optionalNumber,
  aum: optionalNumber,
  investorCount: optionalNumber,
  position: z.coerce.number().int().min(0).max(1000),
});

/** Creates a fund when no id is posted, otherwise updates it. Every change is audited. */
export async function saveFundAction(_prev: AdminActionResult, formData: FormData): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = fundSchema.safeParse({
    name: formData.get("name"),
    companyName: formData.get("companyName"),
    category: formData.get("category"),
    description: formData.get("description") ?? "",
    risk: formData.get("risk"),
    unitPrice: formData.get("unitPrice") ?? "",
    ytdReturn: formData.get("ytdReturn") ?? "",
    oneYearReturn: formData.get("oneYearReturn") ?? "",
    aum: formData.get("aum") ?? "",
    investorCount: formData.get("investorCount") ?? "",
    position: formData.get("position") ?? 0,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz alanlar." };

  const d = parsed.data;
  const data = {
    ...d,
    description: d.description || null,
    investorCount: d.investorCount === null ? null : Math.round(d.investorCount),
  };

  if (id) {
    const before = await prisma.investmentFund.findUnique({ where: { id } });
    if (!before) return { error: "Fon bulunamadı." };
    const updated = await prisma.investmentFund.update({ where: { id }, data });
    await writeAuditLog({
      adminUserId: admin.id,
      action: "FUND_UPDATED",
      entityType: "InvestmentFund",
      entityId: id,
      oldValue: { name: before.name, unitPrice: before.unitPrice?.toString() ?? null, risk: before.risk },
      newValue: { name: updated.name, unitPrice: updated.unitPrice?.toString() ?? null, risk: updated.risk },
    });
  } else {
    const created = await prisma.investmentFund.create({ data: { ...data, isActive: true } });
    await writeAuditLog({ adminUserId: admin.id, action: "FUND_CREATED", entityType: "InvestmentFund", entityId: created.id, newValue: { name: created.name } });
  }

  revalidatePath("/fonlar");
  revalidatePath("/admin/fonlar");
  return { success: id ? "Fon güncellendi." : "Fon eklendi." };
}

/** Deletes a fund. Refused while any user still holds units, so no position is left without its fund. */
export async function deleteFundAction(id: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const fund = await prisma.investmentFund.findUnique({ where: { id }, select: { name: true, _count: { select: { fundHoldings: true } } } });
  if (!fund) return { error: "Fon bulunamadı." };
  if (fund._count.fundHoldings > 0) return { error: "Bu fonda yatırımcı payları var; silmek yerine yayından kaldırın." };
  await prisma.investmentFund.delete({ where: { id } });
  await writeAuditLog({ adminUserId: admin.id, action: "FUND_DELETED", entityType: "InvestmentFund", entityId: id, oldValue: { name: fund.name } });
  revalidatePath("/fonlar");
  revalidatePath("/admin/fonlar");
  return { success: "Fon silindi." };
}
