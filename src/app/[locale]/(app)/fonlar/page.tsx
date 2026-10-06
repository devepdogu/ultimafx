import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/rbac";
import { Link } from "@/i18n/navigation";
import { FundsList, type FundHoldingRow, type FundRow } from "@/components/funds/FundsList";

export default async function FundsPage() {
  const user = await getCurrentUser();

  const [funds, wallet, holdings] = await Promise.all([
    prisma.investmentFund.findMany({
      where: { isActive: true },
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    }),
    user ? prisma.wallet.findUnique({ where: { userId: user.id }, select: { cashBalance: true } }) : null,
    user
      ? prisma.fundHolding.findMany({
          where: { userId: user.id, units: { gt: 0 } },
          include: { fund: { select: { id: true, name: true, category: true, unitPrice: true, currency: true } } },
          orderBy: { createdAt: "asc" },
        })
      : [],
  ]);

  const rows: FundRow[] = funds.map((f) => ({
    id: f.id,
    name: f.name,
    companyName: f.companyName,
    category: f.category,
    description: f.description,
    risk: f.risk,
    unitPrice: f.unitPrice == null ? null : Number(f.unitPrice),
    currency: f.currency,
    ytdReturn: f.ytdReturn == null ? null : Number(f.ytdReturn),
    oneYearReturn: f.oneYearReturn == null ? null : Number(f.oneYearReturn),
    aum: f.aum == null ? null : Number(f.aum),
    investorCount: f.investorCount,
  }));

  const holdingRows: FundHoldingRow[] = holdings.map((h) => ({
    fundId: h.fund.id,
    name: h.fund.name,
    category: h.fund.category,
    units: Number(h.units),
    costTry: Number(h.costTry),
    unitPrice: h.fund.unitPrice == null ? null : Number(h.fund.unitPrice),
    currency: h.fund.currency,
  }));

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-surface-2 px-4 py-4">
        <Link href="/" aria-label="Geri" className="shrink-0 text-foreground">
          <ChevronLeft size={26} />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col items-center text-center">
          <h1 className="text-[18px] font-bold leading-6 text-foreground">Yatırım Fonları</h1>
          <span className="text-[12px] text-muted">SPK lisanslı portföy yönetim şirketleri</span>
        </div>
        <span className="w-[26px] shrink-0" aria-hidden />
      </header>

      <div className="px-4 py-4">
        <FundsList funds={rows} holdings={holdingRows} cash={wallet ? Number(wallet.cashBalance) : user ? 0 : null} />
      </div>
    </div>
  );
}
