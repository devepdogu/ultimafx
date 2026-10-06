"use client";

import { usePathname } from "@/i18n/navigation";
import { Header, type HeaderProps } from "./Header";

const CUSTOM_HEADER_PATHS = ["/piyasalar", "/cuzdan", "/emirler", "/halka-arz", "/profil", "/ayarlar", "/fonlar", "/odulller", "/davet"];

/** Pages in CUSTOM_HEADER_PATHS render their own top section instead of the default header. */
export function AppHeader(props: HeaderProps) {
  const pathname = usePathname();
  if (CUSTOM_HEADER_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;
  return <Header {...props} />;
}
