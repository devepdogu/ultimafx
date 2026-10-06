import { createHmac } from "node:crypto";

export function isValidTcKimlik(tc: string): boolean {
  if (!/^[1-9]\d{10}$/.test(tc)) return false;
  const d = tc.split("").map(Number);
  const oddSum = d[0] + d[2] + d[4] + d[6] + d[8];
  const evenSum = d[1] + d[3] + d[5] + d[7];
  const tenth = ((oddSum * 7 - evenSum) % 10 + 10) % 10;
  if (tenth !== d[9]) return false;
  const total = d.slice(0, 10).reduce((a, b) => a + b, 0);
  return total % 10 === d[10];
}

/** Phone as E.164 (+90 5XX XXX XXXX). Accepts 10 digits or a +90/0-prefixed number. */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  let local = digits;
  if (local.startsWith("90") && local.length === 12) local = local.slice(2);
  if (local.startsWith("0") && local.length === 11) local = local.slice(1);
  if (!/^5\d{9}$/.test(local)) return null;
  return `+90${local}`;
}

/** TC is stored only as a keyed hash so it can be looked up for login without keeping the plain number. */
export function hashTcKimlik(tc: string): string {
  const key = process.env.AUTH_SECRET ?? "";
  return createHmac("sha256", key).update(`tc:${tc}`).digest("hex");
}
