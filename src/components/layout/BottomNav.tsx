"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Home, LineChart, ArrowLeftRight, Newspaper, Wallet } from "lucide-react";

const ITEMS = [
  { href: "/", key: "home" as const, icon: Home },
  { href: "/piyasalar", key: "markets" as const, icon: LineChart },
  { href: "/emirler", key: "transactions" as const, icon: ArrowLeftRight },
  { href: "/haberler", key: "news" as const, icon: Newspaper },
  { href: "/cuzdan", key: "wallet" as const, icon: Wallet },
];

export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  if (/^\/piyasalar\/[^/]+\/[^/]+$/.test(pathname)) return null;

  return (
    <nav
      className="fixed inset-x-4 bottom-3 z-40 mx-auto flex h-16 max-w-[660px] items-center justify-between rounded-[32px] border border-border bg-surface/[0.88] pl-[5px] pr-[5px] backdrop-blur md:hidden"
      style={{ boxShadow: "0px 5px 22px rgba(16,17,26,0.10)" }}
    >
      {ITEMS.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex h-[54px] w-[59.6px] shrink-0 flex-col items-center justify-center gap-[2px] rounded-[27px] transition-colors ${
              active ? "bg-surface-3 text-foreground" : "text-muted"
            }`}
          >
            <Icon size={22} strokeWidth={2} />
            <span className={`text-[10px] leading-3 ${active ? "font-semibold" : "font-medium"}`}>
              {t(item.key)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
