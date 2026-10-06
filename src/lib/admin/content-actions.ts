"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { writeAuditLog } from "@/lib/audit/log";

export interface AdminActionResult {
  error?: string;
  success?: string;
}

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || /^https?:\/\//.test(v), { message: "Geçerli bir bağlantı girin" });

const assetSchema = z.object({
  symbol: z.string().trim().min(1).max(20).transform((s) => s.toUpperCase()),
  name: z.string().trim().min(1).max(200),
  type: z.enum(["STOCK", "US_STOCK", "INDEX", "CURRENCY", "COMMODITY", "CRYPTO", "FUND"]),
  currency: z.string().trim().length(3),
  logoUrl: optionalUrl,
  tradingEnabled: z.boolean(),
});

export async function createAssetAction(_prev: AdminActionResult, formData: FormData): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const parsed = assetSchema.safeParse({
    symbol: formData.get("symbol"),
    name: formData.get("name"),
    type: formData.get("type"),
    currency: formData.get("currency") || "TRY",
    logoUrl: formData.get("logoUrl") ?? "",
    tradingEnabled: formData.get("tradingEnabled") === "on",
  });
  if (!parsed.success) return { error: "Geçersiz alanlar. Sembol, ad ve tür zorunludur." };

  const exists = await prisma.asset.findUnique({ where: { symbol: parsed.data.symbol } });
  if (exists) return { error: "Bu sembol zaten kayıtlı." };

  const asset = await prisma.asset.create({
    data: { ...parsed.data, decimalPrecision: 2, isActive: true, visibility: "PUBLIC" },
  });
  await writeAuditLog({ adminUserId: admin.id, action: "ASSET_CREATED", entityType: "Asset", entityId: asset.id, newValue: parsed.data });
  revalidatePath("/piyasalar");
  return { success: `${asset.symbol} eklendi.` };
}

export async function toggleAssetActiveAction(assetId: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const before = await prisma.asset.findUniqueOrThrow({ where: { id: assetId } });
  const after = await prisma.asset.update({ where: { id: assetId }, data: { isActive: !before.isActive } });
  await writeAuditLog({
    adminUserId: admin.id,
    action: "ASSET_UPDATED",
    entityType: "Asset",
    entityId: assetId,
    oldValue: { isActive: before.isActive },
    newValue: { isActive: after.isActive },
  });
  revalidatePath("/piyasalar");
  return { success: after.isActive ? "Aktifleştirildi." : "Pasifleştirildi." };
}

const newsSchema = z.object({
  title: z.string().trim().min(3).max(300),
  summary: z.string().trim().max(1000).transform((v) => v || null),
  imageUrl: optionalUrl,
  originalUrl: z.string().trim().url(),
  category: z.enum([
    "BORSA", "EKONOMI", "SIRKET_HABERLERI", "DUNYA", "DOVIZ", "ALTIN", "KRIPTO", "EMTIA",
    "MERKEZ_BANKALARI", "HALKA_ARZ", "SERMAYE_ARTIRIMI", "TEMETTU", "KAP",
  ]),
  sourceName: z.string().trim().min(2).max(100),
  publishedAt: z.coerce.date(),
});

export async function createNewsArticleAction(_prev: AdminActionResult, formData: FormData): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const parsed = newsSchema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary") ?? "",
    imageUrl: formData.get("imageUrl") ?? "",
    originalUrl: formData.get("originalUrl"),
    category: formData.get("category"),
    sourceName: formData.get("sourceName"),
    publishedAt: formData.get("publishedAt") || new Date().toISOString(),
  });
  if (!parsed.success) return { error: "Geçersiz haber alanları. Başlık, kaynak adı ve kaynak bağlantısı zorunludur." };

  const { sourceName, ...data } = parsed.data;
  const source = await prisma.newsSource.upsert({
    where: { name: sourceName },
    update: {},
    create: { name: sourceName, url: data.originalUrl },
  });
  const article = await prisma.newsArticle.create({
    data: { ...data, sourceId: source.id, isApproved: true },
  });
  await writeAuditLog({ adminUserId: admin.id, action: "NEWS_PUBLISHED", entityType: "NewsArticle", entityId: article.id, newValue: { title: article.title } });
  revalidatePath("/haberler");
  return { success: "Haber yayınlandı." };
}

export async function toggleNewsArticleAction(articleId: string, field: "isFeatured" | "isHidden"): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const before = await prisma.newsArticle.findUniqueOrThrow({ where: { id: articleId } });
  const next = !before[field];
  await prisma.newsArticle.update({ where: { id: articleId }, data: { [field]: next } });
  await writeAuditLog({
    adminUserId: admin.id,
    action: "NEWS_PUBLISHED",
    entityType: "NewsArticle",
    entityId: articleId,
    oldValue: { [field]: before[field] },
    newValue: { [field]: next },
  });
  revalidatePath("/haberler");
  return { success: "Güncellendi." };
}

const bannerSchema = z.object({
  title: z.string().trim().min(2).max(120),
  subtitle: z.string().trim().max(240).transform((v) => v || null),
  imageUrl: optionalUrl,
  linkUrl: optionalUrl,
  position: z.coerce.number().int().min(0).max(100),
});

export async function createBannerAction(_prev: AdminActionResult, formData: FormData): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const parsed = bannerSchema.safeParse({
    title: formData.get("title"),
    subtitle: formData.get("subtitle") ?? "",
    imageUrl: formData.get("imageUrl") ?? "",
    linkUrl: formData.get("linkUrl") ?? "",
    position: formData.get("position") ?? 0,
  });
  if (!parsed.success) return { error: "Geçersiz banner alanları. Başlık zorunludur." };

  const banner = await prisma.banner.create({ data: parsed.data });
  await writeAuditLog({ adminUserId: admin.id, action: "BANNER_CREATED", entityType: "Banner", entityId: banner.id, newValue: parsed.data });
  revalidatePath("/");
  return { success: "Banner eklendi." };
}

export async function toggleBannerAction(bannerId: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const before = await prisma.banner.findUniqueOrThrow({ where: { id: bannerId } });
  await prisma.banner.update({ where: { id: bannerId }, data: { isActive: !before.isActive } });
  await writeAuditLog({
    adminUserId: admin.id,
    action: "BANNER_UPDATED",
    entityType: "Banner",
    entityId: bannerId,
    oldValue: { isActive: before.isActive },
    newValue: { isActive: !before.isActive },
  });
  revalidatePath("/");
  return { success: "Güncellendi." };
}

const optionalNumber = (min: number, max: number) =>
  z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : Number(v)))
    .refine((v) => v === null || (Number.isFinite(v) && v >= min && v <= max), { message: "Geçersiz sayı" });

const fundSchema = z.object({
  name: z.string().trim().min(2).max(160),
  companyName: z.string().trim().min(2).max(120),
  category: z.string().trim().min(2).max(60),
  description: z.string().trim().max(400).transform((v) => v || null),
  risk: z.coerce.number().int().min(1).max(7),
  unitPrice: optionalNumber(0, 1e9),
  ytdReturn: optionalNumber(-1000, 10000),
  oneYearReturn: optionalNumber(-1000, 10000),
  aum: optionalNumber(0, 1e15),
  investorCount: optionalNumber(0, 1e12),
  position: z.coerce.number().int().min(0).max(1000),
});

export async function createInvestmentFundAction(_prev: AdminActionResult, formData: FormData): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const parsed = fundSchema.safeParse({
    name: formData.get("name"),
    companyName: formData.get("companyName"),
    category: formData.get("category"),
    description: formData.get("description") ?? "",
    risk: formData.get("risk"),
    unitPrice: formData.get("unitPrice") ?? "",
    ytdReturn: formData.get("ytdReturn") ?? "",
    oneYearReturn: formData.get("oneYearReturn") ?? "",
    aum: formData.get("aum") ?? "",
    investorCount: formData.get("investorCount") ?? "",
    position: formData.get("position") ?? 0,
  });
  if (!parsed.success) return { error: "Geçersiz fon alanları. Ad, yönetici, kategori ve risk (1-7) zorunludur." };

  const fund = await prisma.investmentFund.create({
    data: {
      ...parsed.data,
      unitPrice: parsed.data.unitPrice,
      ytdReturn: parsed.data.ytdReturn,
      oneYearReturn: parsed.data.oneYearReturn,
      aum: parsed.data.aum,
      investorCount: parsed.data.investorCount === null ? null : Math.round(parsed.data.investorCount),
    },
  });
  await writeAuditLog({ adminUserId: admin.id, action: "FUND_CREATED", entityType: "InvestmentFund", entityId: fund.id, newValue: { name: fund.name } });
  revalidatePath("/fonlar");
  return { success: "Fon eklendi." };
}

export async function toggleInvestmentFundAction(fundId: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const before = await prisma.investmentFund.findUniqueOrThrow({ where: { id: fundId } });
  await prisma.investmentFund.update({ where: { id: fundId }, data: { isActive: !before.isActive } });
  await writeAuditLog({
    adminUserId: admin.id,
    action: "FUND_UPDATED",
    entityType: "InvestmentFund",
    entityId: fundId,
    oldValue: { isActive: before.isActive },
    newValue: { isActive: !before.isActive },
  });
  revalidatePath("/fonlar");
  return { success: "Güncellendi." };
}
