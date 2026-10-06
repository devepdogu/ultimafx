import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma/client";
import { Card } from "@/components/ui/Card";
import { BackButton } from "@/components/ui/BackButton";
import { formatDateTime, formatPrice } from "@/lib/utils/format";

function fmtRange(min: unknown, max: unknown): string {
  const lo = min == null ? null : Number(min);
  const hi = max == null ? null : Number(max);
  if (lo == null && hi == null) return "—";
  if (lo != null && hi != null && lo !== hi) return `${formatPrice(lo)} – ${formatPrice(hi)}`;
  return formatPrice(lo ?? hi);
}

export default async function IpoDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const t = await getTranslations("ipo");
  const ipo = await prisma.iPO.findUnique({ where: { code: code.toUpperCase() } });
  if (!ipo || !ipo.isPublished) notFound();

  const rows: [string, string][] = [
    [t("ipoPrice"), fmtRange(ipo.ipoPriceMin, ipo.ipoPriceMax)],
    [t("demandCollectionDates"),
      ipo.demandCollectionStart && ipo.demandCollectionEnd
        ? `${formatDateTime(ipo.demandCollectionStart.toISOString())} – ${formatDateTime(ipo.demandCollectionEnd.toISOString())}`
        : "—"],
    [t("allocationMethod"), ipo.allocationMethod ?? "—"],
    [t("totalOfferingSize"), ipo.totalOfferingSize != null ? formatPrice(Number(ipo.totalOfferingSize)) : "—"],
    [t("numberOfShares"), ipo.numberOfShares != null ? new Intl.NumberFormat("tr-TR").format(Number(ipo.numberOfShares)) : "—"],
    [t("expectedListingDate"), ipo.expectedListingDate ? formatDateTime(ipo.expectedListingDate.toISOString()) : "—"],
  ];

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <BackButton fallbackHref="/halka-arz" label={t("title")} />

      <Card elevated className="flex flex-col gap-1">
        <div className="text-xs font-semibold text-brand">{ipo.code}</div>
        <h1 className="text-lg font-bold">{ipo.companyName}</h1>
        {ipo.market && <div className="text-xs text-muted">{ipo.market}</div>}
      </Card>

      <Card className="flex flex-col divide-y divide-border">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4 py-2.5 text-sm">
            <span className="text-muted">{label}</span>
            <span className="num-tabular text-right font-medium">{value}</span>
          </div>
        ))}
      </Card>

      {ipo.officialSourceUrl && (
        <a
          href={ipo.officialSourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-center text-sm font-semibold text-brand"
        >
          {t("officialSource")}
        </a>
      )}
    </div>
  );
}
