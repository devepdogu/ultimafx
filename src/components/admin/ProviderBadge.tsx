import { cn } from "@/lib/utils/cn";

/**
 * Bank or network badge: the uploaded logo when there is one, otherwise a monogram in the provider's colour.
 * Used in admin lists and in forms so the selected provider is recognisable at a glance.
 */
export function ProviderBadge({
  label,
  color,
  logoUrl,
  size = 36,
  className,
}: {
  label: string;
  color: string;
  logoUrl?: string | null;
  size?: number;
  className?: string;
}) {
  const initials = label
    .split(/[\s·]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded local file
      <img src={logoUrl} alt="" width={size} height={size} className={cn("shrink-0 rounded-lg bg-white object-contain p-1", className)} style={{ width: size, height: size }} />
    );
  }
  return (
    <span
      aria-hidden
      className={cn("flex shrink-0 items-center justify-center rounded-lg text-[11px] font-extrabold text-white", className)}
      style={{ width: size, height: size, background: color }}
    >
      {initials || "?"}
    </span>
  );
}
