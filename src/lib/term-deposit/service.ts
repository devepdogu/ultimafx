import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";
import { computeTermInterest } from "./interest";

export class TermDepositError extends Error {}

const round2 = (n: number) => Math.round(n * 100) / 100;

export { computeTermInterest };

type Currency = "TRY" | "USD";

async function lockWallet(tx: Prisma.TransactionClient, userId: string) {
  const rows = await tx.$queryRaw<{ id: string; cashBalance: string; usdBalance: string }[]>`
    SELECT id, "cashBalance", "usdBalance" FROM "Wallet" WHERE "userId" = ${userId} FOR UPDATE
  `;
  const row = rows[0];
  if (!row) throw new TermDepositError("Cüzdanınız bulunamadı. Lütfen tekrar deneyin.");
  return { walletId: row.id, cashBalance: Number(row.cashBalance), usdBalance: Number(row.usdBalance) };
}

/** Column name for a currency's balance, so the same logic serves TRY and USD. */
function balanceOf(wallet: { cashBalance: number; usdBalance: number }, currency: Currency) {
  return currency === "USD" ? wallet.usdBalance : wallet.cashBalance;
}

function balanceField(currency: Currency) {
  return currency === "USD" ? ("usdBalance" as const) : ("cashBalance" as const);
}

/**
 * Credits matured term deposits back to the user's wallet in the account's own
 * currency. Each account is claimed with a conditional update (ACTIVE → MATURED)
 * inside the same transaction as the credit, so running this repeatedly never pays twice.
 */
export async function settleMaturedTermDeposits(userId: string): Promise<void> {
  const due = await prisma.termDepositAccount.findMany({
    where: { userId, status: "ACTIVE", maturesAt: { lte: new Date() } },
    select: { id: true },
  });

  for (const { id } of due) {
    await prisma.$transaction(async (tx) => {
      const claimed = await tx.termDepositAccount.updateMany({
        where: { id, status: "ACTIVE" },
        data: { status: "MATURED", settledAt: new Date() },
      });
      if (claimed.count === 0) return;

      const account = await tx.termDepositAccount.findUniqueOrThrow({ where: { id } });
      const currency = account.currency as Currency;
      const wallet = await lockWallet(tx, userId);
      const payout = round2(Number(account.principal) + Number(account.interest));
      const next = round2(balanceOf(wallet, currency) + payout);

      await tx.wallet.update({ where: { id: wallet.walletId }, data: { [balanceField(currency)]: next.toFixed(6) } });
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.walletId,
          type: "TERM_DEPOSIT_PAYOUT",
          amount: payout.toFixed(6),
          balanceAfter: next.toFixed(6),
          referenceType: "TermDepositAccount",
          referenceId: id,
          description: `Vadeli mevduat vadesi doldu (${account.termDays} gün, ${currency})`,
        },
      });
    });
  }
}

export async function openTermDeposit(userId: string, productId: string, amount: number) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.termDepositProduct.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) throw new TermDepositError("Bu vadeli mevduat ürünü artık kullanılamıyor.");
    const currency = (product.currency === "USD" ? "USD" : "TRY") as Currency;
    if (!Number.isFinite(amount) || amount <= 0) throw new TermDepositError("Geçerli bir tutar girin.");
    if (amount < Number(product.minAmount)) {
      throw new TermDepositError(`Minimum tutar ${formatAmount(Number(product.minAmount), currency)}.`);
    }

    const wallet = await lockWallet(tx, userId);
    const available = balanceOf(wallet, currency);
    if (available < amount) {
      throw new TermDepositError(currency === "USD" ? "Yetersiz dolar bakiyesi. Önce TRY'den dolar alın." : "Yetersiz bakiye.");
    }

    const principal = round2(amount);
    const annualRate = Number(product.annualRate);
    const interest = computeTermInterest(principal, annualRate, product.termDays);
    const maturesAt = new Date(Date.now() + product.termDays * 86_400_000);

    const account = await tx.termDepositAccount.create({
      data: {
        userId,
        productId: product.id,
        currency,
        principal: principal.toFixed(6),
        annualRate: product.annualRate,
        termDays: product.termDays,
        interest: interest.toFixed(6),
        maturesAt,
      },
    });

    const next = round2(available - principal);
    await tx.wallet.update({ where: { id: wallet.walletId }, data: { [balanceField(currency)]: next.toFixed(6) } });
    await tx.walletTransaction.create({
      data: {
        walletId: wallet.walletId,
        type: "TERM_DEPOSIT_OPEN",
        amount: (-principal).toFixed(6),
        balanceAfter: next.toFixed(6),
        referenceType: "TermDepositAccount",
        referenceId: account.id,
        description: `Vadeli mevduat açıldı (${product.termDays} gün, %${annualRate.toFixed(2)}, ${currency})`,
      },
    });
    return account;
  });
}

/**
 * Converts between TRY and USD at `usdTry` (TRY per 1 USD). The rate is supplied by
 * the caller from the live USDTRY quote; this function only moves balances.
 */
export async function convertCurrency(
  userId: string,
  direction: "TRY_TO_USD" | "USD_TO_TRY",
  amount: number,
  usdTry: number
) {
  if (!Number.isFinite(amount) || amount <= 0) throw new TermDepositError("Geçerli bir tutar girin.");
  if (!Number.isFinite(usdTry) || usdTry <= 0) throw new TermDepositError("Kur alınamıyor. Lütfen daha sonra tekrar deneyin.");

  return prisma.$transaction(async (tx) => {
    const wallet = await lockWallet(tx, userId);
    let cashDelta: number;
    let usdDelta: number;
    if (direction === "TRY_TO_USD") {
      if (wallet.cashBalance < amount) throw new TermDepositError("Yetersiz TRY bakiyesi.");
      cashDelta = -round2(amount);
      usdDelta = round2(amount / usdTry);
      if (usdDelta <= 0) throw new TermDepositError("Tutar çok düşük.");
    } else {
      if (wallet.usdBalance < amount) throw new TermDepositError("Yetersiz dolar bakiyesi.");
      usdDelta = -round2(amount);
      cashDelta = round2(amount * usdTry);
    }

    const nextCash = round2(wallet.cashBalance + cashDelta);
    const nextUsd = round2(wallet.usdBalance + usdDelta);
    await tx.wallet.update({
      where: { id: wallet.walletId },
      data: { cashBalance: nextCash.toFixed(6), usdBalance: nextUsd.toFixed(6) },
    });
    await tx.walletTransaction.create({
      data: {
        walletId: wallet.walletId,
        type: "FX_CONVERSION",
        amount: cashDelta.toFixed(6),
        balanceAfter: nextCash.toFixed(6),
        metadata: {
          direction,
          tryAmount: Math.abs(cashDelta),
          usdAmount: Math.abs(usdDelta),
          rate: usdTry,
        },
        description:
          direction === "TRY_TO_USD"
            ? `TRY → USD: ₺${round2(amount).toFixed(2)} ile $${usdDelta.toFixed(2)} alındı (kur ${usdTry.toFixed(4)})`
            : `USD → TRY: $${round2(amount).toFixed(2)} satıldı, ₺${cashDelta.toFixed(2)} alındı (kur ${usdTry.toFixed(4)})`,
      },
    });
    return { cashAfter: nextCash, usdAfter: nextUsd };
  });
}

function formatAmount(value: number, currency: Currency) {
  return currency === "USD" ? `$${value.toFixed(2)}` : `₺${value.toFixed(2)}`;
}
