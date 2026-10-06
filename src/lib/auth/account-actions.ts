"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireUser } from "./rbac";
import { prisma } from "@/lib/prisma/client";

export interface AccountActionState {
  error?: string;
  ok?: boolean;
}

const passwordSchema = z
  .string()
  .min(8, "Yeni şifre en az 8 karakter olmalı.")
  .regex(/[A-Za-z]/, "Yeni şifre en az bir harf içermeli.")
  .regex(/[0-9]/, "Yeni şifre en az bir rakam içermeli.");

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mevcut şifrenizi girin."),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Yeni şifreler eşleşmiyor.",
    path: ["confirmPassword"],
  });

const changeEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email("Geçerli bir e-posta adresi girin."),
  currentPassword: z.string().min(1, "Şifrenizi girin."),
});

/** Re-checks the current password before any credential change. Phone-only accounts without a password cannot change either. */
async function verifyCurrentPassword(userId: string, password: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
  if (!user?.passwordHash) return "Bu hesapta şifre tanımlı değil.";
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? null : "Mevcut şifreniz hatalı.";
}

export async function changePasswordAction(_prev: AccountActionState, formData: FormData): Promise<AccountActionState> {
  const user = await requireUser();
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };

  const wrong = await verifyCurrentPassword(user.id, parsed.data.currentPassword);
  if (wrong) return { error: wrong };

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  return { ok: true };
}

export async function changeEmailAction(_prev: AccountActionState, formData: FormData): Promise<AccountActionState> {
  const user = await requireUser();
  const parsed = changeEmailSchema.safeParse({
    email: formData.get("email"),
    currentPassword: formData.get("currentPassword"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };

  const wrong = await verifyCurrentPassword(user.id, parsed.data.currentPassword);
  if (wrong) return { error: wrong };

  const taken = await prisma.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } });
  if (taken && taken.id !== user.id) return { error: "Bu e-posta adresi zaten kullanılıyor." };

  await prisma.user.update({ where: { id: user.id }, data: { email: parsed.data.email } });
  return { ok: true };
}
