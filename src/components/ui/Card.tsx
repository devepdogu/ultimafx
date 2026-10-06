import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Hover elevation + border highlight — use when the card is a link/button target. */
  interactive?: boolean;
  /** Raises the card a layer (surface-2, shadow-md) — use for hero/summary cards. */
  elevated?: boolean;
}

export function Card({ className, interactive, elevated, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all duration-200",
        elevated && "card-sheen bg-surface-2 shadow-md",
        interactive &&
          "cursor-pointer hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md active:translate-y-0",
        className
      )}
      {...props}
    />
  );
}
