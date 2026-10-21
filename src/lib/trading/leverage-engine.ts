import "server-only";
import { Prisma, type LeveragedPositionCloseReason } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";
import { Decimal } from "@/lib/money/decimal";
import { resolveAssetPrice } from "@/lib/market-data/resolve-price";
import { isAssetSessionOpen, sessionHoursLabel } from "./session";
import { ensureWalletAndPortfolio, lockWallet } from "./engine";
import { MAX_LEVERAGE } from "./leverage-constants";
import {
  AssetNotTradableError,
  InsufficientBalanceError,
  InsufficientUsdBalanceError,
  InvalidLeverageError,
  InvalidQuantityError,
  MarketClosedError,
  PositionAlreadyClosedError,
  PositionNotFoundError,
  PriceUnavailableError,
} from "./errors";

/**
 * Leveraged ("margin"/CFD-style) trading — entirely separate from the spot engine
 * (engine.ts), which models full ownership at 1x via Holding. A leveraged position never
 * touches Holding at all: opening one reserves `margin` out of the user's wallet, closing it
 * (by the user, an admin, or automatic liquidation — see evaluateLeveragedPositions) returns
 * margin ± realized P&L. Still entirely internal — never a real broker.
 *
 * MAX_LEVERAGE lives in leverage-constants.ts (no `server-only`) so client trading UI can read
 * it without pulling this file's Prisma/DB code into the browser bundle.
 */
export { MAX_LEVERAGE };

function notional(quantity: Decimal, price: Decimal, contractSize: Decimal): Decimal {
  return quantity.times(price).times(contractSize);
}

/** Unrealized (or final, at close) P&L for one side/quantity/contractSize at a given price. */
function computePnl(
  side: "BUY" | "SELL",
  quantity: Decimal,
  entryPrice: Decimal,
  currentPrice: Decimal,
  contractSize: Decimal
): Decimal {
  const diff = side === "BUY" ? currentPrice.minus(entryPrice) : entryPrice.minus(currentPrice);
  return diff.times(quantity).times(contractSize);
}

export interface OpenLeveragedPositionInput {
  userId: string;
  assetId: string;
  side: "BUY" | "SELL";
  quantity: Decimal.Value;
  leverage: number;
}

export async function openLeveragedPosition(input: OpenLeveragedPositionInput) {
  const quantity = new Decimal(input.quantity);
  if (quantity.lte(0)) throw InvalidQuantityError();
  if (!Number.isInteger(input.leverage) || input.leverage < 1 || input.leverage > MAX_LEVERAGE) {
    throw InvalidLeverageError(MAX_LEVERAGE);
  }

  const asset = await prisma.asset.findUniqueOrThrow({ where: { id: input.assetId } });
  if (!asset.isActive || !asset.tradingEnabled) throw AssetNotTradableError();
  if (!isAssetSessionOpen(asset.type)) throw MarketClosedError(sessionHoursLabel(asset.type));

  const resolved = await resolveAssetPrice(asset);
  if (resolved.price == null || resolved.provenance === "UNAVAILABLE") throw PriceUnavailableError();
  const price = new Decimal(resolved.price);
  const contractSize = new Decimal(1);
  const margin = notional(quantity, price, contractSize).dividedBy(input.leverage);

  await ensureWalletAndPortfolio(input.userId);

  return prisma.$transaction(async (tx) => {
    const { walletId, cashBalance, usdBalance } = await lockWallet(tx, input.userId);
    const inUsd = asset.currency === "USD";
    const balance = inUsd ? usdBalance : cashBalance;
    if (balance.lt(margin)) throw inUsd ? InsufficientUsdBalanceError() : InsufficientBalanceError();

    const nextBalance = balance.minus(margin).toString();
    await tx.wallet.update({ where: { id: walletId }, data: inUsd ? { usdBalance: nextBalance } : { cashBalance: nextBalance } });

    const position = await tx.leveragedPosition.create({
      data: {
        userId: input.userId,
        assetId: asset.id,
        side: input.side,
        quantity: quantity.toString(),
        leverage: input.leverage,
        contractSize: contractSize.toString(),
        currency: asset.currency,
        entryPrice: price.toString(),
        entryPriceProvenance: resolved.provenance,
        margin: margin.toString(),
      },
      include: { asset: true },
    });

    await tx.walletTransaction.create({
      data: {
        walletId,
        type: "LEVERAGE_OPEN",
        amount: margin.neg().toString(),
        balanceAfter: nextBalance,
        referenceType: "LEVERAGED_POSITION",
        referenceId: position.id,
        description: `Kaldıraçlı pozisyon açıldı: ${asset.symbol} 1:${input.leverage}`,
      },
    });

    return position;
  });
}

async function settleClose(
  tx: Prisma.TransactionClient,
  position: { id: string; userId: string; assetId: string; currency: string; margin: Prisma.Decimal; side: string; quantity: Prisma.Decimal; entryPrice: Prisma.Decimal; contractSize: Prisma.Decimal },
  closePrice: Decimal,
  reason: LeveragedPositionCloseReason
) {
  const { walletId, cashBalance, usdBalance } = await lockWallet(tx, position.userId);
  const inUsd = position.currency === "USD";
  const balance = inUsd ? usdBalance : cashBalance;

  const margin = new Decimal(position.margin.toString());
  const quantity = new Decimal(position.quantity.toString());
  const entryPrice = new Decimal(position.entryPrice.toString());
  const contractSize = new Decimal(position.contractSize.toString());
  const pnl = computePnl(position.side as "BUY" | "SELL", quantity, entryPrice, closePrice, contractSize);
  // Never pays out less than 0 — a loss beyond the margin is the platform's exposure, not a
  // negative balance for the user. evaluateLeveragedPositions liquidates before this can
  // happen in the normal case; this clamp is the defensive floor regardless of how a close
  // was triggered.
  const payout = Decimal.max(0, margin.plus(pnl));

  const nextBalance = balance.plus(payout).toString();
  await tx.wallet.update({ where: { id: walletId }, data: inUsd ? { usdBalance: nextBalance } : { cashBalance: nextBalance } });

  const updated = await tx.leveragedPosition.update({
    where: { id: position.id },
    data: {
      status: "CLOSED",
      closePrice: closePrice.toString(),
      realizedPnl: pnl.toString(),
      closeReason: reason,
      closedAt: new Date(),
    },
    include: { asset: true },
  });

  await tx.walletTransaction.create({
    data: {
      walletId,
      type: "LEVERAGE_CLOSE",
      amount: payout.toString(),
      balanceAfter: nextBalance,
      referenceType: "LEVERAGED_POSITION",
      referenceId: position.id,
      description: `Kaldıraçlı pozisyon kapandı (${reason === "USER" ? "kullanıcı" : reason === "ADMIN" ? "admin" : "likidasyon"}): ${updated.asset.symbol}`,
    },
  });

  return updated;
}

/** Closes one position at the current market price. `expectedUserId` enforces ownership for a
 * user-initiated close; pass null for an admin/worker-initiated close (no ownership check). */
export async function closeLeveragedPosition(positionId: string, reason: LeveragedPositionCloseReason, expectedUserId: string | null) {
  const position = await prisma.leveragedPosition.findUnique({ where: { id: positionId }, include: { asset: true } });
  if (!position) throw PositionNotFoundError();
  if (expectedUserId != null && position.userId !== expectedUserId) throw PositionNotFoundError();
  if (position.status !== "OPEN") throw PositionAlreadyClosedError();

  const resolved = await resolveAssetPrice(position.asset);
  if (resolved.price == null || resolved.provenance === "UNAVAILABLE") throw PriceUnavailableError();
  const closePrice = new Decimal(resolved.price);

  return prisma.$transaction((tx) => settleClose(tx, position, closePrice, reason));
}

/**
 * Background sweep (see market-data-refresh.worker.ts): force-closes any open position whose
 * unrealized loss has consumed its whole margin — the platform's version of a broker's
 * liquidation. Never lets a position ride past this into a negative wallet balance.
 */
export async function evaluateLeveragedPositions(): Promise<{ checked: number; liquidated: number }> {
  const positions = await prisma.leveragedPosition.findMany({ where: { status: "OPEN" }, include: { asset: true } });
  let liquidated = 0;

  for (const position of positions) {
    const resolved = await resolveAssetPrice(position.asset);
    if (resolved.price == null || resolved.provenance === "UNAVAILABLE") continue;

    const currentPrice = new Decimal(resolved.price);
    const margin = new Decimal(position.margin.toString());
    const quantity = new Decimal(position.quantity.toString());
    const entryPrice = new Decimal(position.entryPrice.toString());
    const contractSize = new Decimal(position.contractSize.toString());
    const pnl = computePnl(position.side, quantity, entryPrice, currentPrice, contractSize);

    if (pnl.lte(margin.neg())) {
      try {
        await prisma.$transaction((tx) => settleClose(tx, position, currentPrice, "LIQUIDATION"));
        liquidated++;
      } catch (err) {
        console.error(`[leverage] failed to liquidate position ${position.id}:`, err);
      }
    }
  }

  return { checked: positions.length, liquidated };
}
