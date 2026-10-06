// Note: deliberately no `server-only` import here. This client is used both
// by the Next.js server runtime and by standalone worker scripts
// (src/workers/*) run via `tsx` outside of Next's bundler, where the
// `server-only` package's throw-by-default guard would break at import time.
import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis: Redis | undefined };

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: 2,
    lazyConnect: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

redis.on("error", (err) => {
  // Redis is a cache, not a source of truth — log and keep serving the app
  // (callers fall back to "fetch fresh" / UNAVAILABLE, never crash on this).
  console.error("[redis] connection error:", err.message);
});
