"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { writeAuditLog } from "@/lib/audit/log";
import type { AdminActionResult } from "./content-actions";

const optionalUrl = z.string().trim().max(500).transform((v) => v || null).refine((v) => v === null || /^(https?:\/\/|\/)/.test(v), "Bağlantılar https:// ile başlamalı.");

const bannerSchema = z.object({
  title: z.string().trim().min(2, "Başlık en az 2 karakter olmalı.").max(120),
  subtitle: z.string().trim().max(160).transform((v) => v || null),
  imageUrl: optionalUrl,
  linkUrl: optionalUrl,
  position: z.coerce.number().int().min(0).max(1000),
});

/** Creates a banner when no id is posted, otherwise updates it. */
export async function saveBannerAction(_prev: AdminActionResult, formData: FormData): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = bannerSchema.safeParse({
    title: formData.get("title"),
    subtitle: formData.get("subtitle") ?? "",
    imageUrl: formData.get("imageUrl") ?? "",
    linkUrl: formData.get("linkUrl") ?? "",
    position: formData.get("position") ?? 0,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz alanlar." };

  if (id) {
    const before = await prisma.banner.findUnique({ where: { id } });
    if (!before) return { error: "Banner bulunamadı." };
    const updated = await prisma.banner.update({ where: { id }, data: parsed.data });
    await writeAuditLog({
      adminUserId: admin.id,
      action: "BANNER_UPDATED",
      entityType: "Banner",
      entityId: id,
      oldValue: { title: before.title, position: before.position },
      newValue: { title: updated.title, position: updated.position },
    });
  } else {
    const created = await prisma.banner.create({ data: { ...parsed.data, isActive: true } });
    await writeAuditLog({ adminUserId: admin.id, action: "BANNER_CREATED", entityType: "Banner", entityId: created.id, newValue: { title: created.title } });
  }

  revalidatePath("/admin/bannerlar");
  revalidatePath("/");
  return { success: id ? "Banner güncellendi." : "Banner eklendi." };
}

/** Permanently removes a banner. */
export async function deleteBannerAction(id: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const before = await prisma.banner.findUnique({ where: { id }, select: { title: true } });
  if (!before) return { error: "Banner bulunamadı." };
  await prisma.banner.delete({ where: { id } });
  await writeAuditLog({ adminUserId: admin.id, action: "BANNER_DELETED", entityType: "Banner", entityId: id, oldValue: { title: before.title } });
  revalidatePath("/admin/bannerlar");
  revalidatePath("/");
  return { success: "Banner silindi." };
}
