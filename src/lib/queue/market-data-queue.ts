// No `server-only` guard — used by both the Next.js server (to schedule the
// job) and the standalone worker script (to process it).
import { Queue } from "bullmq";
import { queueConnection } from "./connection";

export const MARKET_DATA_REFRESH_QUEUE = "market-data-refresh";

export const marketDataQueue = new Queue(MARKET_DATA_REFRESH_QUEUE, {
  connection: queueConnection,
});

/**
 * Schedules the repeating cache pre-warm job via BullMQ's job scheduler.
 * Safe to call multiple times — upserting by `jobSchedulerId` replaces any
 * existing schedule rather than creating duplicates.
 *
 * This is the concrete example of the "Redis-backed background jobs"
 * architecture required by the product spec: as more real providers come
 * online (news, IPO, dividends, ...), each gets its own repeatable job here
 * rather than ad-hoc polling from request handlers.
 */
export async function scheduleMarketDataRefresh() {
  await marketDataQueue.upsertJobScheduler(
    "refresh-fx-scheduler",
    { every: 5 * 60 * 1000 }, // every 5 minutes
    {
      name: "refresh-fx",
      opts: { removeOnComplete: 10, removeOnFail: 10 },
    }
  );
  await marketDataQueue.upsertJobScheduler(
    "simulate-manual-prices-scheduler",
    { every: 60 * 1000 }, // every minute, so manual-override assets visibly move
    {
      name: "simulate-manual-prices",
      opts: { removeOnComplete: 10, removeOnFail: 10 },
    }
  );
  await marketDataQueue.upsertJobScheduler(
    "evaluate-leveraged-positions-scheduler",
    { every: 15 * 1000 }, // margin can erode fast under high leverage — check often
    {
      name: "evaluate-leveraged-positions",
      opts: { removeOnComplete: 10, removeOnFail: 10 },
    }
  );
}
