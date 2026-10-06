import type { AssetType } from "@prisma/client";

/**
 * Regular trading sessions for exchange-listed assets. Pure and dependency-free
 * so the trading engine (server) and the trade terminal (client) share one rule.
 *
 * Holidays are not modelled yet: on a public holiday the session will still
 * report open on weekdays inside the hours below.
 */
interface Session {
  timeZone: string;
  openMinutes: number;
  closeMinutes: number;
}

const BIST_SESSION: Session = { timeZone: "Europe/Istanbul", openMinutes: 10 * 60, closeMinutes: 18 * 60 };
const NYSE_SESSION: Session = { timeZone: "America/New_York", openMinutes: 9 * 60 + 30, closeMinutes: 16 * 60 };

function sessionFor(type: AssetType): Session | null {
  if (type === "STOCK" || type === "INDEX") return BIST_SESSION;
  if (type === "US_STOCK") return NYSE_SESSION;
  // FX, commodities and funds are not gated by an exchange session.
  return null;
}

/** True when this asset type trades on an exchange session (BIST, NYSE). FX, commodities and funds do not. */
export function hasSession(type: AssetType): boolean {
  return sessionFor(type) !== null;
}

/** Returns true when orders for this asset type may be placed at `now`. */
export function isAssetSessionOpen(type: AssetType, now: Date = new Date()): boolean {
  const session = sessionFor(type);
  if (!session) return true;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: session.timeZone,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    weekday: "short",
  }).formatToParts(now);

  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0") % 24;
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const minutesNow = hour * 60 + minute;

  const isWeekday = weekday !== "Sat" && weekday !== "Sun";
  return isWeekday && minutesNow >= session.openMinutes && minutesNow < session.closeMinutes;
}

/** UTC offset in minutes for a zone at `now`, read from Intl so DST is always current. */
function offsetMinutes(now: Date, timeZone: string): number {
  const name = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "shortOffset" })
    .formatToParts(now)
    .find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  const m = name.match(/GMT([+-])(d{1,2})(?::(d{2}))?/);
  if (!m) return 0;
  return (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] ?? 0));
}

const hhmm = (minutes: number) => {
  const wrapped = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(wrapped / 60)).padStart(2, "0")}:${String(wrapped % 60).padStart(2, "0")}`;
};

/** Session hours for an asset type. Foreign exchanges are shown in Türkiye time first, with their local hours. */
export function sessionHoursLabel(type: AssetType, now: Date = new Date()): string | null {
  if (type === "STOCK" || type === "INDEX") return "Pazartesi–Cuma 10:00–18:00 (Türkiye saati)";
  if (type === "US_STOCK") {
    const shift = offsetMinutes(now, "Europe/Istanbul") - offsetMinutes(now, NYSE_SESSION.timeZone);
    const open = hhmm(NYSE_SESSION.openMinutes + shift);
    const close = hhmm(NYSE_SESSION.closeMinutes + shift);
    return `Pazartesi–Cuma ${open}–${close} (Türkiye saati) · New York 09:30–16:00`;
  }
  return null;
}
