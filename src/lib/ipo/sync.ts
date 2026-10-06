import "server-only";
import { z } from "zod";
import type { IPOStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";

/**
 * Ultima FX's own IPO list endpoint. It is our backend, so we read it directly.
 * Only structured fields are stored (company, code, price, dates, status) plus a
 * link to the source page. Descriptions and logos from upstream are not copied.
 */
const DEFAULT_IPO_SOURCE = "https://ultimafx.org/api/ipo/list";

const ipoListSchema = z.object({
  ipos: z.array(
    z.object({
      symbol: z.string().trim().min(2).max(12),
      company_name: z.string().trim().min(2),
      sector: z.string().nullable().optional(),
      share_price: z.number().nullable().optional(),
      total_shares: z.number().nullable().optional(),
      total_value: z.number().nullable().optional(),
      start_date: z.string().nullable().optional(),
      end_date: z.string().nullable().optional(),
      first_trade_date: z.string().nullable().optional(),
      demand_ratio: z.number().nullable().optional(),
      application_count: z.number().int().nullable().optional(),
      total_demand: z.number().nullable().optional(),
      intermediary: z.string().nullable().optional(),
      max_lot_per_user: z.number().int().nullable().optional(),
      min_amount_try: z.number().nullable().optional(),
      lot_size: z.number().int().nullable().optional(),
      status: z.string(),
      url: z.string().url().nullable().optional(),
    })
  ),
});

export interface IpoSyncResult {
  created: number;
  updated: number;
  total: number;
}

const toDate = (value: string | null | undefined) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** Upstream statuses: "upcoming" and "closed". Anything unknown is treated as upcoming. */
function mapStatus(status: string): IPOStatus {
  const s = status.toLowerCase();
  if (s === "closed" || s === "completed") return "COMPLETED";
  if (s === "active" || s === "ongoing" || s === "open") return "ACTIVE";
  if (s === "cancelled" || s === "canceled") return "CANCELLED";
  return "UPCOMING";
}

/**
 * Pulls the IPO list and upserts by code. New IPOs are published so the public
 * list is populated; an admin can unpublish any of them. Publish and featured
 * flags on existing rows are never overwritten by a sync.
 */
export async function syncIposFromFeed(): Promise<IpoSyncResult> {
  const url = process.env.IPO_FEED_URL ?? DEFAULT_IPO_SOURCE;

  const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`Halka arz kaynağı ${res.status} döndürdü.`);

  const parsed = ipoListSchema.safeParse(await res.json());
  if (!parsed.success) throw new Error("Halka arz kaynağının biçimi beklenenden farklı.");

  let created = 0;
  let updated = 0;
  for (const ipo of parsed.data.ipos) {
    const price = ipo.share_price ?? null;
    const fields = {
      companyName: ipo.company_name,
      market: ipo.sector || null,
      ipoPriceMin: price,
      ipoPriceMax: price,
      totalOfferingSize: ipo.total_value ?? null,
      numberOfShares: ipo.total_shares ?? null,
      demandCollectionStart: toDate(ipo.start_date),
      demandCollectionEnd: toDate(ipo.end_date),
      expectedListingDate: toDate(ipo.first_trade_date),
      status: mapStatus(ipo.status),
      officialSourceUrl: ipo.url ?? null,
      demandRatio: ipo.demand_ratio ?? null,
      applicationCount: ipo.application_count ?? null,
      totalDemand: ipo.total_demand ?? null,
      intermediary: ipo.intermediary || null,
      maxLotPerUser: ipo.max_lot_per_user ?? null,
      minAmountTry: ipo.min_amount_try ?? null,
      lotSize: ipo.lot_size ?? null,
    };
    const existing = await prisma.iPO.findUnique({ where: { code: ipo.symbol }, select: { id: true } });
    if (existing) {
      await prisma.iPO.update({ where: { id: existing.id }, data: fields });
      updated++;
    } else {
      await prisma.iPO.create({ data: { ...fields, code: ipo.symbol, isPublished: true } });
      created++;
    }
  }

  return { created, updated, total: parsed.data.ipos.length };
}
