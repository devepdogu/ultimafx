import { requireUserForPage } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { getPortfolioSummary } from "@/lib/portfolio/summary";
import { WalletView, type FxDetails, type WalletViewData } from "@/components/wallet/WalletView";
import { settleMaturedTermDeposits } from "@/lib/term-deposit/service";
import { resolveAssetPrice } from "@/lib/market-data/resolve-price";

/** Only FX conversion rows carry structured details; anything else is treated as having none. */
function parseFxMetadata(value: unknown): FxDetails | null {
  if (!value || typeof value !== "object") return null;
  const m = value as Record<string, unknown>;
  if (typeof m.tryAmount !== "number" || typeof m.usdAmount !== "number" || typeof m.rate !== "number") return null;
  return {
    direction: m.direction === "USD_TO_TRY" ? "USD_TO_TRY" : "TRY_TO_USD",
    tryAmount: m.tryAmount,
    usdAmount: m.usdAmount,
    rate: m.rate,
  };
}

/** Shows only the last 4 characters of an account or wallet identifier. */
function maskTail(value: string) {
  return `•••• ${value.slice(-4)}`;
}

export default async function WalletPage() {
  const user = await requireUserForPage();
  await settleMaturedTermDeposits(user.id);

  const usdAsset = await prisma.asset.findUnique({ where: { symbol: "USDTRY" } });
  const usd = usdAsset ? await resolveAssetPrice(usdAsset) : null;

  const [summary, deposits, withdrawals, orders, trades, transactions] = await Promise.all([
    getPortfolioSummary(user.id),
    prisma.deposit.findMany({
      where: { userId: user.id },
      include: { bankAccount: true, cryptoAddress: true },
      orderBy: { requestedAt: "desc" },
      take: 20,
    }),
    prisma.withdrawal.findMany({ where: { userId: user.id }, orderBy: { requestedAt: "desc" }, take: 20 }),
    prisma.order.findMany({
      where: { userId: user.id },
      include: { asset: true },
      orderBy: { placedAt: "desc" },
      take: 100,
    }),
    prisma.trade.findMany({
      where: { userId: user.id },
      include: { asset: true },
      orderBy: { executedAt: "desc" },
      take: 50,
    }),
    prisma.walletTransaction.findMany({
      where: { wallet: { userId: user.id } },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  const cash = Number(summary.cash);
  const usdBalance = Number(summary.usdCash);
  const usdTry = usd?.price ?? null;
  // summary.totalValue already includes the USD balance and USD holdings converted to TRY.
  const totalValue = Number(summary.totalValue);
  const totalPnl = Number(summary.totalPnl);
  const invested = Number(summary.investments);
  const totalPnlPercent = invested > 0 ? (totalPnl / (invested - totalPnl)) * 100 : null;

  const data: WalletViewData = {
    usdTry,
    cash,
    usdBalance,
    totalValue,
    totalPnl,
    totalPnlPercent,
    assets: summary.holdings.map((h) => ({
      id: h.id,
      symbol: h.asset.symbol,
      name: h.asset.name,
      type: h.asset.type,
      logoUrl: h.asset.logoUrl,
      quantity: Number(h.quantity),
      marketValue: Number(h.marketValue),
      currency: h.asset.currency,
      averageCost: Number(h.averageCost),
      currentPrice: h.currentPrice != null ? Number(h.currentPrice) : null,
      cost: Number(h.quantity) * Number(h.averageCost),
      pnl: Number(h.pnl.absolute),
      pnlPercent: Number(h.pnl.percent),
    })),
    requests: [
      ...deposits.map((d) => ({
        id: d.id,
        kind: "DEPOSIT" as const,
        method: d.method,
        amount: Number(d.amount),
        status: d.status,
        reference: d.reference,
        destination:
          d.method === "CRYPTO"
            ? d.cryptoAddress && `${d.cryptoAddress.network} · ${maskTail(d.cryptoAddress.address)}`
            : d.bankAccount && `${d.bankAccount.bankName} · ${maskTail(d.bankAccount.iban)}`,
        date: d.requestedAt.toISOString(),
      })),
      ...withdrawals.map((w) => ({
        id: w.id,
        kind: "WITHDRAWAL" as const,
        method: w.method,
        amount: Number(w.amount),
        status: w.status,
        reference: w.reference,
        destination:
          w.method === "CRYPTO"
            ? w.destinationAddress && `${w.destinationNetwork ?? "Kripto"} · ${maskTail(w.destinationAddress)}`
            : w.destinationIban && `${w.destinationBankName ?? "Banka"} · ${maskTail(w.destinationIban)}`,
        date: w.requestedAt.toISOString(),
      })),
    ].sort((a, b) => b.date.localeCompare(a.date)),
    openOrders: orders
      .filter((o) => o.status === "PENDING" || o.status === "OPEN" || o.status === "PARTIALLY_FILLED")
      .map((o) => ({
        id: o.id,
        symbol: o.asset.symbol,
        assetType: o.asset.type,
        logoUrl: o.asset.logoUrl,
        side: o.side,
        quantity: Number(o.quantity),
        price: o.limitPrice != null ? Number(o.limitPrice) : null,
        status: o.status,
        date: o.placedAt.toISOString(),
      })),
    trades: trades.map((t) => ({
      id: t.id,
      symbol: t.asset.symbol,
      assetType: t.asset.type,
      logoUrl: t.asset.logoUrl,
      side: t.side,
      quantity: Number(t.quantity),
      price: Number(t.price),
      status: "FILLED",
      date: t.executedAt.toISOString(),
    })),
    limitOrders: orders
      .filter((o) => o.type === "LIMIT")
      .map((o) => ({
        id: o.id,
        symbol: o.asset.symbol,
        assetType: o.asset.type,
        logoUrl: o.asset.logoUrl,
        side: o.side,
        quantity: Number(o.quantity),
        price: o.limitPrice != null ? Number(o.limitPrice) : null,
        status: o.status,
        date: o.placedAt.toISOString(),
      })),
    transactions: transactions.map((t) => ({
      id: t.id,
      type: t.type,
      metadata: parseFxMetadata(t.metadata),
      description: t.description ?? t.type,
      amount: Number(t.amount),
      date: t.createdAt.toISOString(),
    })),
  };

  return <WalletView data={data} />;
}
