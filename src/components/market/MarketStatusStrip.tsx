"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * BIST's regular trading session is 10:00–18:00 Europe/Istanbul, Monday–Friday
 * — a fixed, publicly known schedule, not provider-sourced data, so it's safe
 * to compute client-side (see MarketStatusPill for why this never calls
 * MarketDataProvider.getMarketStatus(), which every adapter stubs to a
 * constant "CLOSED").
 */
function computeIsOpen(): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Istanbul",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    weekday: "short",
  }).formatToParts(new Date());

  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const minutesNow = hour * 60 + minute;

  const isWeekday = !["Sat", "Sun"].includes(weekday);
  return isWeekday && minutesNow >= 10 * 60 && minutesNow < 18 * 60;
}

export function useMarketOpen(): boolean {
  return useSyncExternalStore(subscribe, computeIsOpen, getServerSnapshot);
}

function subscribe(callback: () => void) {
  const id = setInterval(callback, 60_000);
  return () => clearInterval(id);
}

function getServerSnapshot() {
  return false;
}

export function MarketStatusStrip({ className }: { className?: string }) {
  const isOpen = useMarketOpen();

  return (
    <div
      className={cn(
        "flex items-center gap-2  px-3 py-1.5 text-[12px]",
        isOpen ? "bg-positive-bg" : "bg-negative-bg",
        className
      )}
    >
      <span className={cn("whitespace-nowrap font-semibold", isOpen ? "text-positive" : "text-negative")}>
        {isOpen ? "Piyasa Açık" : "Piyasa Kapalı"}
      </span>
      <span className="text-muted">|</span>
      <span className="min-w-0 truncate text-muted">İstanbul (UTC+3) • Açılış: Pazartesi–Cuma 10:00–18:00</span>
    </div>
  );
}
