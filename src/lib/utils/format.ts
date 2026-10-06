const tryFormatter = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

export function formatPrice(value: number | null, currency = "TRY") {
  if (value == null) return "—";
  const formatted = tryFormatter.format(value);
  return currency === "TRY" ? `₺${formatted}` : `${formatted} ${currency}`;
}

export function formatChangePercent(value: number | null) {
  if (value == null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(iso));
}
