import { headers } from "next/headers";
import { ChevronLeft, Coins, UserCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { requireUserForPage } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { ensureReferralCode } from "@/lib/referrals";
import { Link } from "@/i18n/navigation";
import { InviteProgram } from "@/components/referrals/InviteProgram";
import { cn } from "@/lib/utils/cn";

/** Reward levels from the davet mock. Every level pays the same amount per invited person. */
const TIERS = [
  { label: "1 – 5 davet", min: 1, max: 5 },
  { label: "6 – 20 davet", min: 6, max: 20 },
  { label: "21 – 50 davet", min: 21, max: 50 },
  { label: "51+ davet", min: 51, max: Infinity },
];
const REWARD_TEXT = "50 USD / kişi";

const STEPS = [
  { title: "Referans kodunuzu paylaşın", detail: "Kodunuzu ya da bağlantınızı arkadaşlarınızla paylaşın." },
  { title: "Arkadaşınız kayıt olsun", detail: "Kodunuzla kayıt olan her kişi listenize eklenir." },
  { title: "Kimlik doğrulaması tamamlansın", detail: "Arkadaşınız hesabını doğruladığında ödül tetiklenir." },
  { title: "İkinize de 50 USD yatırılır", detail: "Ödül iki hesaba da otomatik olarak tanımlanır." },
];

export default async function InvitePage() {
  const user = await requireUserForPage();
  const [code, invitedCount, verifiedCount] = await Promise.all([
    ensureReferralCode(user.id),
    prisma.user.count({ where: { referredById: user.id } }),
    prisma.user.count({ where: { referredById: user.id, status: "ACTIVE" } }),
  ]);

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const inviteUrl = `${proto}://${host}/kayit?ref=${code}`;
  const currentTier = TIERS.findIndex((t) => invitedCount >= t.min && invitedCount <= t.max);
  const tier = TIERS[currentTier] ?? TIERS[0];
  const nextTier = TIERS[currentTier + 1];
  const progress = nextTier ? Math.min(100, ((invitedCount - tier.min + 1) / (nextTier.min - tier.min)) * 100) : 100;

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-surface-2 px-4 py-4">
        <Link href="/" aria-label="Geri" className="shrink-0 text-foreground">
          <ChevronLeft size={26} />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col items-center text-center">
          <h1 className="text-[18px] font-bold leading-6 text-foreground">Davet Programı</h1>
          <span className="text-[12px] text-muted">Arkadaşını davet et, birlikte kazanın</span>
        </div>
        <span className="w-[26px] shrink-0" aria-hidden />
      </header>

      <div className="flex flex-col gap-5 px-4 py-5 pb-8">
        <section className="relative overflow-hidden rounded-3xl bg-foreground p-5 text-background">
          <div aria-hidden className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full bg-brand/40 blur-3xl" />
          <div className="relative flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wide opacity-70">Her davet için</span>
              <span className="text-[24px] font-extrabold leading-tight">{REWARD_TEXT}</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-[12px]">
                <span className="opacity-80">Seviye: {tier.label}</span>
                <span className="num-tabular opacity-80">{invitedCount} davet</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-background/15">
                <div className="h-full rounded-full bg-brand" style={{ width: `${progress}%` }} />
              </div>
              {nextTier && (
                <span className="text-[11px] opacity-70">Sonraki seviye: {nextTier.label}</span>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-surface p-5">
          <InviteProgram code={code} url={inviteUrl} />
        </section>

        <section className="grid grid-cols-3 gap-2.5">
          <Stat icon={Users} label="Toplam davet" value={String(invitedCount)} />
          <Stat icon={UserCheck} label="Doğrulanmış" value={String(verifiedCount)} />
          <Stat icon={Coins} label="Kazanılan" value="0 USD" />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="px-1 text-[12px] font-bold uppercase tracking-wide text-muted">Nasıl çalışır?</h2>
          <ol className="flex flex-col rounded-3xl border border-border bg-surface p-5">
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative flex gap-4 pb-5 last:pb-0">
                {i < STEPS.length - 1 && <span aria-hidden className="absolute left-[15px] top-8 h-[calc(100%-1.25rem)] w-px bg-border" />}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-[13px] font-extrabold text-brand-foreground">
                  {i + 1}
                </span>
                <div className="flex flex-col gap-0.5 pt-0.5">
                  <span className="text-[14px] font-bold text-foreground">{step.title}</span>
                  <span className="text-[12px] leading-5 text-muted">{step.detail}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="px-1 text-[12px] font-bold uppercase tracking-wide text-muted">Seviye durumu</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {TIERS.map((t, i) => (
              <div
                key={t.label}
                className={cn(
                  "flex flex-col gap-2 rounded-2xl border p-4",
                  i === currentTier ? "border-brand/60 bg-brand-bg" : "border-border bg-surface"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("text-[13px] font-bold", i === currentTier ? "text-brand" : "text-foreground")}>{t.label}</span>
                  {i === currentTier && (
                    <span className="rounded-full bg-brand px-2 py-0.5 text-[9px] font-extrabold text-brand-foreground">MEVCUT</span>
                  )}
                </div>
                <span className="num-tabular text-[12px] font-semibold text-muted">{REWARD_TEXT}</span>
              </div>
            ))}
          </div>
        </section>

        <p className="px-2 text-center text-[11px] leading-5 text-muted">
          Ödüller, davet ettiğiniz kişinin kimlik doğrulamasını tamamlamasının ardından hesabınıza yansıtılır.
        </p>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-3.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-bg text-brand">
        <Icon size={16} />
      </span>
      <span className="num-tabular text-[16px] font-extrabold text-foreground">{value}</span>
      <span className="text-[11px] font-semibold text-muted">{label}</span>
    </div>
  );
}
