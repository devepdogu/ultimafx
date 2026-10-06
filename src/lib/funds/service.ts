import "server-only";
import { prisma } from "@/lib/prisma/client";
import { MIN_FUND_PURCHASE_TRY } from "./constants";

export class FundError extends Error {}

const round2 = (n: number) => Math.round(n * 100) / 100;
/** Units are rounded down so the buyer never receives more units than the cash paid for. */
const floorUnits = (n: number) => Math.floor(n * 1_000_000) / 1_000_000;

/** Same row lock the wallet ledger uses, so a purchase cannot race a transfer or a trade. */
async function lockCash(tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0], userId: string) {
  const rows = await tx.$queryRaw<{ id: string; cashBalance: string }[]>`
    SELECT id, "cashBalance" FROM "Wallet" WHERE "userId" = ${userId} FOR UPDATE
  `;
  const row = rows[0];
  if (!row) throw new FundError("Cüzdanınız bulunamadı. Lütfen tekrar deneyin.");
  return { walletId: row.id, cashBalance: Number(row.cashBalance) };
}

/**
 * Buys units of an investment fund with TRY cash. Cash is debited, the wallet ledger
 * records a FUND_PURCHASE row, and the user's holding grows by amount / unit price.
 */
export async function purchaseFund(userId: string, fundId: string, amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) throw new FundError("Geçerli bir tutar girin.");
  const cost = round2(amount);
  if (cost < MIN_FUND_PURCHASE_TRY) throw new FundError(`Minimum alım tutarı ${MIN_FUND_PURCHASE_TRY} TL.`);

  return prisma.$transaction(async (tx) => {
    const fund = await tx.investmentFund.findUnique({ where: { id: fundId } });
    if (!fund || !fund.isActive) throw new FundError("Bu fon artık satışta değil.");
    const unitPrice = fund.unitPrice == null ? 0 : Number(fund.unitPrice);
    if (!(unitPrice > 0)) throw new FundError("Fonun birim fiyatı henüz yayınlanmadı.");

    const wallet = await lockCash(tx, userId);
    if (wallet.cashBalance < cost) throw new FundError("Yetersiz TL bakiye. Önce para yatırın.");

    const units = floorUnits(cost / unitPrice);
    if (!(units > 0)) throw new FundError("Bu tutar ile en az bir birim alınamıyor.");

    const next = round2(wallet.cashBalance - cost);
    await tx.wallet.update({ where: { id: wallet.walletId }, data: { cashBalance: next.toFixed(6) } });
    await tx.walletTransaction.create({
      data: {
        walletId: wallet.walletId,
        type: "FUND_PURCHASE",
        amount: (-cost).toFixed(6),
        balanceAfter: next.toFixed(6),
        referenceType: "InvestmentFund",
        referenceId: fund.id,
        description: `${fund.name} alımı (${units.toLocaleString("tr-TR", { maximumFractionDigits: 6 })} pay)`,
      },
    });

    const holding = await tx.fundHolding.findUnique({ where: { userId_fundId: { userId, fundId } } });
    if (holding) {
      await tx.fundHolding.update({
        where: { id: holding.id },
        data: {
          units: (Number(holding.units) + units).toFixed(6),
          costTry: (Number(holding.costTry) + cost).toFixed(6),
        },
      });
    } else {
      await tx.fundHolding.create({
        data: { userId, fundId, units: units.toFixed(6), costTry: cost.toFixed(6) },
      });
    }

    return { units, cost };
  });
}

/**
 * Sells units back to the fund at its unit price. Cash is credited to the wallet and the
 * holding's cost basis shrinks in proportion to the units sold. Selling everything removes the holding.
 */
export async function redeemFund(userId: string, fundId: string, unitsToSell: number) {
  if (!Number.isFinite(unitsToSell) || unitsToSell <= 0) throw new FundError("Geçerli bir pay adedi girin.");
  const sold = floorUnits(unitsToSell);

  return prisma.$transaction(async (tx) => {
    const holding = await tx.fundHolding.findUnique({ where: { userId_fundId: { userId, fundId } } });
    if (!holding || Number(holding.units) <= 0) throw new FundError("Bu fonda yatırımınız yok.");
    const held = Number(holding.units);
    if (sold > held) throw new FundError("Satmak istediğiniz pay adedi mevcut paylarınızdan fazla.");

    const fund = await tx.investmentFund.findUniqueOrThrow({ where: { id: fundId } });
    const unitPrice = fund.unitPrice == null ? 0 : Number(fund.unitPrice);
    if (!(unitPrice > 0)) throw new FundError("Fonun birim fiyatı henüz yayınlanmadı.");

    const payout = round2(sold * unitPrice);
    if (!(payout > 0)) throw new FundError("Bu pay adedi için satış tutarı hesaplanamadı.");

    const wallet = await lockCash(tx, userId);
    const next = round2(wallet.cashBalance + payout);
    await tx.wallet.update({ where: { id: wallet.walletId }, data: { cashBalance: next.toFixed(6) } });
    await tx.walletTransaction.create({
      data: {
        walletId: wallet.walletId,
        type: "FUND_REDEMPTION",
        amount: payout.toFixed(6),
        balanceAfter: next.toFixed(6),
        referenceType: "InvestmentFund",
        referenceId: fund.id,
        description: `${fund.name} satışı (${sold.toLocaleString("tr-TR", { maximumFractionDigits: 6 })} pay)`,
      },
    });

    const remaining = floorUnits(held - sold);
    if (remaining <= 0) {
      await tx.fundHolding.delete({ where: { id: holding.id } });
    } else {
      const costLeft = round2(Number(holding.costTry) * (remaining / held));
      await tx.fundHolding.update({
        where: { id: holding.id },
        data: { units: remaining.toFixed(6), costTry: costLeft.toFixed(6) },
      });
    }

    return { units: sold, payout };
  });
}
