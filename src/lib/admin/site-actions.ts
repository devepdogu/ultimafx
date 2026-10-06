"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { writeAuditLog } from "@/lib/audit/log";
import { DEFAULT_SITE_NAME } from "@/lib/site/settings";
import type { AdminActionResult } from "./content-actions";

const siteSchema = z.object({
  siteName: z.string().trim().min(2).max(60),
  logoUrl: z
    .string()
    .trim()
    .refine((v) => v === "" || /^https?:\/\//.test(v), { message: "Geçerli bir bağlantı girin" })
    .transform((v) => (v === "" ? null : v)),
});

export async function updateSiteSettingsAction(_prev: AdminActionResult, formData: FormData): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const parsed = siteSchema.safeParse({
    siteName: formData.get("siteName") || DEFAULT_SITE_NAME,
    logoUrl: formData.get("logoUrl") ?? "",
  });
  if (!parsed.success) return { error: "Site adı en az 2 karakter olmalı ve logo bağlantısı geçerli olmalı." };

  const before = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: parsed.data,
    create: { id: "default", ...parsed.data },
  });
  await writeAuditLog({
    adminUserId: admin.id,
    action: "SITE_SETTINGS_UPDATED",
    entityType: "SiteSettings",
    entityId: "default",
    oldValue: { siteName: before?.siteName ?? null, logoUrl: before?.logoUrl ?? null },
    newValue: parsed.data,
  });
  revalidatePath("/", "layout");
  return { success: "Site ayarları kaydedildi." };
}
