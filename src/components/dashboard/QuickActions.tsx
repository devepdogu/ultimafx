import { Gift, Rocket, PieChart, UserPlus, Smartphone, Newspaper } from "lucide-react";
import { Link } from "@/i18n/navigation";

const ACTIONS = [
  { href: "/odulller", label: "Ödüller", icon: Gift },
  { href: "/halka-arz", label: "Halka Arz", icon: Rocket },
  { href: "/fonlar", label: "Fonlar", icon: PieChart },
  { href: "/odulller", label: "Davet Et", icon: UserPlus },
  { href: "/mobil", label: "Mobil İndir", icon: Smartphone },
  { href: "/haberler", label: "Haberler", icon: Newspaper },
] as const;

/** Reference: horizontal row, 12px gap, 16px side padding, 56px black circles, 12px labels. */
export function QuickActions() {
  return (
    <div className="-mx-4 flex gap-6 overflow-x-auto overscroll-x-contain px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {ACTIONS.map((a) => {
        const Icon = a.icon;
        return (
          <Link key={a.label} href={a.href} className="flex w-12 shrink-0 flex-col items-center gap-2">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background">
              <Icon size={22} />
            </span>
            <span className="whitespace-nowrap text-center text-[11px] font-semibold text-foreground">{a.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
