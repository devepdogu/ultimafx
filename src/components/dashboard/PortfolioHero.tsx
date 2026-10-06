import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils/format";
import type { PortfolioSummary } from "@/lib/portfolio/summary";

export async function PortfolioHero({ summary }: { summary: PortfolioSummary }) {
  const t = await getTranslations("portfolio");
  const isNegative = summary.totalPnl.isNegative();

  return (
    <Card elevated className="relative overflow-hidden">
      <div className="label-eyebrow">{t("totalPortfolio")}</div>
      <div className="num-tabular figure-hero mt-1">{formatPrice(summary.totalValue.toNumber())}</div>

      <div
        className={`num-tabular mt-1 inline-flex items-center gap-1 text-sm font-semibold ${
          isNegative ? "text-negative" : "text-positive"
        }`}
      >
        {isNegative ? "" : "+"}
        {formatPrice(summary.totalPnl.toNumber())}
        <span className="text-xs font-medium text-muted">{t("totalGain")}</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-2">
        <div>
          <div className="text-xs text-muted">{t("cash")}</div>
          <div className="num-tabular figure-sm mt-0.5">{formatPrice(summary.cash.toNumber())}</div>
        </div>
        <div>
          <div className="text-xs text-muted">{t("investments")}</div>
          <div className="num-tabular figure-sm mt-0.5">
            {formatPrice(summary.investments.toNumber())}
          </div>
        </div>
      </div>
    </Card>
  );
}
