/**
 * Shared between the server-only leverage engine and client trading UI — kept in its own
 * file (no `server-only` import) specifically so client components can read it without
 * pulling the engine's Prisma/DB code into the browser bundle.
 *
 * This is an absolute sanity ceiling only (input validation, admin config form max) — the real,
 * per-asset-class limit an actual trade is checked against is LeverageConfig.maxLeverage (see
 * leverage-config.ts), configured per type on /admin/kaldirac-yonetimi.
 */
export const MAX_LEVERAGE = 1000;
