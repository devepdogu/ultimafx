import { ChevronLeft, LogIn } from "lucide-react";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/rbac";
import { Link } from "@/i18n/navigation";
import { IpoList, type IpoRow } from "@/components/ipo/IpoList";

function IpoHeader() {
  return (
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
  );
}

export default async function IpoListPage({ searchParams }: { searchParams: Promise<{ ipo?: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="flex flex-col">
        <IpoHeader />
        <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-muted">
            <LogIn size={26} />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-[16px] font-bold text-foreground">Önce giriş yapın</h2>
            <p className="max-w-xs text-[13px] text-muted">Halka arzları görüntülemek için hesabınıza giriş yapmanız gerekiyor.</p>
          </div>
          <Link href="/giris" className="flex h-12 w-full max-w-xs items-center justify-center rounded-xl bg-brand text-[14px] font-bold text-brand-foreground">
            Giriş yap
          </Link>
        </div>
      </div>
    );
  }

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
      logoUrl: r.logoUrl,
      logo: asset ? { type: asset.type, logoUrl: asset.logoUrl } : null,
    };
  });

  return (
    <div className="flex flex-col">
      <IpoHeader />
      <div className="px-4 py-4">
        <IpoList ipos={ipos} initialCode={requested?.toUpperCase() ?? null} />
      </div>
    </div>
  );
}
