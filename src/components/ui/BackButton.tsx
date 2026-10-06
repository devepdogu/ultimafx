"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "@/i18n/navigation";

interface BackButtonProps {
  /** Where to go if there's no browser history to go back to (e.g. a direct/shared link). */
  fallbackHref: string;
  label: string;
}

export function BackButton({ fallbackHref, label }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
        } else {
          router.push(fallbackHref);
        }
      }}
      className="mb-4 inline-flex items-center gap-1 rounded-lg py-1 pr-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
    >
      <ChevronLeft size={18} />
      {label}
    </button>
  );
}
