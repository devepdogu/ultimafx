"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import { MarketStatusPill } from "./MarketStatusPill";
import {
  Home,
  LineChart,
  Briefcase,
  ArrowLeftRight,
  Newspaper,
  Wallet,
  UserRound,
} from "lucide-react";

const ITEMS = [
  { href: "/", key: "home" as const, icon: Home },
  { href: "/piyasalar", key: "markets" as const, icon: LineChart },
  { href: "/portfoy", key: "portfolio" as const, icon: Briefcase },
  { href: "/emirler", key: "transactions" as const, icon: ArrowLeftRight },
  { href: "/haberler", key: "news" as const, icon: Newspaper },
  { href: "/cuzdan", key: "wallet" as const, icon: Wallet },
  { href: "/profil", key: "profile" as const, icon: UserRound },
];

export function Sidebar({ siteName, logoUrl }: { siteName: string; logoUrl: string | null }) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-20 shrink-0 flex-col border-r border-border bg-surface px-3 py-5 md:flex lg:w-64">
      <div className="mb-8 flex items-center gap-2 px-1">
        {/* eslint-disable-next-line @next/next/no-img-element -- admin-provided or fixed local brand asset */}
        <img src={logoUrl ?? "/brand/ultima-mark.png"} alt="" className="h-8 w-8 shrink-0 object-contain" />
        <span className="hidden truncate text-lg font-bold tracking-tight text-foreground lg:inline">{siteName}</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {ITEMS.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={item.href}
              title={t(item.key)}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-surface-2 text-foreground"
                  : "text-muted hover:bg-surface-2 hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand transition-opacity",
                  active ? "opacity-100" : "opacity-0"
                )}
              />
              <Icon size={19} strokeWidth={2} className="shrink-0" />
              <span className="hidden truncate lg:inline">{t(item.key)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="hidden lg:block">
        <MarketStatusPill />
      </div>
    </aside>
  );
}
