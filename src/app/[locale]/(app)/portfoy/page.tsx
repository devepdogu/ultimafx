import { getTranslations } from "next-intl/server";
import { requireUserForPage } from "@/lib/auth/rbac";
import { getPortfolioSummary } from "@/lib/portfolio/summary";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PortfolioHero } from "@/components/dashboard/PortfolioHero";
import { AllocationDonut } from "@/components/portfolio/AllocationDonut";
import { HoldingsList } from "@/components/portfolio/HoldingsList";
import { toHoldingViewModel } from "@/lib/portfolio/holding-view-model";
import { Briefcase, PieChart as PieChartIcon } from "lucide-react";

export default async function PortfolioPage() {
  const t = await getTranslations("portfolio");
  const tw = await getTranslations("wallet");
  const user = await requireUserForPage();

  const summary = await getPortfolioSummary(user.id);
  const allocationByType: Record<string, number> = {};
  for (const [type, value] of Object.entries(summary.allocation)) {
    allocationByType[type] = value.toNumber();
  }

  return (
    <div className="flex flex-col gap-5 px-4 py-6">
      <h1 className="text-xl font-bold">{t("title")}</h1>

      <PortfolioHero summary={summary} />

      {summary.holdings.length > 0 && (
        <Card>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <PieChartIcon size={15} className="text-muted" /> {t("distribution")}
          </div>
          <AllocationDonut cash={summary.cash.toNumber()} byType={allocationByType} />
        </Card>
      )}

      <div>
        <h2 className="mb-2 text-sm font-semibold text-muted">{t("holdings")}</h2>
        {summary.holdings.length === 0 ? (
          <Card>
            <EmptyState icon={Briefcase} title={tw("noHoldings")} />
          </Card>
        ) : (
          <HoldingsList holdings={summary.holdings.map(toHoldingViewModel)} />
        )}
      </div>
    </div>
  );
}
