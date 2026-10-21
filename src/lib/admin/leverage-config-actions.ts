"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { AssetType } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { writeAuditLog } from "@/lib/audit/log";
import { MAX_LEVERAGE } from "@/lib/trading/leverage-constants";
import type { AdminActionResult } from "./content-actions";

const ASSET_TYPES = ["STOCK", "US_STOCK", "INDEX", "CURRENCY", "COMMODITY", "CRYPTO", "FUND"] as const;

const configSchema = z.object({
  type: z.enum(ASSET_TYPES),
  maxLeverage: z.coerce.number().int().min(1).max(MAX_LEVERAGE),
  contractSize: z.coerce.number().positive(),
  minLot: z.coerce.number().positive(),
  spreadPercent: z.coerce.number().min(0),
  longSwap: z.coerce.number(),
  shortSwap: z.coerce.number(),
});

/** Updates one asset class's leveraged-trading terms. maxLeverage/contractSize/minLot are read
 * by the engine on every open (see leverage-config.ts); spread/swap are stored and editable
 * but not yet applied to pricing/financing. */
export async function updateLeverageConfigAction(_prev: AdminActionResult, formData: FormData): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const parsed = configSchema.safeParse({
    type: formData.get("type"),
    maxLeverage: formData.get("maxLeverage"),
    contractSize: formData.get("contractSize"),
    minLot: formData.get("minLot"),
    spreadPercent: formData.get("spreadPercent"),
    longSwap: formData.get("longSwap"),
    shortSwap: formData.get("shortSwap"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz alanlar." };

  const { type, ...data } = parsed.data;
  const before = await prisma.leverageConfig.findUnique({ where: { type: type as AssetType } });
  await prisma.leverageConfig.upsert({
    where: { type: type as AssetType },
    update: data,
    create: { type: type as AssetType, ...data },
  });

  await writeAuditLog({
    adminUserId: admin.id,
    action: "DATA_PROVIDER_CHANGED",
    entityType: "LeverageConfig",
    entityId: type,
    oldValue: before,
    newValue: data,
  });
  revalidatePath("/admin/kaldirac-yonetimi");
  return { success: "Kaldıraç ayarları kaydedildi." };
}
