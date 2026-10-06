// No `server-only` guard — shared with standalone worker scripts (see redis.ts).
import { redis } from "./redis";

/**
 * Generic cache-aside helper for data that can always be re-fetched from an
 * external source (market prices, historical chart ranges, news, ...).
 * Redis is a performance/availability layer here — never the source of
 * truth for anything financial/accounting-related (that stays in Postgres).
 *
 * Fails open: if Redis itself is unreachable, falls through to calling
 * `fetcher` directly rather than breaking the request.
 */
export async function cacheAside<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached != null) return JSON.parse(cached) as T;
  } catch {
    // Redis unavailable — fall through to fetching fresh.
  }

  const value = await fetcher();

  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    // Caching is best-effort; a write failure must not fail the request.
  }

  return value;
}

/** Reads a cached value without triggering a fetch on miss. */
export async function readCache<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get(key);
    return cached != null ? (JSON.parse(cached) as T) : null;
  } catch {
    return null;
  }
}

/** Writes a value with no expiry — used for "last known good" fallbacks. */
export async function writeCacheForever<T>(key: string, value: T): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value));
  } catch {
    // Best-effort.
  }
}
