import { getTranslations } from "next-intl/server";
import { Rocket } from "lucide-react";
import { prisma } from "@/lib/prisma/client";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Link } from "@/i18n/navigation";
import { formatDateTime } from "@/lib/utils/format";

export default async function IpoListPage() {
  const t = await getTranslations("ipo");
  const ipos = await prisma.iPO.findMany({
    where: { isPublished: true },
    orderBy: [{ isFeatured: "desc" }, { demandCollectionStart: "asc" }],
  });

  const groups = [
    { key: "ACTIVE", title: t("active"), items: ipos.filter((i) => i.status === "ACTIVE") },
    { key: "UPCOMING", title: t("upcoming"), items: ipos.filter((i) => i.status === "UPCOMING") },
    { key: "COMPLETED", title: t("completed"), items: ipos.filter((i) => i.status === "COMPLETED") },
  ];

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      <h1 className="text-xl font-bold">{t("title")}</h1>

      {ipos.length === 0 ? (
        <Card>
          <EmptyState
            icon={Rocket}
            title="Yayında halka arz yok"
            description="Halka arzlar yönetim panelinden yayınlandığında burada listelenir."
          />
        </Card>
      ) : (
        groups
          .filter((g) => g.items.length > 0)
          .map((g) => (
            <section key={g.key} className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-muted">{g.title}</h2>
              {g.items.map((ipo) => (
                <Link key={ipo.id} href={`/halka-arz/${ipo.code}`}>
                  <Card interactive className="flex flex-col gap-1">
                    <div className="text-sm font-semibold">{ipo.companyName}</div>
                    <div className="text-xs text-muted">
                      {ipo.code}
                      {ipo.demandCollectionStart &&
                        ` · Talep: ${formatDateTime(ipo.demandCollectionStart.toISOString())}`}
                    </div>
                  </Card>
                </Link>
              ))}
            </section>
          ))
      )}
    </div>
  );
}
