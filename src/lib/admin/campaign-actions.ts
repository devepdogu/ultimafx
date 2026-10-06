"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { writeAuditLog } from "@/lib/audit/log";
import type { AdminActionResult } from "./content-actions";

const campaignSchema = z.object({
  title: z.string().trim().min(2, "Başlık en az 2 karakter olmalı.").max(120),
  tagline: z.string().trim().min(2, "Alt başlık en az 2 karakter olmalı.").max(120),
  description: z.string().trim().min(10, "Açıklama en az 10 karakter olmalı.").max(1000),
  rewardLabel: z.string().trim().min(1, "Ödül metni zorunlu.").max(60),
  category: z.string().trim().min(2, "Kategori zorunlu.").max(40),
  status: z.enum(["ACTIVE", "UPCOMING", "ENDED"]),
  position: z.coerce.number().int().min(0).max(1000),
});

/** URL-safe slug from a Turkish title. A short random suffix keeps it unique. */
function slugify(title: string) {
  const base = title
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base || "kampanya"}-${randomBytes(3).toString("hex")}`;
}

/** Creates a campaign when no id is posted, otherwise updates that campaign. */
export async function saveCampaignAction(_prev: AdminActionResult, formData: FormData): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = campaignSchema.safeParse({
    title: formData.get("title"),
    tagline: formData.get("tagline"),
    description: formData.get("description"),
    rewardLabel: formData.get("rewardLabel"),
    category: formData.get("category"),
    status: formData.get("status"),
    position: formData.get("position") ?? 0,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz alanlar." };
  const isFeatured = formData.get("isFeatured") === "on";

  if (id) {
    const before = await prisma.campaign.findUnique({ where: { id } });
    if (!before) return { error: "Kampanya bulunamadı." };
    const updated = await prisma.campaign.update({ where: { id }, data: { ...parsed.data, isFeatured } });
    await writeAuditLog({
      adminUserId: admin.id,
      action: "CAMPAIGN_UPDATED",
      entityType: "Campaign",
      entityId: id,
      oldValue: { title: before.title, status: before.status, isFeatured: before.isFeatured },
      newValue: { title: updated.title, status: updated.status, isFeatured: updated.isFeatured },
    });
  } else {
    const created = await prisma.campaign.create({
      data: { ...parsed.data, slug: slugify(parsed.data.title), isFeatured, isActive: true },
    });
    await writeAuditLog({ adminUserId: admin.id, action: "CAMPAIGN_CREATED", entityType: "Campaign", entityId: created.id, newValue: { title: created.title } });
  }

  revalidatePath("/odulller");
  revalidatePath("/admin/kampanyalar");
  return { success: id ? "Kampanya güncellendi." : "Kampanya eklendi." };
}

/** Permanently removes a campaign. Used for entries added by mistake; prefer hiding for anything that ran. */
export async function deleteCampaignAction(id: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const before = await prisma.campaign.findUnique({ where: { id }, select: { title: true } });
  if (!before) return { error: "Kampanya bulunamadı." };
  await prisma.campaign.delete({ where: { id } });
  await writeAuditLog({ adminUserId: admin.id, action: "CAMPAIGN_DELETED", entityType: "Campaign", entityId: id, oldValue: { title: before.title } });
  revalidatePath("/odulller");
  revalidatePath("/admin/kampanyalar");
  return { success: "Kampanya silindi." };
}

/** Shows or hides a campaign for users. Hidden campaigns stay in the database. */
export async function toggleCampaignAction(id: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const before = await prisma.campaign.findUnique({ where: { id }, select: { isActive: true, title: true } });
  if (!before) return { error: "Kampanya bulunamadı." };
  await prisma.campaign.update({ where: { id }, data: { isActive: !before.isActive } });
  await writeAuditLog({
    adminUserId: admin.id,
    action: "CAMPAIGN_UPDATED",
    entityType: "Campaign",
    entityId: id,
    oldValue: { isActive: before.isActive },
    newValue: { isActive: !before.isActive },
  });
  revalidatePath("/odulller");
  revalidatePath("/admin/kampanyalar");
  return { success: before.isActive ? "Kampanya kullanıcılardan gizlendi." : "Kampanya yayına alındı." };
}
