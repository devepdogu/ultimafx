"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { writeAuditLog } from "@/lib/audit/log";
import type { AdminActionResult } from "./content-actions";

const schema = z.object({
  network: z.string().trim().min(2).max(20),
  address: z.string().trim().min(10).max(200),
  label: z.string().trim().min(2).max(120),
  position: z.coerce.number().int().min(0).max(1000),
});

export async function createCryptoAddressAction(_prev: AdminActionResult, formData: FormData): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const parsed = schema.safeParse({
    network: formData.get("network"),
    address: formData.get("address"),
    label: formData.get("label"),
    position: formData.get("position") ?? 0,
  });
  if (!parsed.success) return { error: "Ağ, adres ve etiket zorunludur." };

  const row = await prisma.cryptoAddress.create({ data: { ...parsed.data, asset: "USDT", isActive: true } });
  await writeAuditLog({ adminUserId: admin.id, action: "CRYPTO_ADDRESS_CREATED", entityType: "CryptoAddress", entityId: row.id, newValue: { network: row.network, label: row.label } });
  revalidatePath("/cuzdan");
  return { success: "Kripto adresi eklendi." };
}

export async function toggleCryptoAddressAction(id: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const before = await prisma.cryptoAddress.findUniqueOrThrow({ where: { id } });
  await prisma.cryptoAddress.update({ where: { id }, data: { isActive: !before.isActive } });
  await writeAuditLog({ adminUserId: admin.id, action: "CRYPTO_ADDRESS_UPDATED", entityType: "CryptoAddress", entityId: id, oldValue: { isActive: before.isActive }, newValue: { isActive: !before.isActive } });
  revalidatePath("/cuzdan");
  return { success: "Güncellendi." };
}
