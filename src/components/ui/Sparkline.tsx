"use client";

import { useId } from "react";
import { Area, AreaChart, Line, LineChart, ResponsiveContainer, YAxis } from "recharts";

interface SparklineProps {
  data: number[];
  positive?: boolean;
  width?: number;
  height?: number;
  area?: boolean;
  strokeWidth?: number;
}

/** Minimal inline trend line for watchlist/market-overview rows. Purely decorative — no axes/tooltip. */
export function Sparkline({ data, positive = true, width, height = 28, area = false, strokeWidth = 1.75 }: SparklineProps) {
  const gradientId = useId();

  if (data.length < 2) {
    return <div style={{ width: width ?? "100%", height }} className="min-w-0 max-w-full" aria-hidden />;
  }

  const points = data.map((value, index) => ({ index, value }));
  const color = positive ? "var(--color-positive)" : "var(--color-negative)";

  return (
    <div style={{ width: width ?? "100%", height }} className="min-w-0 max-w-full" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        {area ? (
          <AreaChart data={points} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis domain={["dataMin", "dataMax"]} hide />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={strokeWidth}
              fill={`url(#${gradientId})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        ) : (
          <LineChart data={points} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
            <YAxis domain={["dataMin", "dataMax"]} hide />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={strokeWidth}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
