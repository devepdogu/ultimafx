import { BadgeCheck, Crown, GraduationCap, Gift, LineChart, Repeat, Trophy, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Campaign } from "@prisma/client";
import { cn } from "@/lib/utils/cn";

/** Icon per campaign category; unknown categories fall back to a gift icon. */
const ICONS: Record<string, LucideIcon> = {
  "Hoş geldin": Gift,
  "İşlem hacmi": LineChart,
  VIP: Crown,
  Sadakat: Repeat,
  Eğitim: GraduationCap,
  "Yatırım bonusu": Wallet,
  Yarışma: Trophy,
};

/** Campaign card: category icon and status on top, title and tagline, description, and the reward as a highlighted tile. */
export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const active = campaign.status === "ACTIVE";
  const Icon = ICONS[campaign.category] ?? Gift;

  return (
    <article
      className={cn(
        "relative flex flex-col gap-4 overflow-hidden rounded-3xl border p-5",
        campaign.isFeatured ? "border-brand/50 bg-linear-to-br from-brand-bg via-surface to-surface" : "border-border bg-surface",
        !active && "opacity-80"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
            active ? "bg-brand text-brand-foreground" : "bg-surface-3 text-muted"
          )}
        >
          <Icon size={20} />
        </span>
        <div className="flex flex-wrap justify-end gap-1.5">
          {campaign.isFeatured && (
            <span className="rounded-full bg-foreground px-2.5 py-1 text-[10px] font-extrabold leading-none text-background">ÖNE ÇIKAN</span>
          )}
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold leading-none",
              active ? "bg-positive-bg text-positive" : "bg-[#F59E0B]/13 text-[#F59E0B]"
            )}
          >
            {active && <BadgeCheck size={11} />}
            {active ? "AKTİF" : "YAKINDA"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="text-[17px] font-extrabold leading-6 text-foreground">{campaign.title}</h2>
        <span className="text-[12px] font-semibold text-brand">{campaign.tagline}</span>
      </div>

      <p className="text-[13px] leading-5 text-muted">{campaign.description}</p>

      <div className="flex items-center justify-between gap-3 rounded-2xl bg-surface-2 px-4 py-3">
        <span className="text-[11px] font-bold uppercase tracking-wide text-muted">Ödül</span>
        <span className={cn("num-tabular text-[16px] font-extrabold", active ? "text-positive" : "text-foreground")}>{campaign.rewardLabel}</span>
      </div>
    </article>
  );
}
