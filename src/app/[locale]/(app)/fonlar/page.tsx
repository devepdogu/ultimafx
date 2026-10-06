import { prisma } from "@/lib/prisma/client";
import { FundsList, type FundRow } from "@/components/funds/FundsList";

export default async function FundsPage() {
  const funds = await prisma.investmentFund.findMany({
    where: { isActive: true },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  });

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

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <h1 className="text-xl font-bold text-foreground">Yatırım Fonları</h1>
      <FundsList funds={rows} />
    </div>
  );
}
