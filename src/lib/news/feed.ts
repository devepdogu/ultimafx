import "server-only";
import type { NewsCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";

export interface NewsItem {
  id: string;
  title: string;
  category: string;
  source: string;
  publishedAt: number;
  timeLabel: string;
  image: string | null;
  link: string;
}

/** Tab keys shown on the news page, for each database category. */
const TAB_FOR_CATEGORY: Record<NewsCategory, string> = {
  BORSA: "BIST",
  SIRKET_HABERLERI: "BIST",
  HALKA_ARZ: "BIST",
  TEMETTU: "BIST",
  SERMAYE_ARTIRIMI: "BIST",
  KAP: "BIST",
  DUNYA: "NASDAQ",
  ALTIN: "EMTIA",
  EMTIA: "EMTIA",
  KRIPTO: "EMTIA",
  EKONOMI: "EKONOMI",
  MERKEZ_BANKALARI: "EKONOMI",
  DOVIZ: "PARITE",
};

const rtf = new Intl.RelativeTimeFormat("tr", { numeric: "auto" });

function relativeTime(unixSeconds: number, now: number): string {
  const diffSec = unixSeconds - now;
  const abs = Math.abs(diffSec);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  for (const [unit, seconds] of units) {
    if (abs >= seconds) return rtf.format(Math.round(diffSec / seconds), unit);
  }
  return rtf.format(0, "minute");
}

/** Published, visible articles from the database, newest first. */
export async function getNewsFeed(): Promise<NewsItem[]> {
  const articles = await prisma.newsArticle.findMany({
    where: { isApproved: true, isHidden: false },
    include: { source: true },
    orderBy: { publishedAt: "desc" },
    take: 200,
  });
  const now = Math.floor(Date.now() / 1000);
  return articles.map((a) => {
    const publishedAt = Math.floor(a.publishedAt.getTime() / 1000);
    return {
      id: a.id,
      title: a.title,
      category: TAB_FOR_CATEGORY[a.category],
      source: a.source.name,
      publishedAt,
      timeLabel: relativeTime(publishedAt, now),
      image: a.imageUrl,
      link: a.originalUrl,
    };
  });
}
