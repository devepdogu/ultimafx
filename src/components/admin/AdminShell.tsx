"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Banknote,
  Bitcoin,
  Building2,
  CandlestickChart,
  Image as ImageIcon,
  Landmark,
  LayoutDashboard,
  Menu,
  Newspaper,
  PieChart,
  Rocket,
  Settings2,
  Trophy,
  Users,
  Wallet,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

/** Admin navigation, grouped by the kind of work: people, content, money and system. */
const NAV: NavGroup[] = [
  {
    title: "Genel",
    items: [
      { href: "/admin", label: "Panel", icon: LayoutDashboard },
      { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: Users },
    ],
  },
  {
    title: "İçerik",
    items: [
      { href: "/admin/varliklar", label: "Varlıklar", icon: CandlestickChart },
      { href: "/admin/halka-arz", label: "Halka Arz", icon: Rocket },
      { href: "/admin/fonlar", label: "Yatırım Fonları", icon: PieChart },
      { href: "/admin/haberler", label: "Haberler", icon: Newspaper },
      { href: "/admin/kampanyalar", label: "Kampanyalar", icon: Trophy },
      { href: "/admin/bannerlar", label: "Bannerlar", icon: ImageIcon },
    ],
  },
  {
    title: "Finans",
    items: [
      { href: "/admin/para-yatirma", label: "Para Yatırma", icon: Banknote },
      { href: "/admin/para-cekme", label: "Para Çekme", icon: Wallet },
      { href: "/admin/vadeli-mevduat", label: "Vadeli Mevduat", icon: Landmark },
      { href: "/admin/banka-hesaplari", label: "Banka Hesapları", icon: Building2 },
      { href: "/admin/kripto-adresleri", label: "Kripto Adresleri", icon: Bitcoin },
    ],
  },
  {
    title: "Sistem",
    items: [{ href: "/admin/site", label: "Site Ayarları", icon: Settings2 }],
  },
];

const ALL_ITEMS = NAV.flatMap((g) => g.items);

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-5">
      {NAV.map((group) => (
        <div key={group.title} className="flex flex-col gap-0.5">
          <span className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">{group.title}</span>
          {group.items.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                  active ? "bg-foreground text-background" : "text-foreground/75 hover:bg-surface-2 hover:text-foreground"
                )}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

/** Admin frame: sidebar and top bar on desktop, drawer on mobile. Separate from the user app shell. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const current = ALL_ITEMS.find((i) => isActive(pathname, i.href)) ?? ALL_ITEMS[0];

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-6 overflow-y-auto border-r border-border bg-surface p-4 md:flex">
        <Link href="/admin" className="flex items-center gap-2.5 px-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-[13px] font-extrabold text-background">U</span>
          <span className="flex flex-col leading-tight">
            <span className="text-[14px] font-extrabold">Ultima FX</span>
            <span className="text-[11px] text-muted">Yönetim paneli</span>
          </span>
        </Link>
        <Nav />
        <div className="mt-auto">
          <Link href="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-muted hover:bg-surface-2 hover:text-foreground">
            <ArrowLeft size={16} /> Uygulamaya dön
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur md:px-8">
          <button type="button" onClick={() => setOpen(true)} aria-label="Menüyü aç" className="rounded-lg p-1.5 hover:bg-surface-2 md:hidden">
            <Menu size={20} />
          </button>
          <div className="flex min-w-0 items-center gap-2 text-[13px]">
            <span className="hidden text-muted md:inline">Yönetim</span>
            <span className="hidden text-muted md:inline">/</span>
            <span className="truncate font-bold">{current.label}</span>
          </div>
          <Link href="/" className="ml-auto text-[12px] font-bold text-muted hover:text-foreground md:hidden">
            Uygulama
          </Link>
        </header>

        {open && (
          <div className="fixed inset-0 z-50 flex md:hidden" onClick={() => setOpen(false)}>
            <div className="absolute inset-0 bg-black/60" />
            <aside
              className="relative flex h-full w-72 max-w-[85%] flex-col gap-6 overflow-y-auto bg-surface p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-2">
                <span className="text-[14px] font-extrabold">Ultima FX · Yönetim</span>
                <button type="button" onClick={() => setOpen(false)} aria-label="Menüyü kapat" className="rounded-lg p-1.5 hover:bg-surface-2">
                  <X size={18} />
                </button>
              </div>
              <Nav onNavigate={() => setOpen(false)} />
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
