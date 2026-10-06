import { QueryProvider } from "@/components/providers/QueryProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { AppHeader } from "@/components/layout/AppHeader";
import { getCurrentUser } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { getSiteSettings } from "@/lib/site/settings";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const site = await getSiteSettings();

  const [unreadCount, notifications] = user
    ? await Promise.all([
        prisma.notification.count({ where: { userId: user.id, isRead: false } }),
        prisma.notification.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
      ])
    : [0, []];

  return (
    <QueryProvider>
      <div className="flex min-h-dvh">
        <Sidebar siteName={site.siteName} logoUrl={site.logoUrl} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader
            siteName={site.siteName}
            logoUrl={site.logoUrl}
            user={user ? { name: user.name ?? user.email ?? "", email: user.email ?? "" } : null}
            unreadCount={unreadCount}
            notifications={notifications.map((n) => ({
              id: n.id,
              title: n.title,
              body: n.body,
              isRead: n.isRead,
              createdAt: n.createdAt.toISOString(),
            }))}
          />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
        </div>
      </div>
      <BottomNav />
    </QueryProvider>
  );
}
