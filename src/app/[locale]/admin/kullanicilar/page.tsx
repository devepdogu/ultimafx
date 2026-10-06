import { prisma } from "@/lib/prisma/client";
import { Link } from "@/i18n/navigation";
import { AdminEmpty, AdminPageHeader, AdminPanel, StatusPill, type PillTone } from "@/components/admin/AdminUi";
import { formatDateTime } from "@/lib/utils/format";
import { USER_STATUS } from "@/lib/admin/user-status";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { q = "", status = "" } = await searchParams;
  const term = q.trim();

  const users = await prisma.user.findMany({
    where: {
      ...(term
        ? { OR: [{ name: { contains: term, mode: "insensitive" } }, { email: { contains: term, mode: "insensitive" } }, { phone: { contains: term } }] }
        : {}),
      ...(status ? { status: status as "ACTIVE" | "PENDING_VERIFICATION" | "SUSPENDED" | "CLOSED" } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: { id: true, name: true, email: true, phone: true, status: true, createdAt: true, kycDocuments: { select: { reviewStatus: true } } },
  });

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <AdminPageHeader title="Kullanıcılar" description="Hesap durumu, KYC belgeleri ve erişim. Bir kullanıcıya tıklayarak detayını açın." />

      <form className="grid gap-3 rounded-2xl border border-border bg-surface p-4 md:grid-cols-[1fr_200px_auto]">
        <input
          name="q"
          defaultValue={term}
          placeholder="Ad, e-posta veya telefon ara"
          className="h-10 rounded-lg border border-border bg-surface-2 px-3 text-[13px] outline-none focus:border-brand"
        />
        <select name="status" defaultValue={status} className="h-10 rounded-lg border border-border bg-surface-2 px-3 text-[13px] outline-none focus:border-brand">
          <option value="">Tüm durumlar</option>
          {Object.entries(USER_STATUS).map(([value, s]) => (
            <option key={value} value={value}>
              {s.label}
            </option>
          ))}
        </select>
        <button type="submit" className="h-10 rounded-lg bg-brand px-5 text-[13px] font-bold text-brand-foreground">
          Filtrele
        </button>
      </form>

      <AdminPanel title={`Kullanıcılar (${users.length})`} description="En yeni kayıtlar üstte. En fazla 200 kayıt gösterilir.">
        {users.length === 0 ? (
          <AdminEmpty>Bu filtrelere uyan kullanıcı yok.</AdminEmpty>
        ) : (
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
            {users.map((u) => {
              const st = USER_STATUS[u.status] ?? { label: u.status, tone: "neutral" as PillTone };
              const pendingKyc = u.kycDocuments.some((d) => d.reviewStatus === "PENDING");
              return (
                <Link key={u.id} href={`/admin/kullanicilar/${u.id}`} className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-surface-2">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-[14px] font-bold">{u.name ?? "İsimsiz kullanıcı"}</span>
                    <span className="truncate text-[12px] text-muted">
                      {u.email ?? u.phone ?? "-"} · {formatDateTime(u.createdAt.toISOString())}
                    </span>
                  </div>
                  <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                    {pendingKyc && <StatusPill tone="warning">KYC incelenecek</StatusPill>}
                    <StatusPill tone={st.tone}>{st.label}</StatusPill>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
