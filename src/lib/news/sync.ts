import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { XMLParser } from "fast-xml-parser";
import { z } from "zod";
import type { NewsCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";

/** Public Google News search for Turkish market headlines. No API key needed. */
const RSS_URL =
  "https://news.google.com/rss/search?q=" +
  encodeURIComponent("borsa istanbul OR halka arz OR nasdaq OR altın OR dolar") +
  "&hl=tr&gl=TR&ceid=TR:tr";
const MAX_RSS_ITEMS = 60;

export interface NewsSyncResult {
  added: number;
  checked: number;
  sources: { json: number; rss: number };
}

interface IncomingArticle {
  title: string;
  link: string;
  publishedAt: Date;
  sourceName: string;
  sourceUrl: string | null;
  imageUrl: string | null;
  category: NewsCategory;
}

const jsonSchema = z.object({
  news: z.array(
    z.object({
      title: z.string().min(1),
      category: z.string().min(1),
      source: z.string().min(1),
      published_at: z.number(),
      image: z.string().url().nullable().optional(),
      link: z.string().url(),
    })
  ),
});

/** Keyword rules for headlines without a category (RSS items). Order matters: first match wins. */
function categorize(title: string): NewsCategory {
  const t = title.toLocaleLowerCase("tr-TR");
  if (/halka arz/.test(t)) return "HALKA_ARZ";
  if (/temettü/.test(t)) return "TEMETTU";
  if (/sermaye artır/.test(t)) return "SERMAYE_ARTIRIMI";
  if (/merkez bankası|faiz|tcmb/.test(t)) return "MERKEZ_BANKALARI";
  if (/dolar|euro|parite|kur\b/.test(t)) return "DOVIZ";
  if (/altın|gram|ons|gümüş|petrol|brent|emtia/.test(t)) return "EMTIA";
  if (/kripto|bitcoin|ethereum|usdt/.test(t)) return "KRIPTO";
  if (/nasdaq|s&p|wall street|dow jones|abd/.test(t)) return "DUNYA";
  if (/enflasyon|büyüme|ekonomi/.test(t)) return "EKONOMI";
  return "BORSA";
}

/** Maps the category names used in data/news.json onto the database enum. */
const JSON_CATEGORY: Record<string, NewsCategory> = {
  BIST: "BORSA",
  NASDAQ: "DUNYA",
  EMTIA: "EMTIA",
  EKONOMI: "EKONOMI",
  PARITE: "DOVIZ",
};

async function readJsonNews(): Promise<IncomingArticle[]> {
  let raw: unknown;
  try {
    raw = JSON.parse(await readFile(path.join(process.cwd(), "data", "news.json"), "utf8"));
  } catch {
    return [];
  }
  const parsed = jsonSchema.safeParse(raw);
  if (!parsed.success) return [];
  return parsed.data.news.map((n) => ({
    title: n.title,
    link: n.link,
    publishedAt: new Date(n.published_at * 1000),
    sourceName: n.source,
    sourceUrl: null,
    imageUrl: n.image ?? null,
    category: JSON_CATEGORY[n.category.toUpperCase()] ?? categorize(n.title),
  }));
}

async function readRssNews(): Promise<IncomingArticle[]> {
  const res = await fetch(RSS_URL, {
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
    headers: { "User-Agent": "UltimaFX/1.0" },
  });
  if (!res.ok) throw new Error(`Haber kaynağı ${res.status} döndürdü.`);

  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", textNodeName: "#text" });
  const doc = parser.parse(await res.text());
  const items: Record<string, unknown>[] = [].concat(doc?.rss?.channel?.item ?? []).slice(0, MAX_RSS_ITEMS);

  const out: IncomingArticle[] = [];
  for (const item of items) {
    const link = typeof item.link === "string" ? item.link : "";
    const publishedAt = new Date(String(item.pubDate ?? ""));
    if (!link || Number.isNaN(publishedAt.getTime())) continue;

    const source = item.source as string | { "#text"?: string; "@_url"?: string } | undefined;
    const sourceName = typeof source === "string" ? source : (source?.["#text"] ?? "Google Haberler");
    // Google appends " - Kaynak" to every headline; drop it so the title reads cleanly.
    const rawTitle = String(item.title ?? "");
    const title = rawTitle.endsWith(` - ${sourceName}`) ? rawTitle.slice(0, -(sourceName.length + 3)) : rawTitle;
    if (!title) continue;

    out.push({
      title,
      link,
      publishedAt,
      sourceName,
      sourceUrl: typeof source === "object" ? (source?.["@_url"] ?? null) : null,
      imageUrl: null,
      category: categorize(title),
    });
  }
  return out;
}

/**
 * Pulls news into the database: the local data/news.json list first, then the
 * public RSS feed. Articles are keyed by their original link, so running this
 * repeatedly only adds what is new.
 */
export async function syncNews(): Promise<NewsSyncResult> {
  const [fromJson, fromRss] = await Promise.all([
    readJsonNews(),
    readRssNews().catch((err) => {
      if (err instanceof Error) console.error("[news-sync] RSS failed:", err.message);
      return [] as IncomingArticle[];
    }),
  ]);
  const incoming = [...fromJson, ...fromRss];

  let added = 0;
  for (const item of incoming) {
    const exists = await prisma.newsArticle.findFirst({ where: { originalUrl: item.link }, select: { id: true } });
    if (exists) continue;

    const source = await prisma.newsSource.upsert({
      where: { name: item.sourceName },
      update: {},
      create: { name: item.sourceName, url: item.sourceUrl ?? item.link },
    });
    await prisma.newsArticle.create({
      data: {
        sourceId: source.id,
        title: item.title,
        imageUrl: item.imageUrl,
        category: item.category,
        publishedAt: item.publishedAt,
        originalUrl: item.link,
        isApproved: true,
      },
    });
    added++;
  }

  return { added, checked: incoming.length, sources: { json: fromJson.length, rss: fromRss.length } };
}
