"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";

/**
 * BIST's regular trading session is 10:00–18:00 Europe/Istanbul, Monday–Friday.
 * This is a fixed, publicly known schedule — not provider-sourced data — so it
 * is safe to compute client-side. It intentionally does NOT call
 * MarketDataProvider.getMarketStatus(), which every current adapter stubs to a
 * constant "CLOSED" and would therefore be dishonest to surface as a live signal.
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

function subscribe(callback: () => void) {
  const id = setInterval(callback, 60_000);
  return () => clearInterval(id);
}

function getServerSnapshot() {
  return false;
}

export function MarketStatusPill({ className }: { className?: string }) {
  const t = useTranslations("marketStatus");
  const isOpen = useSyncExternalStore(subscribe, computeIsOpen, getServerSnapshot);

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs",
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isOpen ? "bg-positive animate-pulse" : "bg-subtle"
        )}
      />
      <span className="font-medium text-muted">BIST</span>
      <span className={cn("ml-auto font-semibold", isOpen ? "text-positive" : "text-muted")}>
        {isOpen ? t("open") : t("closed")}
      </span>
    </div>
  );
}
