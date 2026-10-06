"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { Bell, ChevronDown, LogIn, LogOut, Search, UserRound } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { IconButton } from "@/components/ui/IconButton";
import { ThemeToggle } from "./ThemeToggle";
import { logoutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils/cn";

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

function useClickOutside(onOutside: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onOutside]);
  return ref;
}

export function Header({ siteName, logoUrl, user, unreadCount, notifications }: HeaderProps) {
  const tNav = useTranslations("nav");
  const tAuth = useTranslations("auth");
  const [notifOpen, setNotifOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const notifRef = useClickOutside(() => setNotifOpen(false));
  const accountRef = useClickOutside(() => setAccountOpen(false));

  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center gap-3 bg-background px-4 backdrop-blur md:px-6">
      <Link href="/" className="flex shrink-0 items-center md:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- fixed local brand asset */}
        <img src={logoUrl ?? "/brand/ultima-logo.png"} alt={siteName} width={104} height={34} className="brand-logo h-[34px] w-[104px] object-contain object-left" />
      </Link>

      <Link
        href="/piyasalar"
        className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-[10px] border border-border bg-surface-2 px-2.5 text-[12px] text-muted md:max-w-md"
      >
        <Search size={18} className="shrink-0 text-brand" />
        <span className="truncate">Varlık ara...</span>
      </Link>

      <div className="flex shrink-0 items-center gap-1.5 md:ml-0">
        <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-2">
          <ThemeToggle />
        </span>

        {!user ? (
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
        ) : (
          <>
            

            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-2"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-bg text-xs font-bold text-brand">
                  {user.name.slice(0, 1).toUpperCase()}
                </span>
                <ChevronDown size={14} className="hidden text-muted sm:block" />
              </button>

              {accountOpen && (
                <div className="absolute right-0 top-12 w-56 rounded-xl border border-border bg-surface p-1.5 shadow-lg">
                  <div className="border-b border-border px-3 py-2">
                    <div className="truncate text-sm font-medium">{user.name}</div>
                    <div className="truncate text-xs text-muted">{user.email}</div>
                  </div>
                  <Link
                    href="/profil"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-surface-2"
                    onClick={() => setAccountOpen(false)}
                  >
                    <UserRound size={16} /> {tNav("profile")}
                  </Link>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-negative hover:bg-negative-bg"
                    >
                      <LogOut size={16} /> {tAuth("logout")}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
