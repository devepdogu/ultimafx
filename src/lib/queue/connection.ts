// No `server-only` guard — this connection is used by the standalone worker
// script (src/workers/*), run outside Next's bundler via `tsx`.
import Redis from "ioredis";

// BullMQ requires its own Redis connection with maxRetriesPerRequest: null
// (it manages blocking commands/retries itself) — kept separate from the
// general-purpose cache client in lib/cache/redis.ts.
export const queueConnection = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});
