"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma/client";
import { signIn, signOut } from "./auth";
import { loginSchema, registerSchema } from "./schemas";
import { hashTcKimlik, isValidTcKimlik, normalizePhone } from "./identity";
import { encryptSecret } from "@/lib/crypto/secret-box";

export interface ActionResult {
  error?: string;
}

export async function loginAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "T.C. Kimlik veya telefon ve şifrenizi girin." };
  }

  try {
    await signIn("credentials", {
      identifier: parsed.data.identifier,
      password: parsed.data.password,
      redirectTo: "/",
    });
    return {};
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Bilgiler hatalı." };
    }
    throw err;
  }
}

export async function registerAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    tc: formData.get("tc"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    passwordRepeat: formData.get("passwordRepeat"),
  });
  if (!parsed.success) {
    return { error: "Lütfen tüm alanları doğru şekilde doldurun." };
  }
  const { name, password, passwordRepeat } = parsed.data;
  const tc = parsed.data.tc;

  if (!isValidTcKimlik(tc)) return { error: "Geçerli bir T.C. Kimlik numarası girin." };
  const phone = normalizePhone(parsed.data.phone);
  if (!phone) return { error: "Geçerli bir telefon numarası girin (5XX XXX XX XX)." };
  if (password !== passwordRepeat) return { error: "Şifreler eşleşmiyor." };
  if (formData.get("terms") !== "on" || formData.get("kvkk") !== "on") {
    return { error: "Sözleşme ve KVKK metnini onaylamanız gerekir." };
  }

  const tcKimlikHash = hashTcKimlik(tc);
  const tcKimlikEncrypted = encryptSecret(tc);
  const existing = await prisma.user.findFirst({
    where: { OR: [{ tcKimlikHash }, { phone }] },
    select: { id: true },
  });
  if (existing) {
    return { error: "Bu T.C. Kimlik veya telefon numarası ile zaten bir hesap var." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const passwordEncrypted = encryptSecret(password);
  const userRole = await prisma.role.findUnique({ where: { key: "USER" } });
  const refCode = String(formData.get("ref") ?? "").trim().toUpperCase();
  const referrer = refCode
    ? await prisma.user.findUnique({ where: { referralCode: refCode }, select: { id: true } })
    : null;
  const now = new Date();

  await prisma.user.create({
    data: {
      name,
      phone,
      tcKimlikHash,
      tcKimlikEncrypted,
      passwordHash,
      passwordEncrypted,
      termsAcceptedAt: now,
      kvkkAcceptedAt: now,
      status: "ACTIVE",
      roles: userRole ? { create: { roleId: userRole.id } } : undefined,
      wallet: { create: {} },
      portfolio: { create: {} },
      referredById: referrer?.id ?? null,
    },
  });

  try {
    await signIn("credentials", { identifier: phone, password, redirectTo: "/" });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Kayıt oluşturuldu ancak giriş başarısız oldu." };
    }
    throw err;
  }

  return {};
}

export async function logoutAction() {
  await signOut({ redirectTo: "/giris" });
}
