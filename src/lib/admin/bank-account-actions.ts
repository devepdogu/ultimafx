"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { writeAuditLog } from "@/lib/audit/log";
import type { AdminActionResult } from "./content-actions";

const schema = z.object({
  bankName: z.string().trim().min(2).max(120),
  branch: z.string().trim().max(120).optional(),
  iban: z
    .string()
    .transform((v) => v.replace(/\s+/g, "").toUpperCase())
    .pipe(z.string().regex(/^TR\d{24}$/, "IBAN TR ile başlamalı ve 26 karakter olmalı.")),
  accountHolder: z.string().trim().min(3).max(120),
  instructions: z.string().trim().max(500).optional(),
});

export async function createBankAccountAction(_prev: AdminActionResult, formData: FormData): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const parsed = schema.safeParse({
    bankName: formData.get("bankName"),
    branch: formData.get("branch") || undefined,
    iban: formData.get("iban"),
    accountHolder: formData.get("accountHolder"),
    instructions: formData.get("instructions") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Banka adı, IBAN ve hesap sahibi zorunludur." };
  }

  const row = await prisma.bankAccount.create({
    data: { ...parsed.data, branch: parsed.data.branch || null, instructions: parsed.data.instructions || null, currency: "TRY", status: "ACTIVE" },
  });
  await writeAuditLog({
    adminUserId: admin.id,
    action: "BANK_ACCOUNT_CREATED",
    entityType: "BankAccount",
    entityId: row.id,
    newValue: { bankName: row.bankName, iban: row.iban },
  });
  revalidatePath("/cuzdan");
  revalidatePath("/cuzdan/para-yatir");
  return { success: "Banka hesabı eklendi." };
}

export async function toggleBankAccountAction(id: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const before = await prisma.bankAccount.findUniqueOrThrow({ where: { id } });
  const nextStatus = before.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
  await prisma.bankAccount.update({ where: { id }, data: { status: nextStatus } });
  await writeAuditLog({
    adminUserId: admin.id,
    action: "BANK_ACCOUNT_UPDATED",
    entityType: "BankAccount",
    entityId: id,
    oldValue: { status: before.status },
    newValue: { status: nextStatus },
  });
  revalidatePath("/cuzdan");
  revalidatePath("/cuzdan/para-yatir");
  return { success: "Güncellendi." };
}
