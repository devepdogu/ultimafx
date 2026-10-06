"use client";

import { useTranslations } from "next-intl";
import { Search, Settings, LogIn, UserRound } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ThemeToggle } from "./ThemeToggle";

export interface HeaderNotification {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface HeaderProps {
  siteName: string;
  logoUrl: string | null;
  user: { name: string; email: string } | null;
  unreadCount: number;
  notifications: HeaderNotification[];
}

const ICON_LINK =
  "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm transition-colors hover:border-brand";

export function Header({ siteName, logoUrl, user }: HeaderProps) {
  const tAuth = useTranslations("auth");

  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center gap-3 border-b border-border/60 bg-background/95 px-4 backdrop-blur md:px-6">
      <Link href="/" className="flex shrink-0 items-center md:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- fixed local brand asset */}
        <img src={logoUrl ?? "/brand/ultima-logo.png"} alt={siteName} width={104} height={34} className="brand-logo h-[34px] w-[104px] object-contain object-left" />
      </Link>

      <Link
        href="/piyasalar"
        className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full border border-border bg-surface px-3.5 text-[14px] text-muted shadow-sm transition-colors hover:border-brand md:max-w-md"
      >
        <Search size={18} className="shrink-0 text-brand" />
        <span className="truncate">Varlık ara...</span>
      </Link>

      <div className="flex shrink-0 items-center gap-1.5 md:ml-0">
        {!user ? (
          <>
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-surface shadow-sm">
              <ThemeToggle />
            </span>
            <div className="hidden items-center gap-1.5 md:flex">
              <Link
                href="/giris"
                className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-surface-2"
              >
                <LogIn size={16} /> {tAuth("login")}
              </Link>
              <Link
                href="/kayit"
                className="whitespace-nowrap rounded-full bg-brand px-3 py-1.5 text-sm font-semibold text-brand-foreground hover:opacity-90"
              >
                Müşteri Ol
              </Link>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1.5">
            <Link href="/profil" aria-label="Profil" className={ICON_LINK}>
              <UserRound size={18} />
            </Link>
            <Link href="/ayarlar" aria-label="Ayarlar" className={ICON_LINK}>
              <Settings size={18} />
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
