import { Coins, Gem, Fuel, Bitcoin, LineChart } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { AssetType } from "@prisma/client";

// Real SVG flags (self-hosted from the `flag-icons` package, not emoji —
// OS/browser emoji flag rendering is inconsistent across platforms and can
// silently fall back to plain two-letter text on some systems/fonts).
const FLAG_CODES: Record<string, string> = {
  USD: "us",
  EUR: "eu",
  GBP: "gb",
  TRY: "tr",
  CHF: "ch",
  JPY: "jp",
};

const MONOGRAM_PALETTE = [
  "bg-[#5b43e0]/15 text-[#5b43e0]",
  "bg-[#0f7ae0]/15 text-[#0f7ae0]",
  "bg-[#0a9d63]/15 text-[#0a9d63]",
  "bg-[#b5790f]/15 text-[#b5790f]",
  "bg-[#c23b8e]/15 text-[#c23b8e]",
  "bg-[#e0352b]/15 text-[#e0352b]",
];

function hashColor(symbol: string): string {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) hash = (hash * 31 + symbol.charCodeAt(i)) >>> 0;
  return MONOGRAM_PALETTE[hash % MONOGRAM_PALETTE.length];
}

interface AssetIconProps {
  symbol: string;
  type: AssetType;
  logoUrl?: string | null;
  size?: number;
  className?: string;
}

export function AssetIcon({ symbol, type, logoUrl, size = 36, className }: AssetIconProps) {
  const dimension = { width: size, height: size };

  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote, admin-curated logos of unknown dimensions
      <img
        src={logoUrl}
        alt=""
        style={dimension}
        className={cn("shrink-0 rounded-full object-contain", className)}
      />
    );
  }

  if (type === "CURRENCY") {
    const base = symbol.slice(0, 3);
    const quote = symbol.slice(3, 6);
    const code = FLAG_CODES[base] ?? FLAG_CODES[quote];
    return (
      <span
        style={dimension}
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2",
          className
        )}
      >
        {code ? (
          // eslint-disable-next-line @next/next/no-img-element -- self-hosted flag SVG, intrinsic size varies
          <img src={`/flags/${code}.svg`} alt="" className="h-full w-full object-cover" />
        ) : (
          <Coins size={size * 0.5} strokeWidth={2} className="text-muted" />
        )}
      </span>
    );
  }

  if (type === "COMMODITY") {
    const isSilver = symbol.includes("GUMUS");
    const isOil = symbol.includes("BRENT");
    const Icon = isOil ? Fuel : isSilver ? Gem : Coins;
    return (
      <span
        style={dimension}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full",
          isSilver ? "bg-surface-3 text-muted" : "bg-brand-bg text-brand",
          className
        )}
      >
        <Icon size={size * 0.52} strokeWidth={2} />
      </span>
    );
  }

  if (type === "INDEX") {
    return (
      <span
        style={dimension}
        className={cn("flex shrink-0 items-center justify-center rounded-full bg-accent-bg text-accent", className)}
      >
        <LineChart size={size * 0.52} strokeWidth={2} />
      </span>
    );
  }

  if (type === "CRYPTO") {
    return (
      <span
        style={dimension}
        className={cn("flex shrink-0 items-center justify-center rounded-full bg-surface-2 text-muted", className)}
      >
        <Bitcoin size={size * 0.52} strokeWidth={2} />
      </span>
    );
  }

  // STOCK and anything else: deterministic colored monogram.
  return (
    <span
      style={dimension}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full text-xs font-bold",
        hashColor(symbol),
        className
      )}
    >
      {symbol.slice(0, 2)}
    </span>
  );
}

