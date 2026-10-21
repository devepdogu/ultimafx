import "server-only";
import { prisma } from "@/lib/prisma/client";

export type AuditAction =
  | "PRICE_OVERRIDE_ENABLED"
  | "PRICE_OVERRIDE_DISABLED"
  | "PRICE_UPDATED"
  | "ASSET_CREATED"
  | "ASSET_UPDATED"
  | "NEWS_PUBLISHED"
  | "IPO_UPDATED"
  | "BANK_INFO_UPDATED"
  | "USER_BALANCE_ADJUSTED"
  | "BALANCE_ADJUSTED"
  | "HOLDING_QUANTITY_ADJUSTED"
  | "USER_PASSWORD_RESET"
  | "USER_PASSWORD_VIEWED"
  | "USER_TCKIMLIK_VIEWED"
  | "USER_STATUS_CHANGED"
  | "KYC_APPROVED"
  | "KYC_REJECTED"
  | "DEPOSIT_APPROVED"
  | "DEPOSIT_REJECTED"
  | "WITHDRAWAL_APPROVED"
  | "WITHDRAWAL_REJECTED"
  | "ORDER_CREATED"
  | "ORDER_EXECUTED"
  | "ORDER_CANCELLED"
  | "PRODUCT_CREATED"
  | "DATA_PROVIDER_CHANGED";

export interface WriteAuditLogInput {
  adminUserId?: string | null;
  action: AuditAction | (string & {});
  entityType?: string;
  entityId?: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/** Every sensitive admin action must call this — see section 34. */
export async function writeAuditLog(input: WriteAuditLogInput) {
  await prisma.auditLog.create({
    data: {
      adminUserId: input.adminUserId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      oldValue: input.oldValue === undefined ? undefined : JSON.parse(JSON.stringify(input.oldValue)),
      newValue: input.newValue === undefined ? undefined : JSON.parse(JSON.stringify(input.newValue)),
      ipAddress: input.ipAddress ?? undefined,
      userAgent: input.userAgent ?? undefined,
    },
  });
}
