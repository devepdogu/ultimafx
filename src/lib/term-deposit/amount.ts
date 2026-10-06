/** Parses a Turkish or plain decimal amount ("10.000,50" or "10000.50"). Returns NaN when invalid. */
export function parseAmount(raw: string): number {
  let value = raw.trim().replace(/\s/g, "");
  if (value.includes(",")) value = value.replace(/\./g, "").replace(",", ".");
  return /^\d+(\.\d{1,2})?$/.test(value) ? Number(value) : Number.NaN;
}
