"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";

export interface ProfileActionState {
  error?: string;
  ok?: boolean;
}

const GENDERS = ["Kadın", "Erkek"] as const;
const KYC_MAX_BYTES = 5 * 1024 * 1024;
const KYC_TYPES: readonly string[] = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const profileSchema = z.object({
  name: z.string().trim().min(2, "Ad soyad en az 2 karakter olmalı.").max(80),
  gender: z.union([z.literal(""), z.enum(GENDERS)]),
  birthDate: z.string().regex(/^$|^\d{4}-\d{2}-\d{2}$/, "Doğum tarihi geçersiz."),
  city: z.string().trim().max(60),
  country: z.string().trim().max(60),
});

/** Adults only: a birth date must be at least 18 years before today. */
function birthDateOk(iso: string) {
  if (!iso) return true;
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return false;
  const limit = new Date();
  limit.setUTCFullYear(limit.getUTCFullYear() - 18);
  return d <= limit && d.getUTCFullYear() >= 1900;
}

export async function updateProfileAction(_prev: ProfileActionState, formData: FormData): Promise<ProfileActionState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    gender: formData.get("gender") ?? "",
    birthDate: formData.get("birthDate") ?? "",
    city: formData.get("city") ?? "",
    country: formData.get("country") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };
  if (!birthDateOk(parsed.data.birthDate)) return { error: "18 yaşından küçükler hesap bilgilerini dolduramaz." };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      gender: parsed.data.gender || null,
      birthDate: parsed.data.birthDate ? new Date(`${parsed.data.birthDate}T00:00:00Z`) : null,
      city: parsed.data.city || null,
      country: parsed.data.country || null,
    },
  });
  revalidatePath("/profil");
  return { ok: true };
}

export async function uploadKycAction(_prev: ProfileActionState, formData: FormData): Promise<ProfileActionState> {
  const user = await requireUser();
  const side = String(formData.get("side") ?? "");
  if (side !== "FRONT" && side !== "BACK") return { error: "Belge yüzü geçersiz." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Bir dosya seçin." };
  if (file.size > KYC_MAX_BYTES) return { error: "Dosya 5 MB'dan büyük olamaz." };
  if (!KYC_TYPES.includes(file.type)) return { error: "Yalnızca JPG, PNG, WEBP veya PDF yükleyin." };

  const data = Buffer.from(await file.arrayBuffer());
  const fileName = file.name.slice(0, 120);
  await prisma.kycDocument.upsert({
    where: { userId_side: { userId: user.id, side } },
    create: { userId: user.id, side, fileName, mimeType: file.type, data },
    update: { fileName, mimeType: file.type, data, reviewStatus: "PENDING", reviewNote: null },
  });
  revalidatePath("/profil");
  return { ok: true };
}
