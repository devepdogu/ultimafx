"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  AreaSeries,
  CandlestickSeries,
  LineSeries,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { LineChart as LineChartIcon, AlertTriangle, BarChart3, TrendingUp } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils/cn";
import type { ChartPeriod } from "@/lib/market-data/get-history";
import type { PriceBar } from "@/lib/market-data/types";

const PERIODS: ChartPeriod[] = ["1d", "1w", "1m", "3m", "6m", "1y", "5y"];
type ChartKind = "candlestick" | "area" | "line";

function readThemeColors() {
  const styles = getComputedStyle(document.documentElement);
  const get = (name: string) => styles.getPropertyValue(name).trim();
  return {
    fg: get("--color-fg") || "#0f1115",
    muted: get("--color-fg-muted") || "#636b77",
    border: get("--color-border") || "#e2e5ea",
    surface: get("--color-surface") || "#ffffff",
    positive: get("--color-positive") || "#0f9d58",
    negative: get("--color-negative") || "#d93025",
  };
}

interface PriceChartProps {
  symbol: string;
  /** Current (today's) quote volume — shown in the OHLC readout when nothing is hovered. */
  volume?: number | null;
}

export function PriceChart({ symbol, volume }: PriceChartProps) {
  const t = useTranslations("asset.periods");
  const tc = useTranslations("common");
  const [period, setPeriod] = useState<ChartPeriod>("1m");
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | ISeriesApi<"Candlestick"> | ISeriesApi<"Line"> | null>(null);
  const seriesKindRef = useRef<ChartKind | null>(null);
  const [hoverBar, setHoverBar] = useState<PriceBar | null>(null);

  const { data, isLoading, isError } = useQuery<{ bars: PriceBar[] }>({
    queryKey: ["asset-history", symbol, period],
    queryFn: async () => {
      const res = await fetch(`/api/market-data/${symbol}/history?period=${period}`);
      if (!res.ok) throw new Error("HISTORY_FETCH_FAILED");
      return res.json();
    },
    staleTime: 15_000,
    // The header price above this chart re-renders on every page load/navigation, but this
    // query doesn't — without a refetch interval, an admin's manual price push (or a live
    // provider tick) only reaches the chart on a hard reload, while the header already shows it.
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });

  const bars = useMemo(() => data?.bars ?? [], [data]);
  // A provider that only ever gives us a single daily reference rate (TCMB
  // FX) reports open===high===low===close for every bar — a candlestick
  // there would just be a row of flat dashes, so those default to an area
  // line. A provider with real OHLC (Yahoo/BIST) defaults to candlesticks.
  // Either way the viewer can switch manually via the chart-type buttons.
  const hasOHLC = useMemo(() => bars.some((b) => b.high !== b.low), [bars]);
  const [chartType, setChartType] = useState<ChartKind | null>(null);
  const effectiveType: ChartKind = chartType ?? (hasOHLC ? "candlestick" : "area");

  const displayBar = hoverBar ?? bars[bars.length - 1] ?? null;
  const barsRef = useRef<PriceBar[]>(bars);
  useEffect(() => {
    barsRef.current = bars;
  }, [bars]);

  // Create the chart instance once (axes/grid only — the series is managed separately below).
  useEffect(() => {
    if (!containerRef.current) return;
    const colors = readThemeColors();

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { color: "transparent" },
        textColor: colors.muted,
        fontSize: 11,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: colors.border },
      },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, secondsVisible: false },
      crosshair: { horzLine: { labelBackgroundColor: colors.fg }, vertLine: { labelBackgroundColor: colors.fg } },
    });

    chartRef.current = chart;

    chart.subscribeCrosshairMove((param) => {
      if (!param.time) {
        setHoverBar(null);
        return;
      }
      const match = barsRef.current.find(
        (b) => Math.floor(new Date(b.timestamp).getTime() / 1000) === param.time
      );
      setHoverBar(match ?? null);
    });

    const observer = new MutationObserver(() => {
      const c = readThemeColors();
      chart.applyOptions({
        layout: { background: { color: "transparent" }, textColor: c.muted },
        grid: { horzLines: { color: c.border } },
      });
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      seriesKindRef.current = null;
    };
  }, []);

  // Push data into the series whenever it changes, swapping series type if needed.
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || bars.length === 0) return;
    const colors = readThemeColors();
    const isUp = bars[bars.length - 1].close >= bars[0].close;
    const kind = effectiveType;

    if (seriesKindRef.current !== kind) {
      if (seriesRef.current) chart.removeSeries(seriesRef.current);
      seriesRef.current =
        kind === "candlestick"
          ? chart.addSeries(CandlestickSeries, {
            upColor: colors.positive,
            downColor: colors.negative,
            wickUpColor: colors.positive,
            wickDownColor: colors.negative,
            borderVisible: false,
          })
          : kind === "line"
            ? chart.addSeries(LineSeries, { lineWidth: 2, priceLineVisible: false, lastValueVisible: true })
            : chart.addSeries(AreaSeries, {
              lineWidth: 2,
              priceLineVisible: false,
              lastValueVisible: true,
            });
      seriesKindRef.current = kind;
    }

    if (kind === "candlestick") {
      (seriesRef.current as ISeriesApi<"Candlestick">).setData(
        bars.map((bar) => ({
          time: (new Date(bar.timestamp).getTime() / 1000) as UTCTimestamp,
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
        }))
      );
    } else {
      const lineColor = isUp ? colors.positive : colors.negative;
      if (kind === "area") {
        (seriesRef.current as ISeriesApi<"Area">).applyOptions({
          lineColor,
          topColor: isUp ? `${colors.positive}33` : `${colors.negative}33`,
          bottomColor: isUp ? `${colors.positive}00` : `${colors.negative}00`,
        });
      } else {
        (seriesRef.current as ISeriesApi<"Line">).applyOptions({ color: lineColor });
      }
      (seriesRef.current as ISeriesApi<"Area"> | ISeriesApi<"Line">).setData(
        bars.map((bar) => ({
          time: (new Date(bar.timestamp).getTime() / 1000) as UTCTimestamp,
          value: bar.close,
        }))
      );
    }

    chart.timeScale().fitContent();
  }, [bars, effectiveType]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 p-1 bg-surface  border-b border-border w-full">
          {PERIODS.map((pr) => (
            <button
              key={pr}
              type="button"
              onClick={() => setPeriod(pr)}
              className={cn(
                "rounded-sm  text-[12px] w-[30px] h-[30px] transition-colors",
                period === pr ? "bg-surface-2 font-bold text-foreground" : "font-medium text-muted"
              )}
            >
              {t(pr)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-0.5 border-b border-border w-full p-1 pb-2">
          <IconButton
            label="Mum grafik"
            className={cn(effectiveType === "candlestick" && "bg-surface-2 text-foreground")}
            onClick={() => setChartType("candlestick")}
            disabled={!hasOHLC}
          >
            <BarChart3 size={16} />
          </IconButton>
          <IconButton
            label="Alan grafiği"
            className={cn(effectiveType === "area" && "bg-surface-2 text-foreground")}
            onClick={() => setChartType("area")}
          >
            <TrendingUp size={16} />
          </IconButton>
          <IconButton
            label="Çizgi grafik"
            className={cn(effectiveType === "line" && "bg-surface-2 text-foreground")}
            onClick={() => setChartType("line")}
          >
            <LineChartIcon size={16} />
          </IconButton>
        </div>
      </div>

      {displayBar && (
        <div className="num-tabular mb-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 border-b px-2 border-foreground/80 pb-1.5 text-[11px] text-muted">
          <span>
            O <span className="text-foreground font-black">{displayBar.open.toFixed(2)}</span>
          </span>
          <span>
            H <span className="text-foreground font-black">{displayBar.high.toFixed(2)}</span>
          </span>
          <span>
            L <span className="text-foreground font-black">{displayBar.low.toFixed(2)}</span>
          </span>
          <span>
            C <span className="text-foreground font-black">{displayBar.close.toFixed(2)}</span>
          </span>
          <span>
            Hac{" "}
            <span className="text-foreground font-black">
              {(displayBar.volume ?? volume) != null
                ? new Intl.NumberFormat("tr-TR").format(displayBar.volume ?? volume ?? 0)
                : "—"}
            </span>
          </span>
          <span className={cn("mr-auto font-semibold", displayBar.close < displayBar.open ? "text-[#FF4976]" : "text-[#00A651]")}>
            {displayBar.open ? `${(((displayBar.close - displayBar.open) / displayBar.open) * 100).toFixed(2)}%` : "—"}
          </span>
        </div>
      )}

      <div className="relative h-64 w-full sm:h-80">
        {isLoading && <Skeleton className="absolute inset-0" />}

        {!isLoading && isError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <EmptyState icon={AlertTriangle} title={tc("error")} />
          </div>
        )}

        {!isLoading && !isError && bars.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <EmptyState icon={LineChartIcon} title={tc("chartUnavailable")} />
          </div>
        )}

        <div ref={containerRef} className="h-full w-full" />
      </div>
    </div>
  );
}
