import { requireUserForPage } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { resolveAssetPrice } from "@/lib/market-data/resolve-price";
import { settleMaturedTermDeposits } from "@/lib/term-deposit/service";
import { PageTopBar } from "@/components/ui/PageTopBar";
import { TermDepositView } from "@/components/wallet/TermDepositView";
import { CurrencyConvertCard } from "@/components/wallet/CurrencyConvertCard";

export default async function TermDepositPage() {
  const user = await requireUserForPage();
  await settleMaturedTermDeposits(user.id);

  const [wallet, products, accounts, usdAsset] = await Promise.all([
    prisma.wallet.findUnique({ where: { userId: user.id } }),
    prisma.termDepositProduct.findMany({ where: { isActive: true }, orderBy: [{ currency: "asc" }, { position: "asc" }, { termDays: "asc" }] }),
    prisma.termDepositAccount.findMany({
      where: { userId: user.id },
      orderBy: { openedAt: "desc" },
      take: 20,
    }),
    prisma.asset.findUnique({ where: { symbol: "USDTRY" } }),
  ]);
  const usd = usdAsset ? await resolveAssetPrice(usdAsset) : null;

  return (
    <div className="flex flex-col">
      <PageTopBar title="Vadeli Birikim" backHref="/cuzdan" />
      <div className="px-4 pt-4">
        <CurrencyConvertCard
          cashBalance={wallet ? Number(wallet.cashBalance) : 0}
          usdBalance={wallet ? Number(wallet.usdBalance) : 0}
          usdTry={usd?.price ?? null}
        />
      </div>
      <TermDepositView
        products={products.map((p) => ({
          id: p.id,
          currency: p.currency === "USD" ? "USD" : "TRY",
          termDays: p.termDays,
          annualRate: Number(p.annualRate),
          minAmount: Number(p.minAmount),
        }))}
        accounts={accounts.map((a) => ({
          id: a.id,
          currency: a.currency === "USD" ? "USD" : "TRY",
          principal: Number(a.principal),
          interest: Number(a.interest),
          termDays: a.termDays,
          annualRate: Number(a.annualRate),
          maturesAt: a.maturesAt.toISOString(),
          status: a.status,
        }))}
        cashBalance={wallet ? Number(wallet.cashBalance) : 0}
        usdBalance={wallet ? Number(wallet.usdBalance) : 0}
        usdTry={usd?.price ?? null}
      />
    </div>
  );
}
