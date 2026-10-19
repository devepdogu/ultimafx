# syntax=docker/dockerfile:1
#
# Three things are built from this one file (one stage reused by several compose
# services), so there is only one Dockerfile to keep in sync with the app:
#   - `builder` → full node_modules (incl. devDependencies) + generated Prisma client
#     + full source. Used directly by the `migrate` (prisma migrate deploy + seed)
#     and `worker` (BullMQ market-data refresh) services via tsx — both need the
#     Prisma/tsx CLIs, which are devDependencies, not shipped in the slim runner.
#   - `runner`  → the actual production web server: only the Next.js standalone
#     output, static assets and the generated Prisma client. This is the small
#     image the `app` service runs.

FROM node:22-bookworm-slim AS base
# Prisma's query engine needs OpenSSL; ca-certificates for any outbound HTTPS
# calls the app makes itself (Binance/CoinGecko/TCMB/Yahoo market-data providers).
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder
COPY . .
RUN npx prisma generate
# NEXT_TELEMETRY_DISABLED keeps the build quiet and offline-friendly.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- runner: what the `app` compose service actually ships ----------------
FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs

# Next's standalone output already traces the node_modules the server needs,
# but Prisma's generated client + its query-engine binary are notorious for not
# always being picked up by that trace — copied explicitly so `app` never
# silently falls back to a missing-engine error at runtime.
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

RUN mkdir -p ./public/uploads && chown -R nextjs:nodejs ./public/uploads
USER nextjs

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/',r=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
