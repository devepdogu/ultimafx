"use server";

import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { requireAdmin } from "@/lib/auth/rbac";

export interface UploadResult {
  url?: string;
  error?: string;
}

const MAX_BYTES = 3 * 1024 * 1024;
const TYPES: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

/**
 * Stores an admin-uploaded image under public/uploads and returns its public path.
 * Only PNG, JPG and WEBP up to 3 MB are accepted; file names are random so they cannot be guessed or overwritten.
 */
export async function uploadImageAction(formData: FormData): Promise<UploadResult> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Bir görsel seçin." };
  if (file.size > MAX_BYTES) return { error: "Görsel 3 MB'dan büyük olamaz." };
  const ext = TYPES[file.type];
  if (!ext) return { error: "Yalnızca PNG, JPG veya WEBP yükleyin." };

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const name = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return { url: `/uploads/${name}` };
}
