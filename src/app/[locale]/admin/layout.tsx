import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentUser, ADMIN_ROLES } from "@/lib/auth/rbac";
import { AdminShell } from "@/components/admin/AdminShell";

/** One guard for the whole admin area. Pages below can assume an admin session. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user) return redirect({ href: "/giris", locale });
  const isAdmin = user.roles?.some((r) => ADMIN_ROLES.includes(r as (typeof ADMIN_ROLES)[number]));
  if (!isAdmin) return redirect({ href: "/", locale });

  return <AdminShell>{children}</AdminShell>;
}
