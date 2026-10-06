"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { DataStatusBadge } from "@/components/ui/DataStatusBadge";
import { AssetIcon } from "@/components/market/AssetIcon";
import { Link } from "@/i18n/navigation";
import { getAssetBasePath } from "@/lib/market-data/asset-routes";
import { formatPrice } from "@/lib/utils/format";
import type { HoldingViewModel } from "@/lib/portfolio/holding-view-model";

function HoldingLink({ holding, children }: { holding: HoldingViewModel; children: React.ReactNode }) {
  const basePath = getAssetBasePath(holding.type);
  if (!basePath) return <>{children}</>;
  return <Link href={`${basePath}/${holding.symbol}`}>{children}</Link>;
}

export function HoldingsList({ holdings }: { holdings: HoldingViewModel[] }) {
  const t = useTranslations("portfolio");
  const [view, setView] = useState<"cards" | "table">("cards");

  return (
    <div className="flex flex-col gap-3">
      <div className="hidden justify-end sm:flex">
        <Tabs
          size="sm"
          value={view}
          onChange={setView}
          options={[
            { value: "cards", label: "Kart" },
            { value: "table", label: "Tablo" },
          ]}
        />
      </div>

      {view === "table" ? (
        <Card className="hidden overflow-x-auto p-0 sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium">{t("holdings")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("averageCost")}</th>
                <th className="px-4 py-3 text-right font-medium">Fiyat</th>
                <th className="px-4 py-3 text-right font-medium">{t("title")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("return")}</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => (
                <tr key={h.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                  <td className="px-4 py-3">
                    <HoldingLink holding={h}>
                      <div className="flex items-center gap-2.5">
                        <AssetIcon symbol={h.symbol} type={h.type} logoUrl={h.logoUrl} size={28} />
                        <div>
                          <div className="font-semibold">{h.symbol}</div>
                          <div className="text-xs text-muted">{h.quantity} adet</div>
                        </div>
                      </div>
                    </HoldingLink>
                  </td>
                  <td className="num-tabular px-4 py-3 text-right">{formatPrice(h.averageCost)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="num-tabular">{formatPrice(h.currentPrice, h.currency)}</div>
                    <div className="mt-0.5 flex justify-end">
                      <DataStatusBadge provenance={h.provenance} />
                    </div>
                  </td>
                  <td className="num-tabular px-4 py-3 text-right font-semibold">
                    {formatPrice(h.marketValue)}
                  </td>
                  <td
                    className={`num-tabular px-4 py-3 text-right font-semibold ${h.pnlAbsolute < 0 ? "text-negative" : "text-positive"}`}
                  >
                    {formatPrice(h.pnlAbsolute)} ({h.pnlPercent.toFixed(2)}%)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : null}

      <div className={`flex flex-col gap-2 ${view === "table" ? "sm:hidden" : ""}`}>
        {holdings.map((h) => (
          <HoldingLink key={h.id} holding={h}>
            <Card interactive>
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <AssetIcon symbol={h.symbol} type={h.type} logoUrl={h.logoUrl} size={32} />
                  <div className="min-w-0">
                    <div className="font-semibold">{h.symbol}</div>
                    <div className="truncate text-xs text-muted">
                      {h.quantity} adet · {t("averageCost")}: {formatPrice(h.averageCost)}
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="num-tabular font-semibold">{formatPrice(h.marketValue)}</div>
                  <div
                    className={`num-tabular text-xs ${h.pnlAbsolute < 0 ? "text-negative" : "text-positive"}`}
                  >
                    {formatPrice(h.pnlAbsolute)} ({h.pnlPercent.toFixed(2)}%)
                  </div>
                </div>
              </div>
            </Card>
          </HoldingLink>
        ))}
      </div>
    </div>
  );
}
