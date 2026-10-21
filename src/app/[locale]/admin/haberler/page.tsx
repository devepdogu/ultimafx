import { prisma } from "@/lib/prisma/client";
import { ToggleButton } from "@/components/admin/ContentForms";
import { NewsEditor } from "@/components/admin/EntityEditors";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminRecord, RecordActions } from "@/components/admin/AdminRecord";
import { AdminEmpty, AdminPageHeader, AdminPanel, StatusPill } from "@/components/admin/AdminUi";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteNewsAction } from "@/lib/admin/entity-actions";
import { refreshNewsAction } from "@/lib/admin/feed-actions";
import { toggleNewsArticleAction } from "@/lib/admin/content-actions";
import { formatDateTime } from "@/lib/utils/format";

export default async function AdminNewsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { q = "", status = "" } = await searchParams;
  const term = q.trim();
  const articles = await prisma.newsArticle.findMany({
    where: {
      ...(term ? { title: { contains: term, mode: "insensitive" } } : {}),
      ...(status === "featured" ? { isFeatured: true } : status === "hidden" ? { isHidden: true } : {}),
    },
    include: { source: true },
    orderBy: { publishedAt: "desc" },
    take: 150,
  });

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <AdminPageHeader
        title="Haberler"
        description="Haber akışı. Kaynaklardan otomatik çekilir; buradan öne çıkarabilir, gizleyebilir ya da düzenleyebilirsiniz."
        actions={<ToggleButton label="Haberleri güncelle" variant="primary" run={refreshNewsAction} />}
      />

      <AdminPanel title="Yeni haber yayınla" description="Kaynağı ve bağlantıyı mutlaka girin; haber kullanıcıya bu kaynak adıyla görünür.">
        <NewsEditor />
      </AdminPanel>

      <AdminPanel title={`Haberler (${articles.length})`} description="En yeni 150 haber.">
        <AdminFilters
          q={term}
          status={status}
          basePath="/admin/haberler"
          searchPlaceholder="Başlıkta ara"
          statuses={[
            { value: "featured", label: "Öne çıkan" },
            { value: "hidden", label: "Gizli" },
          ]}
        />
        {articles.length === 0 ? (
          <AdminEmpty>Bu filtrelere uyan haber yok.</AdminEmpty>
        ) : (
          <div className="flex flex-col gap-2">
            {articles.map((a) => (
              <AdminRecord
                key={a.id}
                summary={
                  <div className="flex flex-col gap-1">
                    <span className="truncate text-[14px] font-bold">{a.title}</span>
                    <span className="text-[12px] text-muted">
                      {a.source?.name ?? "Kaynak yok"} · {a.category} · {formatDateTime(a.publishedAt.toISOString())}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {a.isFeatured && <StatusPill tone="brand">Öne çıkan</StatusPill>}
                      {a.isHidden && <StatusPill tone="negative">Gizli</StatusPill>}
                      {!a.imageUrl && <StatusPill tone="warning">Görsel eksik</StatusPill>}
                    </div>
                  </div>
                }
                actions={
                  <>
                    <span className="text-[12px] text-muted">Haber kullanıcılara {a.isHidden ? "gösterilmiyor" : "gösteriliyor"}.</span>
                    <RecordActions>
                      <ToggleButton label={a.isFeatured ? "Öne çıkarmayı kaldır" : "Öne çıkar"} run={toggleNewsArticleAction.bind(null, a.id, "isFeatured")} />
                      <ToggleButton label={a.isHidden ? "Göster" : "Gizle"} run={toggleNewsArticleAction.bind(null, a.id, "isHidden")} />
                      <DeleteButton label="Sil" confirmText="Bu haber kalıcı olarak silinecek. Emin misiniz?" run={deleteNewsAction.bind(null, a.id)} />
                    </RecordActions>
                  </>
                }
              >
                <NewsEditor
                  news={{
                    id: a.id,
                    title: a.title,
                    summary: a.summary,
                    originalUrl: a.originalUrl,
                    category: a.category,
                    imageUrl: a.imageUrl,
                    sourceName: a.source?.name ?? "",
                    publishedAt: a.publishedAt.toISOString(),
                  }}
                />
              </AdminRecord>
            ))}
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
