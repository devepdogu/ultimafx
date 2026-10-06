/**
 * Standalone worker process: `npm run worker`.
 *
 * Processes the "market-data-refresh" BullMQ queue (Redis-backed) on a
 * repeating schedule, pre-warming the quote cache for every tradable asset
 * so user requests almost always hit Redis instead of waiting on an
 * external provider round-trip. This is the concrete example of the
 * "Redis-backed background jobs" architecture the product spec calls for —
 * additional jobs (news, IPO, dividend sync, cache cleanup, notifications)
 * belong here as more real providers come online.
 *
 * Run separately from the Next.js web process (e.g. a second container/
 * process in production), never inside a request handler.
 */
import { Worker } from "bullmq";
import { queueConnection } from "@/lib/queue/connection";
import { MARKET_DATA_REFRESH_QUEUE, scheduleMarketDataRefresh } from "@/lib/queue/market-data-queue";
import { marketDataRegistry } from "@/lib/market-data/registry";
import { prisma } from "@/lib/prisma/client";

async function refreshFxQuotes() {
  const assets = await prisma.asset.findMany({
    where: { type: "CURRENCY", isActive: true },
    select: { symbol: true },
  });
  if (assets.length === 0) return { refreshed: 0 };

  const provider = marketDataRegistry.getProvider("CURRENCY");
  const quotes = await provider.getQuotes(assets.map((a) => a.symbol));
  return { refreshed: quotes.length };
}

const worker = new Worker(
  MARKET_DATA_REFRESH_QUEUE,
  async (job) => {
    if (job.name === "refresh-fx") {
      const result = await refreshFxQuotes();
      console.log(`[worker] refresh-fx: warmed ${result.refreshed} quote(s)`);
      return result;
    }
  },
  { connection: queueConnection }
);

worker.on("failed", (job, err) => {
  console.error(`[worker] job ${job?.id} (${job?.name}) failed:`, err.message);
});

scheduleMarketDataRefresh()
  .then(() => console.log("[worker] market-data-refresh scheduled (every 5 min), listening..."))
  .catch((err) => console.error("[worker] failed to schedule job:", err));
