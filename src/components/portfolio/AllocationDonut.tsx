"use client";

import { useTranslations } from "next-intl";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatPrice } from "@/lib/utils/format";
import type { AssetType } from "@prisma/client";

const TYPE_TO_KEY: Partial<Record<AssetType, "stocks" | "funds" | "fx" | "commodities" | "crypto" | "other">> = {
  STOCK: "stocks",
  FUND: "funds",
  CURRENCY: "fx",
  COMMODITY: "commodities",
  CRYPTO: "crypto",
  INDEX: "other",
  INTEREST_PRODUCT: "other",
  CUSTOM: "other",
};

const COLORS = [
  "var(--color-brand)",
  "var(--color-accent)",
  "var(--color-positive)",
  "#a78bfa",
  "var(--color-negative)",
  "var(--color-fg-subtle)",
];

interface AllocationDonutProps {
  cash: number;
  byType: Partial<Record<AssetType, number>>;
}

export function AllocationDonut({ cash, byType }: AllocationDonutProps) {
  const t = useTranslations("portfolio.allocation");

  const grouped = new Map<string, number>();
  if (cash > 0) grouped.set("cash", cash);
  for (const [type, value] of Object.entries(byType)) {
    if (!value) continue;
    const key = TYPE_TO_KEY[type as AssetType] ?? "other";
    grouped.set(key, (grouped.get(key) ?? 0) + value);
  }

  const total = [...grouped.values()].reduce((a, b) => a + b, 0);
  const data = [...grouped.entries()]
    .map(([key, value]) => ({ key, label: t(key), value }))
    .sort((a, b) => b.value - a.value);

  if (total <= 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="h-44 w-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="68%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((entry, i) => (
                <Cell key={entry.key} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatPrice(Number(value))}
              contentStyle={{
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex w-full flex-col gap-1.5">
        {data.map((entry, i) => (
          <li key={entry.key} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <span className="text-muted">{entry.label}</span>
            <span className="num-tabular ml-auto font-semibold">
              {((entry.value / total) * 100).toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
