"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { writeAuditLog } from "@/lib/audit/log";
import { BANK_PRESETS, CRYPTO_NETWORK_PRESETS, IBAN_PATTERN } from "./presets";
import type { AdminActionResult } from "./content-actions";

/** Empty form fields arrive as "", which should mean "not set" rather than an invalid value. */
const blankToNull = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);
const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .transform((v) => v || null)
  .refine((v) => v === null || /^(https?:\/\/|\/)/.test(v), "Bağlantılar https:// ile başlamalı.");
const optionalNumber = z.preprocess(blankToNull, z.coerce.number().nullable());

/** Foreign-key violations (the row is still used elsewhere) get a plain message instead of a stack trace. */
async function deleteOrExplain(run: () => Promise<unknown>, usedMessage: string): Promise<string | null> {
  try {
    await run();
    return null;
  } catch (err) {
    if ((err as { code?: string }).code === "P2003") return usedMessage;
    throw err;
  }
}

function fail(issue: z.ZodIssue | undefined, fallback: string): AdminActionResult {
  return { error: issue?.message ?? fallback };
}

// ---------- Varlıklar ----------

const assetSchema = z.object({
  name: z.string().trim().min(1, "Varlık adı zorunlu.").max(200),
  type: z.enum(["STOCK", "US_STOCK", "INDEX", "CURRENCY", "COMMODITY", "CRYPTO", "FUND"]),
  currency: z.string().trim().length(3, "Para birimi üç harf olmalı."),
  logoUrl: optionalUrl,
  tradingEnabled: z.boolean(),
});

export async function saveAssetAction(_prev: AdminActionResult, formData: FormData): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = assetSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    currency: String(formData.get("currency") ?? "").toUpperCase(),
    logoUrl: formData.get("logoUrl") ?? "",
    tradingEnabled: formData.get("tradingEnabled") === "on",
  });
  if (!parsed.success) return fail(parsed.error.issues[0], "Geçersiz alanlar.");

  if (id) {
    const before = await prisma.asset.findUnique({ where: { id } });
    if (!before) return { error: "Varlık bulunamadı." };
    // The symbol is the price-feed key and is fixed after creation.
    await prisma.asset.update({ where: { id }, data: parsed.data });
    await writeAuditLog({ adminUserId: admin.id, action: "ASSET_UPDATED", entityType: "Asset", entityId: id, oldValue: { name: before.name }, newValue: { name: parsed.data.name } });
    revalidatePath("/piyasalar");
    return { success: "Varlık güncellendi." };
  }

  const symbol = String(formData.get("symbol") ?? "").trim().toUpperCase();
  if (!/^[A-Z0-9.\-=^]{1,20}$/.test(symbol)) return { error: "Sembol 1-20 karakter olmalı (harf, rakam, nokta)." };
  if (await prisma.asset.findUnique({ where: { symbol } })) return { error: "Bu sembol zaten kayıtlı." };
  const created = await prisma.asset.create({ data: { ...parsed.data, symbol, decimalPrecision: 2, isActive: true, visibility: "PUBLIC" } });
  await writeAuditLog({ adminUserId: admin.id, action: "ASSET_CREATED", entityType: "Asset", entityId: created.id, newValue: { symbol } });
  revalidatePath("/piyasalar");
  return { success: `${symbol} eklendi.` };
}

export async function deleteAssetAction(id: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const before = await prisma.asset.findUnique({ where: { id }, select: { symbol: true } });
  if (!before) return { error: "Varlık bulunamadı." };
  const used = await deleteOrExplain(() => prisma.asset.delete({ where: { id } }), "Bu varlığın işlem veya pozisyon kaydı var. Silmek yerine gizleyin.");
  if (used) return { error: used };
  await writeAuditLog({ adminUserId: admin.id, action: "ASSET_DELETED", entityType: "Asset", entityId: id, oldValue: { symbol: before.symbol } });
  revalidatePath("/piyasalar");
  return { success: `${before.symbol} silindi.` };
}

// ---------- Haberler ----------

const CATEGORIES = [
  "BORSA", "EKONOMI", "SIRKET_HABERLERI", "DUNYA", "DOVIZ", "ALTIN", "KRIPTO", "EMTIA",
  "MERKEZ_BANKALARI", "HALKA_ARZ", "SERMAYE_ARTIRIMI", "TEMETTU", "KAP",
] as const;

const newsSchema = z.object({
  title: z.string().trim().min(3, "Başlık en az 3 karakter olmalı.").max(300),
  summary: z.string().trim().max(1000).transform((v) => v || null),
  imageUrl: optionalUrl,
  originalUrl: z.string().trim().url("Kaynak bağlantısı geçerli bir adres olmalı."),
  category: z.enum(CATEGORIES),
  sourceName: z.string().trim().min(2, "Kaynak adı zorunlu.").max(100),
  publishedAt: z.coerce.date(),
});

export async function saveNewsAction(_prev: AdminActionResult, formData: FormData): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = newsSchema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary") ?? "",
    imageUrl: formData.get("imageUrl") ?? "",
    originalUrl: formData.get("originalUrl"),
    category: formData.get("category"),
    sourceName: formData.get("sourceName"),
    publishedAt: formData.get("publishedAt") || new Date().toISOString(),
  });
  if (!parsed.success) return fail(parsed.error.issues[0], "Geçersiz haber alanları.");
  const { sourceName, ...data } = parsed.data;

  const source = await prisma.newsSource.upsert({ where: { name: sourceName }, update: {}, create: { name: sourceName, url: data.originalUrl } });
  if (id) {
    if (!(await prisma.newsArticle.findUnique({ where: { id }, select: { id: true } }))) return { error: "Haber bulunamadı." };
    await prisma.newsArticle.update({ where: { id }, data: { ...data, sourceId: source.id } });
    await writeAuditLog({ adminUserId: admin.id, action: "NEWS_UPDATED", entityType: "NewsArticle", entityId: id, newValue: { title: data.title } });
    revalidatePath("/haberler");
    return { success: "Haber güncellendi." };
  }
  const created = await prisma.newsArticle.create({ data: { ...data, sourceId: source.id, isApproved: true } });
  await writeAuditLog({ adminUserId: admin.id, action: "NEWS_PUBLISHED", entityType: "NewsArticle", entityId: created.id, newValue: { title: created.title } });
  revalidatePath("/haberler");
  return { success: "Haber yayınlandı." };
}

export async function deleteNewsAction(id: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const before = await prisma.newsArticle.findUnique({ where: { id }, select: { title: true } });
  if (!before) return { error: "Haber bulunamadı." };
  await prisma.newsArticle.delete({ where: { id } });
  await writeAuditLog({ adminUserId: admin.id, action: "NEWS_DELETED", entityType: "NewsArticle", entityId: id, oldValue: { title: before.title } });
  revalidatePath("/haberler");
  return { success: "Haber silindi." };
}

// ---------- Halka arz ----------

const IPO_STATUSES = ["UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED"] as const;

const ipoSchema = z.object({
  companyName: z.string().trim().min(2, "Şirket adı zorunlu.").max(200),
  market: z.string().trim().max(100).transform((v) => v || null),
  status: z.enum(IPO_STATUSES),
  ipoPriceMin: optionalNumber,
  ipoPriceMax: optionalNumber,
  demandCollectionStart: z.preprocess(blankToNull, z.coerce.date().nullable()),
  demandCollectionEnd: z.preprocess(blankToNull, z.coerce.date().nullable()),
  officialSourceUrl: optionalUrl,
});

export async function saveIpoAction(_prev: AdminActionResult, formData: FormData): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = ipoSchema.safeParse({
    companyName: formData.get("companyName"),
    market: formData.get("market") ?? "",
    status: formData.get("status"),
    ipoPriceMin: formData.get("ipoPriceMin") ?? "",
    ipoPriceMax: formData.get("ipoPriceMax") ?? "",
    demandCollectionStart: formData.get("demandCollectionStart") ?? "",
    demandCollectionEnd: formData.get("demandCollectionEnd") ?? "",
    officialSourceUrl: formData.get("officialSourceUrl") ?? "",
  });
  if (!parsed.success) return fail(parsed.error.issues[0], "Geçersiz halka arz alanları.");

  if (id) {
    if (!(await prisma.iPO.findUnique({ where: { id }, select: { id: true } }))) return { error: "Halka arz bulunamadı." };
    await prisma.iPO.update({ where: { id }, data: parsed.data });
    await writeAuditLog({ adminUserId: admin.id, action: "IPO_UPDATED", entityType: "IPO", entityId: id, newValue: { companyName: parsed.data.companyName } });
    revalidatePath("/halka-arz");
    return { success: "Halka arz güncellendi." };
  }

  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!/^[A-Z0-9]{3,12}$/.test(code)) return { error: "Kod 3-12 karakter, harf ve rakam olmalı." };
  if (await prisma.iPO.findUnique({ where: { code } })) return { error: "Bu kod zaten kayıtlı." };
  const created = await prisma.iPO.create({ data: { ...parsed.data, code, isPublished: true } });
  await writeAuditLog({ adminUserId: admin.id, action: "IPO_CREATED", entityType: "IPO", entityId: created.id, newValue: { code } });
  revalidatePath("/halka-arz");
  return { success: `${code} eklendi.` };
}

export async function deleteIpoAction(id: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const before = await prisma.iPO.findUnique({ where: { id }, select: { code: true } });
  if (!before) return { error: "Halka arz bulunamadı." };
  await prisma.iPO.delete({ where: { id } });
  await writeAuditLog({ adminUserId: admin.id, action: "IPO_DELETED", entityType: "IPO", entityId: id, oldValue: { code: before.code } });
  revalidatePath("/halka-arz");
  return { success: `${before.code} silindi.` };
}

// ---------- Banka hesapları ----------

const bankSchema = z.object({
  bankName: z.string().refine((v) => BANK_PRESETS.some((b) => b.value === v), "Listeden bir banka seçin."),
  branch: z.string().trim().max(120).transform((v) => v || null),
  iban: z
    .string()
    .transform((v) => v.replace(/\s+/g, "").toUpperCase())
    .pipe(z.string().regex(IBAN_PATTERN, "IBAN TR ile başlamalı ve 26 karakter olmalı.")),
  accountHolder: z.string().trim().min(3, "Hesap sahibi zorunlu.").max(120),
  instructions: z.string().trim().max(500).transform((v) => v || null),
});

export async function saveBankAction(_prev: AdminActionResult, formData: FormData): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = bankSchema.safeParse({
    bankName: formData.get("bankName"),
    branch: formData.get("branch") ?? "",
    iban: formData.get("iban") ?? "",
    accountHolder: formData.get("accountHolder") ?? "",
    instructions: formData.get("instructions") ?? "",
  });
  if (!parsed.success) return fail(parsed.error.issues[0], "Geçersiz banka alanları.");

  if (id) {
    if (!(await prisma.bankAccount.findUnique({ where: { id }, select: { id: true } }))) return { error: "Banka hesabı bulunamadı." };
    await prisma.bankAccount.update({ where: { id }, data: parsed.data });
    await writeAuditLog({ adminUserId: admin.id, action: "BANK_ACCOUNT_UPDATED", entityType: "BankAccount", entityId: id, newValue: { bankName: parsed.data.bankName } });
    revalidatePath("/cuzdan/para-yatir");
    return { success: "Banka hesabı güncellendi." };
  }
  const created = await prisma.bankAccount.create({ data: { ...parsed.data, currency: "TRY", status: "ACTIVE" } });
  await writeAuditLog({ adminUserId: admin.id, action: "BANK_ACCOUNT_CREATED", entityType: "BankAccount", entityId: created.id, newValue: { bankName: created.bankName, iban: created.iban } });
  revalidatePath("/cuzdan/para-yatir");
  return { success: "Banka hesabı eklendi." };
}

export async function deleteBankAction(id: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const before = await prisma.bankAccount.findUnique({ where: { id }, select: { bankName: true, iban: true } });
  if (!before) return { error: "Banka hesabı bulunamadı." };
  const used = await deleteOrExplain(() => prisma.bankAccount.delete({ where: { id } }), "Bu hesaba bağlı para yatırma talepleri var. Silmek yerine pasife alın.");
  if (used) return { error: used };
  await writeAuditLog({ adminUserId: admin.id, action: "BANK_ACCOUNT_DELETED", entityType: "BankAccount", entityId: id, oldValue: { bankName: before.bankName, iban: before.iban } });
  revalidatePath("/cuzdan/para-yatir");
  return { success: "Banka hesabı silindi." };
}

// ---------- Kripto adresleri ----------

const cryptoSchema = z.object({
  network: z.string().refine((v) => CRYPTO_NETWORK_PRESETS.some((n) => n.value === v), "Listeden bir ağ seçin."),
  label: z.string().trim().min(2, "Etiket zorunlu.").max(120),
  address: z.string().trim().min(10, "Cüzdan adresi zorunlu.").max(200),
  position: z.coerce.number().int().min(0).max(1000),
});

export async function saveCryptoAction(_prev: AdminActionResult, formData: FormData): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = cryptoSchema.safeParse({
    network: formData.get("network"),
    label: formData.get("label"),
    address: formData.get("address"),
    position: formData.get("position") ?? 0,
  });
  if (!parsed.success) return fail(parsed.error.issues[0], "Geçersiz kripto alanları.");

  if (id) {
    if (!(await prisma.cryptoAddress.findUnique({ where: { id }, select: { id: true } }))) return { error: "Adres bulunamadı." };
    await prisma.cryptoAddress.update({ where: { id }, data: parsed.data });
    await writeAuditLog({ adminUserId: admin.id, action: "CRYPTO_ADDRESS_UPDATED", entityType: "CryptoAddress", entityId: id, newValue: { network: parsed.data.network } });
    revalidatePath("/cuzdan/para-yatir");
    return { success: "Kripto adresi güncellendi." };
  }
  const created = await prisma.cryptoAddress.create({ data: { ...parsed.data, asset: "USDT", isActive: true } });
  await writeAuditLog({ adminUserId: admin.id, action: "CRYPTO_ADDRESS_CREATED", entityType: "CryptoAddress", entityId: created.id, newValue: { network: created.network } });
  revalidatePath("/cuzdan/para-yatir");
  return { success: "Kripto adresi eklendi." };
}

export async function deleteCryptoAction(id: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const before = await prisma.cryptoAddress.findUnique({ where: { id }, select: { network: true, address: true } });
  if (!before) return { error: "Adres bulunamadı." };
  const used = await deleteOrExplain(() => prisma.cryptoAddress.delete({ where: { id } }), "Bu adrese bağlı yatırma talepleri var. Silmek yerine pasife alın.");
  if (used) return { error: used };
  await writeAuditLog({ adminUserId: admin.id, action: "CRYPTO_ADDRESS_DELETED", entityType: "CryptoAddress", entityId: id, oldValue: { network: before.network, address: before.address } });
  revalidatePath("/cuzdan/para-yatir");
  return { success: "Kripto adresi silindi." };
}

// ---------- Vadeli mevduat ürünleri ----------

const termSchema = z.object({
  currency: z.enum(["TRY", "USD"]),
  termDays: z.coerce.number().int("Vade tam gün olmalı.").min(1, "Vade en az 1 gün.").max(3650, "Vade en fazla 3650 gün."),
  annualRate: z.coerce.number().min(0, "Faiz negatif olamaz.").max(1000),
  minAmount: z.coerce.number().min(0).max(1e12),
  position: z.coerce.number().int().min(0).max(1000),
});

export async function saveTermProductAction(_prev: AdminActionResult, formData: FormData): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = termSchema.safeParse({
    currency: formData.get("currency"),
    termDays: formData.get("termDays"),
    annualRate: formData.get("annualRate"),
    minAmount: formData.get("minAmount"),
    position: formData.get("position") ?? 0,
  });
  if (!parsed.success) return fail(parsed.error.issues[0], "Geçersiz vadeli mevduat alanları.");

  if (id) {
    if (!(await prisma.termDepositProduct.findUnique({ where: { id }, select: { id: true } }))) return { error: "Ürün bulunamadı." };
    await prisma.termDepositProduct.update({ where: { id }, data: parsed.data });
    await writeAuditLog({ adminUserId: admin.id, action: "TERM_DEPOSIT_UPDATED", entityType: "TermDepositProduct", entityId: id, newValue: parsed.data });
    revalidatePath("/cuzdan/vadeli-mevduat");
    return { success: "Ürün güncellendi. Mevcut hesaplar açıldığı koşulla devam eder." };
  }
  const created = await prisma.termDepositProduct.create({ data: { ...parsed.data, isActive: true } });
  await writeAuditLog({ adminUserId: admin.id, action: "TERM_DEPOSIT_CREATED", entityType: "TermDepositProduct", entityId: created.id, newValue: parsed.data });
  revalidatePath("/cuzdan/vadeli-mevduat");
  return { success: "Vadeli mevduat ürünü eklendi." };
}

export async function deleteTermProductAction(id: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const before = await prisma.termDepositProduct.findUnique({ where: { id }, select: { termDays: true, currency: true } });
  if (!before) return { error: "Ürün bulunamadı." };
  const used = await deleteOrExplain(() => prisma.termDepositProduct.delete({ where: { id } }), "Bu ürünle açılmış hesaplar var. Silmek yerine satışı durdurun.");
  if (used) return { error: used };
  await writeAuditLog({ adminUserId: admin.id, action: "TERM_DEPOSIT_DELETED", entityType: "TermDepositProduct", entityId: id, oldValue: before });
  revalidatePath("/cuzdan/vadeli-mevduat");
  return { success: "Ürün silindi." };
}
