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
  // Trusted admin-only input, injected verbatim into every page — same trust level as an uploaded
  // image or a banner link URL. No sanitization/validation beyond a generous length cap.
  liveChatCode: z
    .string()
    .trim()
    .max(10_000, "Kod 10.000 karakteri geçemez.")
    .transform((v) => v || null),
});

export async function updateSiteSettingsAction(_prev: AdminActionResult, formData: FormData): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const parsed = siteSchema.safeParse({
    siteName: formData.get("siteName") || DEFAULT_SITE_NAME,
    logoUrl: formData.get("logoUrl") ?? "",
    liveChatCode: formData.get("liveChatCode") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz alanlar." };

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
    oldValue: { siteName: before?.siteName ?? null, logoUrl: before?.logoUrl ?? null, hadLiveChat: !!before?.liveChatCode },
    newValue: { siteName: parsed.data.siteName, logoUrl: parsed.data.logoUrl, hasLiveChat: !!parsed.data.liveChatCode },
  });
  revalidatePath("/", "layout");
  return { success: "Site ayarları kaydedildi." };
}
