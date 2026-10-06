import { ChevronLeft, Sparkles } from "lucide-react";
import { requireUserForPage } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { Link } from "@/i18n/navigation";
import { CampaignCard } from "@/components/rewards/CampaignCard";

export default async function RewardsPage() {
  await requireUserForPage();
  const campaigns = await prisma.campaign.findMany({ where: { isActive: true }, orderBy: [{ position: "asc" }, { createdAt: "asc" }] });

  const active = campaigns.filter((c) => c.status === "ACTIVE");
  const others = campaigns.filter((c) => c.status !== "ACTIVE");

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-surface-2 px-4 py-4">
        <Link href="/" aria-label="Geri" className="shrink-0 text-foreground">
          <ChevronLeft size={26} />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col items-center text-center">
          <h1 className="text-[18px] font-bold leading-6 text-foreground">Kampanyalar</h1>
          <span className="text-[12px] text-muted">Ödül ve fırsatları keşfet</span>
        </div>
        <span className="w-[26px] shrink-0" aria-hidden />
      </header>

      <div className="flex flex-col gap-6 px-4 py-5 pb-8">
        <section className="relative overflow-hidden rounded-3xl bg-foreground p-5 text-background">
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand/40 blur-3xl" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wide opacity-70">Şu an</span>
              <span className="num-tabular text-[30px] font-extrabold leading-none">{active.length} aktif kampanya</span>
              <span className="mt-1 text-[12px] opacity-70">Yatırım yaptıkça ödüller hesabınıza tanımlanır.</span>
            </div>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-background/10">
              <Sparkles size={22} />
            </span>
          </div>
        </section>

        <div className="flex flex-col gap-3">
          <h2 className="px-1 text-[12px] font-bold uppercase tracking-wide text-muted">Aktif kampanyalar</h2>
          {active.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>

        {others.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="px-1 text-[12px] font-bold uppercase tracking-wide text-muted">Tamamlanan &amp; gelecek</h2>
            {others.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        )}

        <p className="px-2 text-center text-[11px] leading-5 text-muted">
          Tüm kampanyalar Ultima FX güvencesindedir. Kampanya koşulları değişiklik gösterebilir; ödüller otomatik olarak hesabınıza tanımlanır.
          Detaylı bilgi için 7/24 canlı destek ekibimizle iletişime geçebilirsiniz.
        </p>
      </div>
    </div>
  );
}
