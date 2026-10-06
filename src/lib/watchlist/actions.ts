"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";

async function getOrCreateDefaultWatchlist(userId: string) {
  const existing = await prisma.watchlist.findFirst({
    where: { userId },
    orderBy: { position: "asc" },
  });
  if (existing) return existing;
  return prisma.watchlist.create({ data: { userId, name: "Favorilerim" } });
}

export async function toggleWatchlistItem(assetId: string): Promise<{ isFavorite: boolean }> {
  const user = await requireUser();
  const watchlist = await getOrCreateDefaultWatchlist(user.id);

  const existing = await prisma.watchlistItem.findUnique({
    where: { watchlistId_assetId: { watchlistId: watchlist.id, assetId } },
  });

  if (existing) {
    await prisma.watchlistItem.delete({ where: { id: existing.id } });
    revalidatePath("/");
    return { isFavorite: false };
  }

  await prisma.watchlistItem.create({ data: { watchlistId: watchlist.id, assetId } });
  revalidatePath("/");
  return { isFavorite: true };
}

export async function isAssetFavorited(userId: string, assetId: string): Promise<boolean> {
  const count = await prisma.watchlistItem.count({
    where: { watchlist: { userId }, assetId },
  });
  return count > 0;
}
