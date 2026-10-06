import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { getPortfolioSummary } from "@/lib/portfolio/summary";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Link } from "@/i18n/navigation";
import { MarketCards } from "@/components/dashboard/MarketCards";
import { HomeCategoryList } from "@/components/dashboard/HomeCategoryList";
import { HomeBanners } from "@/components/dashboard/HomeBanners";
import { HomeIpoBanner } from "@/components/dashboard/HomeIpoBanner";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { PortfolioHero } from "@/components/dashboard/PortfolioHero";
import { WatchlistCard } from "@/components/dashboard/WatchlistSection";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { AllocationDonut } from "@/components/portfolio/AllocationDonut";
import { PieChart as PieChartIcon, History } from "lucide-react";

export default async function HomePage() {
  const t = await getTranslations();
  const user = await getCurrentUser();

  const [summary, recentTransactions] = user
    ? await Promise.all([
        getPortfolioSummary(user.id),
        prisma.walletTransaction.findMany({
          where: { wallet: { userId: user.id } },
          orderBy: { createdAt: "desc" },
          take: 6,
        }),
      ])
    : [null, []];

  const allocationByType: Record<string, number> = {};
  if (summary) {
    for (const [type, value] of Object.entries(summary.allocation)) {
      allocationByType[type] = value.toNumber();
    }
  }

  return (
    <div className="flex w-full flex-col gap-5 px-4 pb-6 pt-3.5">
      <div className="flex flex-col gap-5 lg:col-span-2">
        <HomeBanners />
        {user && summary ? (
          <PortfolioHero summary={summary} />
        ) : (
          <div className="flex gap-3">
            <Link
              href="/giris"
              className="flex h-11 flex-1 items-center justify-center rounded-full border border-[#AFBED4] bg-[#EAF1FA] text-sm font-semibold text-[#091628]"
            >
              {t("auth.login")}
            </Link>
            <Link
              href="/kayit"
              className="flex h-11 flex-1 items-center justify-center rounded-full border border-[#284C74] bg-[#0B1F3C] text-sm font-semibold text-white"
            >
              {t("auth.register")}
            </Link>
          </div>
        )}
        <QuickActions />
        <HomeIpoBanner />
        <MarketCards />
        <HomeCategoryList />

        {user && (
          <Card>
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
              <History size={15} className="text-muted" /> {t("wallet.transactionHistory")}
            </div>
            {recentTransactions.length === 0 ? (
              <EmptyState icon={History} title={t("wallet.noTransactions")} />
            ) : (
              <RecentActivity transactions={recentTransactions} />
            )}
          </Card>
        )}
      </div>

      <div className="flex flex-col gap-5">
        {user && summary && summary.holdings.length > 0 && (
          <Card>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <PieChartIcon size={15} className="text-muted" /> {t("portfolio.distribution")}
            </div>
            <AllocationDonut cash={summary.cash.toNumber()} byType={allocationByType} />
          </Card>
        )}

        {user && <WatchlistCard userId={user.id} />}
      </div>
    </div>
  );
}
