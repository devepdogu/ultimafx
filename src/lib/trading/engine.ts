import "server-only";
import { Prisma, type Asset, type Order } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";
import { Decimal, marketValue } from "@/lib/money/decimal";
import { resolveAssetPrice } from "@/lib/market-data/resolve-price";
import type { DataProvenance } from "@/lib/market-data/types";
import { isAssetSessionOpen, sessionHoursLabel } from "./session";
import {
  AssetNotTradableError,
  InsufficientUsdBalanceError,
  MarketClosedError,
  InsufficientBalanceError,
  InsufficientHoldingsError,
  InvalidQuantityError,
  PriceUnavailableError,
  TradingError,
} from "./errors";

/**
 * Settles one order's worth of quantity against the ledger: debits/credits
 * the Wallet, upserts the Holding, and records a Trade + WalletTransaction.
 * Shared by market orders (settled immediately) and limit orders (settled
 * later once their condition is met) so there is exactly one code path that
 * ever moves money — see the closed-loop requirement in the product spec.
 *
 * Caller is responsible for locking the wallet row (`FOR UPDATE`) before
 * invoking this inside a transaction.
 */
async function settleTrade(
  tx: Prisma.TransactionClient,
  params: {
    userId: string;
    walletId: string;
    cashBalance: Decimal;
    usdBalance: Decimal;
    asset: Asset;
    orderId: string;
    side: "BUY" | "SELL";
    quantity: Decimal;
    price: Decimal;
    provenance: DataProvenance;
  }
) {
  const { userId, walletId, cashBalance, usdBalance, asset, orderId, side, quantity, price, provenance } =
    params;
  const total = marketValue(quantity, price, asset.decimalPrecision);

  // An asset is priced and settled in its own currency: USD assets move the USD balance, everything else the TRY balance.
  const inUsd = asset.currency === "USD";
  const balance = inUsd ? usdBalance : cashBalance;

  const portfolio = await tx.portfolio.findUniqueOrThrow({ where: { userId } });
  const holding = await tx.holding.findUnique({
    where: { portfolioId_assetId: { portfolioId: portfolio.id, assetId: asset.id } },
  });

  if (side === "BUY") {
    if (balance.lt(total)) throw inUsd ? InsufficientUsdBalanceError() : InsufficientBalanceError();
  } else {
    const heldQty = holding ? new Decimal(holding.quantity.toString()) : new Decimal(0);
    if (heldQty.lt(quantity)) throw InsufficientHoldingsError();
  }

  const nextBalance = (side === "BUY" ? balance.minus(total) : balance.plus(total)).toString();
  await tx.wallet.update({
    where: { id: walletId },
    data: inUsd ? { usdBalance: nextBalance } : { cashBalance: nextBalance },
  });

  const trade = await tx.trade.create({
    data: {
      orderId,
      userId,
      assetId: asset.id,
      side,
      quantity: quantity.toString(),
      price: price.toString(),
      priceProvenance: provenance,
    },
  });

  await tx.walletTransaction.create({
    data: {
      walletId,
      type: side === "BUY" ? "TRADE_BUY" : "TRADE_SELL",
      amount: (side === "BUY" ? total.neg() : total).toString(),
      balanceAfter: nextBalance,
      referenceType: "TRADE",
      referenceId: trade.id,
      description: `${side === "BUY" ? "Alış" : "Satış"}: ${quantity.toString()} ${asset.symbol}${inUsd ? " (USD)" : ""}`,
    },
  });

  if (side === "BUY") {
    if (holding) {
      const prevQty = new Decimal(holding.quantity.toString());
      const prevCost = new Decimal(holding.averageCost.toString());
      const newQty = prevQty.plus(quantity);
      const newAvgCost = prevQty.times(prevCost).plus(quantity.times(price)).dividedBy(newQty);
      await tx.holding.update({
        where: { id: holding.id },
        data: { quantity: newQty.toString(), averageCost: newAvgCost.toString() },
      });
    } else {
      await tx.holding.create({
        data: {
          portfolioId: portfolio.id,
          assetId: asset.id,
          quantity: quantity.toString(),
          averageCost: price.toString(),
        },
      });
    }
  } else if (holding) {
    const remaining = new Decimal(holding.quantity.toString()).minus(quantity);
    if (remaining.lte(0)) {
      await tx.holding.delete({ where: { id: holding.id } });
    } else {
      await tx.holding.update({ where: { id: holding.id }, data: { quantity: remaining.toString() } });
    }
  }

  return trade;
}

/**
 * Every user is meant to get a Wallet + Portfolio at registration
 * (see registerAction), but accounts provisioned outside that flow — the
 * dev seed admin, anything created directly via Prisma/admin tooling —
 * can end up without one. Lazily provisioning a zero-balance row here
 * (identical to the registration default) is self-healing rather than a
 * ledger integrity risk: it never fabricates a balance, it just creates
 * the container a trade needs to settle into.
 */
export async function ensureWalletAndPortfolio(userId: string) {
  await Promise.all([
    prisma.wallet.upsert({ where: { userId }, update: {}, create: { userId } }),
    prisma.portfolio.upsert({ where: { userId }, update: {}, create: { userId } }),
  ]);
}

export async function lockWallet(tx: Prisma.TransactionClient, userId: string) {
  const rows = await tx.$queryRaw<{ id: string; cashBalance: Prisma.Decimal; usdBalance: Prisma.Decimal }[]>`
    SELECT id, "cashBalance", "usdBalance" FROM "Wallet" WHERE "userId" = ${userId} FOR UPDATE
  `;
  const row = rows[0];
  if (!row) throw new TradingError("Cüzdanınız bulunamadı. Lütfen tekrar deneyin.");
  return {
    walletId: row.id,
    cashBalance: new Decimal(row.cashBalance.toString()),
    usdBalance: new Decimal(row.usdBalance.toString()),
  };
}

export interface MarketOrderInput {
  userId: string;
  assetId: string;
  side: "BUY" | "SELL";
  quantity: Decimal.Value;
}

/**
 * Executes a market order entirely inside the application's own ledger.
 *
 * This NEVER talks to a real exchange or broker — "execution" here means
 * debiting/crediting the user's internal Wallet, updating their internal
 * Holding, and recording Order/Trade/WalletTransaction rows. The user does
 * not own real securities through this path (see the product spec's
 * closed-loop requirement).
 *
 * Wraps the whole thing in one Prisma transaction with a row lock on the
 * wallet to prevent two concurrent orders from double-spending the same
 * balance.
 */
export async function executeMarketOrder(input: MarketOrderInput) {
  const quantity = new Decimal(input.quantity);
  if (quantity.lte(0)) throw InvalidQuantityError();

  const asset = await prisma.asset.findUniqueOrThrow({ where: { id: input.assetId } });
  if (!asset.isActive || !asset.tradingEnabled) throw AssetNotTradableError();
  if (!isAssetSessionOpen(asset.type)) throw MarketClosedError(sessionHoursLabel(asset.type));

  const resolved = await resolveAssetPrice(asset);
  if (resolved.price == null || resolved.provenance === "UNAVAILABLE") {
    throw PriceUnavailableError();
  }
  const price = new Decimal(resolved.price);

  await ensureWalletAndPortfolio(input.userId);

  return prisma.$transaction(async (tx) => {
    const { walletId, cashBalance, usdBalance } = await lockWallet(tx, input.userId);

    const order = await tx.order.create({
      data: {
        userId: input.userId,
        assetId: asset.id,
        side: input.side,
        type: "MARKET",
        quantity: quantity.toString(),
        status: "FILLED",
        filledQuantity: quantity.toString(),
        averageFillPrice: price.toString(),
        referencePrice: price.toString(),
        referencePriceProvenance: resolved.provenance,
        estimatedAmount: marketValue(quantity, price, asset.decimalPrecision).toString(),
      },
    });

    return settleTrade(tx, {
      userId: input.userId,
      walletId,
      cashBalance,
      usdBalance,
      asset,
      orderId: order.id,
      side: input.side,
      quantity,
      price,
      provenance: resolved.provenance,
    });
  });
}

export interface LimitOrderInput {
  userId: string;
  assetId: string;
  side: "BUY" | "SELL";
  quantity: Decimal.Value;
  limitPrice: Decimal.Value;
}

/** Creates a pending (BEKLEMEDE) limit order; it is matched by evaluateLimitOrders(). */
export async function placeLimitOrder(input: LimitOrderInput) {
  const quantity = new Decimal(input.quantity);
  const limitPrice = new Decimal(input.limitPrice);
  if (quantity.lte(0) || limitPrice.lte(0)) throw InvalidQuantityError();

  const asset = await prisma.asset.findUniqueOrThrow({ where: { id: input.assetId } });
  if (!asset.isActive || !asset.tradingEnabled) throw AssetNotTradableError();
  if (!isAssetSessionOpen(asset.type)) throw MarketClosedError(sessionHoursLabel(asset.type));

  const resolved = await resolveAssetPrice(asset);

  await ensureWalletAndPortfolio(input.userId);

  return prisma.order.create({
    data: {
      userId: input.userId,
      assetId: asset.id,
      side: input.side,
      type: "LIMIT",
      quantity: quantity.toString(),
      limitPrice: limitPrice.toString(),
      status: "OPEN",
      referencePrice: resolved.price != null ? resolved.price.toString() : undefined,
      referencePriceProvenance: resolved.provenance,
      estimatedAmount: marketValue(quantity, limitPrice, asset.decimalPrecision).toString(),
    },
  });
}

export async function cancelOrder(userId: string, orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  if (order.userId !== userId) throw new Error("FORBIDDEN");
  if (order.status !== "OPEN" && order.status !== "PENDING") {
    throw new Error("ORDER_NOT_CANCELLABLE");
  }
  await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });
}

async function fillLimitOrder(order: Order & { asset: Asset }, price: Decimal, provenance: DataProvenance) {
  const quantity = new Decimal(order.quantity.toString());

  await prisma.$transaction(async (tx) => {
    const { walletId, cashBalance, usdBalance } = await lockWallet(tx, order.userId);

    await settleTrade(tx, {
      userId: order.userId,
      walletId,
      cashBalance,
      usdBalance,
      asset: order.asset,
      orderId: order.id,
      side: order.side,
      quantity,
      price,
      provenance,
    });

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "FILLED",
        filledQuantity: quantity.toString(),
        averageFillPrice: price.toString(),
      },
    });
  });
}

/**
 * Matches open limit orders against the current reference price and
 * executes the ones whose condition is met. In production this belongs in
 * a scheduled background job (section 41); for now it is invoked
 * opportunistically from the orders/asset pages so limit orders still fill
 * without a queue worker running.
 */
export async function evaluateLimitOrders() {
  const openOrders = await prisma.order.findMany({
    where: { status: "OPEN", type: "LIMIT" },
    include: { asset: true },
  });

  for (const order of openOrders) {
    if (!order.limitPrice) continue;
    const resolved = await resolveAssetPrice(order.asset);
    if (resolved.price == null || resolved.provenance === "UNAVAILABLE") continue;
    const price = new Decimal(resolved.price);
    const limitPrice = new Decimal(order.limitPrice.toString());

    const conditionMet = order.side === "BUY" ? price.lte(limitPrice) : price.gte(limitPrice);
    if (!conditionMet) continue;

    try {
      await fillLimitOrder(order, price, resolved.provenance);
    } catch {
      // Leave the order OPEN; it will be retried on the next evaluation pass.
    }
  }
}
