import { getTranslations } from "next-intl/server";
import { Newspaper, Clock, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma/client";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Link } from "@/i18n/navigation";
import { formatDateTime } from "@/lib/utils/format";
import type { NewsCategory } from "@prisma/client";

const FILTERS: { key: string; label: string; categories: NewsCategory[] | null }[] = [
  { key: "all", label: "Tümü", categories: null },
  { key: "bist", label: "BIST", categories: ["BORSA", "SIRKET_HABERLERI", "HALKA_ARZ", "TEMETTU", "KAP"] },
  { key: "dunya", label: "Dünya", categories: ["DUNYA"] },
  { key: "emtia", label: "Emtia", categories: ["EMTIA", "ALTIN"] },
  { key: "forex", label: "Döviz", categories: ["DOVIZ"] },
];

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const t = await getTranslations("news");
  const { cat } = await searchParams;
  const active = FILTERS.find((f) => f.key === cat) ?? FILTERS[0];

  const articles = await prisma.newsArticle.findMany({
    where: {
      isApproved: true,
      isHidden: false,
      ...(active.categories ? { category: { in: active.categories } } : {}),
    },
    include: { source: true },
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
    take: 40,
  });

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <h1 className="text-xl font-bold">{t("title")}</h1>

      <nav className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={{ pathname: "/haberler", query: f.key === "all" ? {} : { cat: f.key } }}
            className={
              f.key === active.key
                ? "rounded-full bg-foreground px-3.5 py-1.5 text-sm font-semibold text-background"
                : "rounded-full bg-surface-2 px-3.5 py-1.5 text-sm font-medium text-muted hover:text-foreground"
            }
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {articles.length === 0 ? (
        <Card>
          <EmptyState
            icon={Newspaper}
            title="Bu kategoride henüz haber yok"
            description="Yayınlanan haberler yönetim panelinden eklenir."
          />
        </Card>
      ) : (
        articles.map((a) => (
          <Card key={a.id} className="flex flex-col gap-2">
            {a.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- admin-provided external image
              <img src={a.imageUrl} alt="" className="h-44 w-full rounded-xl object-cover" />
            )}
            <div className="text-xs font-semibold uppercase tracking-wide text-brand">{a.category}</div>
            <h2 className="text-base font-semibold leading-snug">{a.title}</h2>
            {a.summary && <p className="text-sm text-muted">{a.summary}</p>}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
              <span>{a.source.name}</span>
              <span className="inline-flex items-center gap-1">
                <Clock size={12} /> {formatDateTime(a.publishedAt.toISOString())}
              </span>
              <a
                href={a.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex items-center gap-1 font-semibold text-brand"
              >
                Kaynağa git <ExternalLink size={12} />
              </a>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
