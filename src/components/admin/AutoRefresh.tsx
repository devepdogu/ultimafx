"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

/** Re-fetches the current server page on an interval — used where the page shows a live number
 * (price, P&L) that moves on its own, without the admin needing to reload. */
export function AutoRefresh({ seconds }: { seconds: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);
  return null;
}
