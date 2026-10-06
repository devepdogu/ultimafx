"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

/** Quote refresh cadence. Matches the server-side quote TTL, so each tick can pick up a new price. */
const REFRESH_MS = 15_000;

/**
 * Re-renders the current route's server components every 15 seconds so prices
 * stay live. Client state survives router.refresh(), and the server reads come
 * from the Redis-backed quote cache, so a tick is cheap. Paused while the tab is hidden.
 */
export function AutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [router]);

  return null;
}
