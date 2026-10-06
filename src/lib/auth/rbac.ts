import "server-only";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { auth } from "./auth";

export const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"] as const;

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export async function requireRole(...allowed: string[]) {
  const user = await requireUser();
  const roles = user.roles ?? [];
  const ok = roles.some((r) => allowed.includes(r));
  if (!ok) throw new Error("FORBIDDEN");
  return user;
}

export async function requireAdmin() {
  return requireRole(...ADMIN_ROLES);
}

/** For Server Components: redirects to the login page instead of throwing. */
export async function requireUserForPage() {
  const user = await getCurrentUser();
  if (user) return user;
  const locale = await getLocale();
  return redirect({ href: "/giris", locale });
}
