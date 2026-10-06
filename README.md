# Ultima

Turkish closed-loop investment simulation platform. Real public market data
for reference pricing (TCMB FX today; more providers to follow); all buy/sell
activity is internal/simulated and never reaches a real exchange or broker.

## Stack

Next.js 16 (App Router) · React 19 · Prisma + PostgreSQL · Redis (cache +
BullMQ jobs) · next-intl (tr default, en) · Auth.js (Credentials + RBAC).

## Local setup

```bash
docker compose up -d        # Postgres (5434) + Redis (6380)
cp .env.example .env        # fill in secrets if you changed the defaults
npm install
npm run db:migrate          # applies prisma/migrations
npm run db:seed             # roles, BIST exchange, FX assets, dev admin user
npm run dev                 # http://localhost:3000
```

Run the background worker (cache pre-warming, future sync jobs) separately:

```bash
npm run worker
```

## Architecture notes

- **No fabricated market data.** Every price carries a `DataProvenance`
  (`LIVE` / `DELAYED` / `MANUAL_OVERRIDE` / `CACHED` / `UNAVAILABLE`) and the
  UI renders it — see `src/lib/market-data/`.
- **Market data lives in Redis, not Postgres.** Quotes/history are fetched
  from a `MarketDataProvider` and cache-aside'd in Redis
  (`src/lib/market-data/cached-provider.ts`); Postgres only holds data the
  app owns (ledger, orders, trades, holdings, curated content).
- **Trading is entirely internal.** `src/lib/trading/engine.ts` settles buy/
  sell orders against the app's own `Wallet`/`Holding` ledger with
  `Decimal`-safe math and row-level locking — it never talks to a broker.
- **Wallet is an append-only ledger.** `WalletTransaction` rows are the
  source of truth; `Wallet.cashBalance` is a projection, never mutated
  without a corresponding transaction row.
