import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentUser, ADMIN_ROLES } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { Card } from "@/components/ui/Card";
import { NewsCreateForm, ToggleButton } from "@/components/admin/ContentForms";
import { toggleNewsArticleAction } from "@/lib/admin/content-actions";
import { formatDateTime } from "@/lib/utils/format";

export default async function AdminNewsPage() {
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user) return redirect({ href: "/giris", locale });
  const isAdmin = user.roles?.some((r) => ADMIN_ROLES.includes(r as (typeof ADMIN_ROLES)[number]));
  if (!isAdmin) return redirect({ href: "/", locale });

  const articles = await prisma.newsArticle.findMany({
    include: { source: true },
    orderBy: { publishedAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
      <h1 className="text-xl font-bold">Haber Yönetimi</h1>

      <Card>
        <h2 className="mb-3 text-sm font-semibold">Yeni haber yayınla</h2>
        <NewsCreateForm />
      </Card>

      <div className="flex flex-col gap-2">
        {articles.map((a) => (
          <Card key={a.id} className="flex flex-col gap-2 py-3">
            <div className="text-sm font-semibold">{a.title}</div>
            <div className="text-xs text-muted">
              {a.source.name} · {a.category} · {formatDateTime(a.publishedAt.toISOString())}
              {a.isHidden ? " · Gizli" : ""}
              {a.isFeatured ? " · Öne çıkan" : ""}
            </div>
            <div className="flex gap-2">
              <ToggleButton
                label={a.isFeatured ? "Öne çıkarmayı kaldır" : "Öne çıkar"}
                run={toggleNewsArticleAction.bind(null, a.id, "isFeatured")}
              />
              <ToggleButton
                label={a.isHidden ? "Göster" : "Gizle"}
                run={toggleNewsArticleAction.bind(null, a.id, "isHidden")}
              />
            </div>
          </Card>
        ))}
        {articles.length === 0 && (
          <Card>
            <p className="text-sm text-muted">Henüz haber yok.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
