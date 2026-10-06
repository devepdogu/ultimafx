"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { writeAuditLog } from "@/lib/audit/log";
import { syncNews } from "@/lib/news/sync";
import { syncIposFromFeed } from "@/lib/ipo/sync";
import type { AdminActionResult } from "./content-actions";

export async function refreshNewsAction(): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  try {
    const result = await syncNews();
    await writeAuditLog({ adminUserId: admin.id, action: "NEWS_SYNCED", entityType: "NewsArticle", newValue: result });
    revalidatePath("/haberler");
    return { success: `${result.added} yeni haber eklendi (${result.checked} kayıt kontrol edildi).` };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Haberler güncellenemedi." };
  }
}

export async function refreshIposAction(): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  try {
    const result = await syncIposFromFeed();
    await writeAuditLog({ adminUserId: admin.id, action: "IPO_SYNCED", entityType: "IPO", newValue: result });
    revalidatePath("/halka-arz");
    revalidatePath("/admin/halka-arz");
    return { success: `${result.created} yeni, ${result.updated} güncellenen halka arz.` };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Halka arzlar güncellenemedi." };
  }
}

const ipoSchema = z.object({
  code: z.string().trim().min(2).max(12).transform((v) => v.toUpperCase()),
  companyName: z.string().trim().min(2).max(160),
  market: z.string().trim().max(40).optional(),
  ipoPriceMin: z.coerce.number().positive().optional(),
  ipoPriceMax: z.coerce.number().positive().optional(),
  demandCollectionStart: z.string().optional(),
  demandCollectionEnd: z.string().optional(),
  status: z.enum(["UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED"]),
  officialSourceUrl: z.string().url().optional(),
});

/** Manual entry for an IPO the feed does not carry yet. Created unpublished. */
export async function createIpoAction(_prev: AdminActionResult, formData: FormData): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const parsed = ipoSchema.safeParse({
    code: formData.get("code"),
    companyName: formData.get("companyName"),
    market: formData.get("market") || undefined,
    ipoPriceMin: formData.get("ipoPriceMin") || undefined,
    ipoPriceMax: formData.get("ipoPriceMax") || undefined,
    demandCollectionStart: formData.get("demandCollectionStart") || undefined,
    demandCollectionEnd: formData.get("demandCollectionEnd") || undefined,
    status: formData.get("status") || "UPCOMING",
    officialSourceUrl: formData.get("officialSourceUrl") || undefined,
  });
  if (!parsed.success) return { error: "Kod ve şirket adı zorunludur. Fiyat ve tarihler geçerli olmalı." };

  const d = parsed.data;
  const exists = await prisma.iPO.findUnique({ where: { code: d.code }, select: { id: true } });
  if (exists) return { error: `${d.code} kodlu bir halka arz zaten var.` };

  const ipo = await prisma.iPO.create({
    data: {
      code: d.code,
      companyName: d.companyName,
      market: d.market ?? null,
      ipoPriceMin: d.ipoPriceMin ?? null,
      ipoPriceMax: d.ipoPriceMax ?? null,
      demandCollectionStart: d.demandCollectionStart ? new Date(d.demandCollectionStart) : null,
      demandCollectionEnd: d.demandCollectionEnd ? new Date(d.demandCollectionEnd) : null,
      status: d.status,
      officialSourceUrl: d.officialSourceUrl ?? null,
      isPublished: false,
    },
  });
  await writeAuditLog({ adminUserId: admin.id, action: "IPO_CREATED", entityType: "IPO", entityId: ipo.id, newValue: { code: ipo.code } });
  revalidatePath("/admin/halka-arz");
  return { success: `${ipo.code} eklendi. Yayınlamak için listeden açın.` };
}

export async function toggleIpoPublishedAction(id: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const before = await prisma.iPO.findUniqueOrThrow({ where: { id } });
  await prisma.iPO.update({ where: { id }, data: { isPublished: !before.isPublished } });
  await writeAuditLog({
    adminUserId: admin.id,
    action: "IPO_UPDATED",
    entityType: "IPO",
    entityId: id,
    oldValue: { isPublished: before.isPublished },
    newValue: { isPublished: !before.isPublished },
  });
  revalidatePath("/halka-arz");
  revalidatePath("/admin/halka-arz");
  return { success: "Güncellendi." };
}
