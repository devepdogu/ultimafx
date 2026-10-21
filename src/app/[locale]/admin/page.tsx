import { Banknote, Landmark, PieChart, Rocket, TrendingUp, Trophy, Users, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { prisma } from "@/lib/prisma/client";
import { Link } from "@/i18n/navigation";
import { resolveAssetPrices } from "@/lib/market-data/resolve-price";

const num = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 });

/** Every user's cash (no positions) vs. every user's open positions at today's price —
 * answers "how much is actually on the platform right now", broken out by currency rather
 * than invented into one converted total. */
async function getPlatformBalances() {
  const [cashAgg, holdings] = await Promise.all([
    prisma.wallet.aggregate({ _sum: { cashBalance: true, usdBalance: true } }),
    prisma.holding.findMany({
      where: { quantity: { gt: 0 } },
      select: { quantity: true, asset: true },
    }),
  ]);

  const assetById = new Map(holdings.map((h) => [h.asset.id, h.asset]));
  const distinctAssets = [...assetById.values()];
  const resolved = await resolveAssetPrices(distinctAssets);
  const priceByAssetId = new Map(distinctAssets.map((a, i) => [a.id, resolved[i].price]));

  let positionsTRY = 0;
  let positionsUSD = 0;
  for (const h of holdings) {
    const price = priceByAssetId.get(h.asset.id);
    if (price == null) continue;
    const value = Number(h.quantity) * price;
    if (h.asset.currency === "USD") positionsUSD += value;
    else positionsTRY += value;
  }

  return {
    cashTRY: Number(cashAgg._sum.cashBalance ?? 0),
    cashUSD: Number(cashAgg._sum.usdBalance ?? 0),
    positionsTRY,
    positionsUSD,
  };
}

export default async function AdminDashboardPage() {
  const [users, pendingDeposits, pendingWithdrawals, activeFunds, activeCampaigns, publishedIpos, openTermDeposits, balances] = await Promise.all([
    prisma.user.count(),
    prisma.deposit.count({ where: { status: "PENDING" } }),
    prisma.withdrawal.count({ where: { status: "PENDING" } }),
    prisma.investmentFund.count({ where: { isActive: true } }),
    prisma.campaign.count({ where: { isActive: true, status: "ACTIVE" } }),
    prisma.iPO.count({ where: { isPublished: true } }),
    prisma.termDepositAccount.count({ where: { status: "ACTIVE" } }),
    getPlatformBalances(),
  ]);

  const tiles: { href: string; label: string; value: number; hint: string; icon: LucideIcon; alert?: boolean }[] = [
    { href: "/admin/para-yatirma", label: "Bekleyen yatırma", value: pendingDeposits, hint: "Onay bekleyen talep", icon: Banknote, alert: pendingDeposits > 0 },
    { href: "/admin/para-cekme", label: "Bekleyen çekme", value: pendingWithdrawals, hint: "Onay bekleyen talep", icon: Wallet, alert: pendingWithdrawals > 0 },
    { href: "/admin/fonlar", label: "Yayında fon", value: activeFunds, hint: "Yatırım fonu", icon: PieChart },
    { href: "/admin/kampanyalar", label: "Aktif kampanya", value: activeCampaigns, hint: "Kullanıcıya görünen", icon: Trophy },
    { href: "/admin/halka-arz", label: "Yayında halka arz", value: publishedIpos, hint: "Halka arz listesi", icon: Rocket },
    { href: "/admin/vadeli-mevduat", label: "Açık vadeli mevduat", value: openTermDeposits, hint: "Vadesi dolmamış", icon: Landmark },
  ];

  return (
    <div className="flex max-w-6xl flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-[24px] font-extrabold tracking-tight">Panel</h1>
        <p className="text-[13px] text-muted">Bekleyen işler ve yayındaki içerikler. Bir karta tıklayarak ilgili bölüme geçin.</p>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              className="group flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-brand"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-brand">
                  <Icon size={18} />
                </span>
                {t.alert && <span className="rounded-full bg-negative-bg px-2 py-0.5 text-[10px] font-extrabold text-negative">BEKLİYOR</span>}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="num-tabular text-[28px] font-extrabold leading-none">{t.value}</span>
                <span className="mt-2 text-[13px] font-bold">{t.label}</span>
                <span className="text-[11px] text-muted">{t.hint}</span>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-5">
        <Users size={18} className="text-brand" />
        <div className="flex flex-col">
          <span className="text-[13px] font-bold">Toplam kullanıcı</span>
          <span className="num-tabular text-[20px] font-extrabold">{users}</span>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-brand" />
          <h2 className="text-[14px] font-bold">Platformdaki anlık bakiye</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <BalanceStat label="Nakit (TRY)" hint="Pozisyon hariç, cüzdanlardaki" value={`${num.format(balances.cashTRY)} TRY`} />
          <BalanceStat label="Nakit (USD)" hint="Pozisyon hariç, cüzdanlardaki" value={`${num.format(balances.cashUSD)} USD`} />
          <BalanceStat label="Pozisyonlar (TRY)" hint="Açık hisse/varlık, güncel fiyatla" value={`${num.format(balances.positionsTRY)} TRY`} />
          <BalanceStat label="Pozisyonlar (USD)" hint="Açık hisse/varlık, güncel fiyatla" value={`${num.format(balances.positionsUSD)} USD`} />
        </div>
        <div className="flex flex-col gap-1 border-t border-border pt-3 text-[13px]">
          <div className="flex justify-between">
            <span className="text-muted">Toplam (TRY, nakit + pozisyon)</span>
            <b className="num-tabular">{num.format(balances.cashTRY + balances.positionsTRY)} TRY</b>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Toplam (USD, nakit + pozisyon)</span>
            <b className="num-tabular">{num.format(balances.cashUSD + balances.positionsUSD)} USD</b>
          </div>
        </div>
      </section>
    </div>
  );
}

function BalanceStat({ label, hint, value }: { label: string; hint: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-surface-2 p-3.5">
      <span className="text-[11px] font-bold text-muted">{label}</span>
      <span className="num-tabular text-[16px] font-extrabold">{value}</span>
      <span className="text-[10px] text-muted">{hint}</span>
    </div>
  );
}
