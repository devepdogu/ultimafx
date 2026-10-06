"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { writeAuditLog } from "@/lib/audit/log";
import type { AdminActionResult } from "./content-actions";

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
