/**
 * Shared between the server-only leverage engine and client trading UI — kept in its own
 * file (no `server-only` import) specifically so client components can read it without
 * pulling the engine's Prisma/DB code into the browser bundle.
 */
export const MAX_LEVERAGE = 10;
