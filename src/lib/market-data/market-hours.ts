import "server-only";
import type { AssetType } from "@prisma/client";

function partsAt(at: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    weekday: "short",
  }).formatToParts(at);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  return { minutesOfDay: hour * 60 + minute, isWeekday: !["Sat", "Sun"].includes(weekday) };
}

function isWithinSession(at: Date, timeZone: string, openMinute: number, closeMinute: number): boolean {
  const { minutesOfDay, isWeekday } = partsAt(at, timeZone);
  return isWeekday && minutesOfDay >= openMinute && minutesOfDay < closeMinute;
}

/**
 * Whether a given asset type's market is open at `at` (defaults to now). Used to gate the
 * manual-price simulation — a manual "stock" shouldn't visibly trade overnight/weekends any
 * more than a real one would. These are fixed, publicly known schedules, same reasoning as
 * MarketStatusPill.tsx: safe to compute locally, never sourced from a provider.
 */
export function isMarketOpenAt(type: AssetType, at: Date = new Date()): boolean {
  switch (type) {
    case "CRYPTO":
      return true; // trades 24/7
    case "STOCK":
    case "INDEX":
      return isWithinSession(at, "Europe/Istanbul", 10 * 60, 18 * 60); // BIST: 10:00-18:00 TRT, Mon-Fri
    case "US_STOCK":
      return isWithinSession(at, "America/New_York", 9 * 60 + 30, 16 * 60); // NYSE/Nasdaq: 9:30-16:00 ET, Mon-Fri
    case "CURRENCY":
    case "COMMODITY":
    case "FUND":
    default:
      return partsAt(at, "UTC").isWeekday; // no fixed intraday session modeled; closed only on weekends
  }
}
