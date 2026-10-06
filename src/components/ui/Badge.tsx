import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

type Tone = "neutral" | "positive" | "negative" | "warning" | "brand" | "accent";

const TONE_STYLES: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted",
  positive: "bg-positive-bg text-positive",
  negative: "bg-negative-bg text-negative",
  warning: "bg-brand-bg text-warning",
  brand: "bg-brand-bg text-brand",
  accent: "bg-accent-bg text-accent",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide",
        TONE_STYLES[tone],
        className
      )}
      {...props}
    />
  );
}

/** Maps common request/order status strings to a Badge tone. */
export function statusTone(status: string): Tone {
  switch (status) {
    case "COMPLETED":
    case "APPROVED":
    case "FILLED":
    case "ACTIVE":
      return "positive";
    case "REJECTED":
    case "CANCELLED":
    case "FAILED":
      return "negative";
    case "PENDING":
      return "warning";
    default:
      return "neutral";
  }
}
