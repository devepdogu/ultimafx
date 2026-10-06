import { BadgeCheck, Layers, Receipt, Settings, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { requireUserForPage } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma/client";
import { Link } from "@/i18n/navigation";
import { PageTopBar } from "@/components/ui/PageTopBar";
import { ProfileInfoForm } from "@/components/profile/ProfileInfoForm";
import { KycUploader } from "@/components/profile/KycUploader";
import { cn } from "@/lib/utils/cn";

export default async function ProfilePage() {
  const sessionUser = await requireUserForPage();

  const [user, tradeCount, openPositions, kycDocs] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { id: true, name: true, email: true, phone: true, status: true, gender: true, birthDate: true, city: true, country: true },
    }),
    prisma.trade.count({ where: { userId: sessionUser.id } }),
    prisma.holding.count({ where: { portfolio: { userId: sessionUser.id }, quantity: { gt: 0 } } }),
    prisma.kycDocument.findMany({ where: { userId: sessionUser.id }, select: { side: true, fileName: true } }),
  ]);

  const name = user?.name ?? sessionUser.name ?? "";
  const email = user?.email ?? sessionUser.email ?? null;
  const verified = user?.status === "ACTIVE";
  const shortId = (user?.id ?? sessionUser.id ?? "").slice(-8).toUpperCase();

  return (
    <div className="flex flex-col">
      <PageTopBar
        title="Profilim"
        backHref="/"
        right={
          <Link
            href="/ayarlar"
            aria-label="Ayarlar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm transition-colors hover:border-brand"
          >
            <Settings size={18} />
          </Link>
        }
      />

      <div className="flex flex-col gap-5 px-4 pb-8 pt-2">
        <section className="relative overflow-hidden rounded-3xl border border-border bg-surface p-5">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand/15 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-foreground text-[24px] font-extrabold text-background">
              {(name || email || "U").slice(0, 1).toUpperCase()}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="truncate text-[18px] font-extrabold text-foreground">{name || "-"}</span>
              <span className="truncate text-[13px] text-muted">{email ?? user?.phone ?? "-"}</span>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold",
                    verified ? "bg-positive-bg text-positive" : "bg-[#F59E0B]/13 text-[#F59E0B]"
                  )}
                >
                  <BadgeCheck size={13} /> {verified ? "Doğrulanmış" : "Doğrulama bekleniyor"}
                </span>
                <span className="num-tabular rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-bold text-muted">ID {shortId}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <Stat icon={Receipt} label="Toplam İşlem" value={String(tradeCount)} />
          <Stat icon={Layers} label="Açık Pozisyon" value={String(openPositions)} />
        </section>

        <Panel title="Kişisel Bilgiler">
          <div className="p-4">
            <ProfileInfoForm
              initial={{
                name: user?.name ?? "",
                gender: user?.gender ?? "",
                birthDate: user?.birthDate ? user.birthDate.toISOString().slice(0, 10) : "",
                city: user?.city ?? "",
                country: user?.country ?? "",
              }}
              phone={user?.phone ?? null}
              email={email}
            />
          </div>
        </Panel>

        <Panel title="Kimlik Doğrulama">
          <div className="flex flex-col gap-4 p-4">
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  verified ? "bg-positive-bg text-positive" : "bg-[#F59E0B]/13 text-[#F59E0B]"
                )}
              >
                <ShieldCheck size={20} />
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-[14px] font-bold text-foreground">{verified ? "Hesabınız doğrulanmış" : "Doğrulama bekleniyor"}</span>
                <span className="text-[12px] leading-5 text-muted">
                  Kimlik belgelerinizi aşağıdan yükleyin. Belgeler hesabınızda saklanır.
                </span>
              </div>
            </div>
            <KycUploader docs={kycDocs.map((d) => ({ side: d.side as "FRONT" | "BACK", fileName: d.fileName }))} />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-bg text-brand">
        <Icon size={18} />
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</span>
        <span className="num-tabular text-[22px] font-extrabold text-foreground">{value}</span>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="px-1 text-[12px] font-bold tracking-wide text-muted">{title.toLocaleUpperCase("tr-TR")}</h2>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">{children}</div>
    </section>
  );
}
