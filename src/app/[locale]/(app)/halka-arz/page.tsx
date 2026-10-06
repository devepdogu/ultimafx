import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma/client";
import { Link } from "@/i18n/navigation";
import { IpoList, type IpoRow } from "@/components/ipo/IpoList";

export default async function IpoListPage({ searchParams }: { searchParams: Promise<{ ipo?: string }> }) {
  const { ipo: requested } = await searchParams;
  const rows = await prisma.iPO.findMany({
    where: { isPublished: true },
    orderBy: [{ isFeatured: "desc" }, { demandCollectionStart: "asc" }],
  });

  // Logos come from our own asset list only; a symbol we don't list shows the code instead.
  const assets = await prisma.asset.findMany({
    where: { symbol: { in: rows.map((r) => r.code) } },
    select: { symbol: true, type: true, logoUrl: true },
  });
  const assetBySymbol = new Map(assets.map((a) => [a.symbol, a]));

  const ipos: IpoRow[] = rows.map((r) => {
    const asset = assetBySymbol.get(r.code);
    return {
      code: r.code,
      companyName: r.companyName,
      market: r.market,
      status: r.status,
      priceMin: r.ipoPriceMin != null ? Number(r.ipoPriceMin) : null,
      priceMax: r.ipoPriceMax != null ? Number(r.ipoPriceMax) : null,
      totalValue: r.totalOfferingSize != null ? Number(r.totalOfferingSize) : null,
      numberOfShares: r.numberOfShares != null ? Number(r.numberOfShares) : null,
      lotSize: r.lotSize,
      demandStart: r.demandCollectionStart?.toISOString() ?? null,
      demandEnd: r.demandCollectionEnd?.toISOString() ?? null,
      listingDate: r.expectedListingDate?.toISOString() ?? null,
      demandRatio: r.demandRatio != null ? Number(r.demandRatio) : null,
      applicationCount: r.applicationCount,
      totalDemand: r.totalDemand != null ? Number(r.totalDemand) : null,
      intermediary: r.intermediary,
      maxLotPerUser: r.maxLotPerUser,
      minAmountTry: r.minAmountTry != null ? Number(r.minAmountTry) : null,
      sourceUrl: r.officialSourceUrl,
      logo: asset ? { type: asset.type, logoUrl: asset.logoUrl } : null,
    };
  });

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-surface-2 px-4 py-4">
        <Link href="/" aria-label="Geri" className="shrink-0 text-foreground">
          <ChevronLeft size={26} />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col items-center text-center">
          <h1 className="text-[18px] font-bold leading-6 text-foreground">Halka Arz</h1>
          <span className="text-[12px] text-muted">BİST Yeni Şirket Hisseleri</span>
        </div>
        <span className="w-[26px] shrink-0" aria-hidden />
      </header>

      <div className="px-4 py-4">
        <IpoList ipos={ipos} initialCode={requested?.toUpperCase() ?? null} />
      </div>
    </div>
  );
}
