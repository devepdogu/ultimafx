"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { toggleWatchlistItem } from "@/lib/watchlist/actions";
import { cn } from "@/lib/utils/cn";

export function FavoriteButton({
  assetId,
  initialFavorite,
}: {
  assetId: string;
  initialFavorite: boolean;
}) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Favorilerden kaldır" : "Favorilere ekle"}
      onClick={() => {
        setIsFavorite((v) => !v);
        startTransition(async () => {
          try {
            const result = await toggleWatchlistItem(assetId);
            setIsFavorite(result.isFavorite);
          } catch {
            setIsFavorite((v) => !v);
          }
        });
      }}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 disabled:opacity-60"
    >
      <Star
        size={20}
        className={cn(isFavorite && "fill-brand text-brand")}
        strokeWidth={2}
      />
    </button>
  );
}
