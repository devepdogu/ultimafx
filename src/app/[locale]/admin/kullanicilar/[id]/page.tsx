import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma/client";
import { Link } from "@/i18n/navigation";
import { AdminActionForm, AdminField, ADMIN_INPUT, ADMIN_TEXTAREA } from "@/components/admin/AdminForm";
import { AdminInfo, AdminPageHeader, AdminPanel, StatusPill, type PillTone } from "@/components/admin/AdminUi";
import { setUserStatusAction, reviewKycAction } from "@/lib/admin/user-actions";
import { formatDateTime } from "@/lib/utils/format";
import { USER_STATUS } from "@/lib/admin/user-status";

const KYC_TONE: Record<string, { label: string; tone: PillTone }> = {
  PENDING: { label: "İncelenecek", tone: "warning" },
  APPROVED: { label: "Onaylandı", tone: "positive" },
  REJECTED: { label: "Reddedildi", tone: "negative" },
};

const SIDE_LABEL: Record<string, string> = { FRONT: "Ön yüz", BACK: "Arka yüz" };

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      gender: true,
      birthDate: true,
      city: true,
      country: true,
      createdAt: true,
      kycDocuments: { orderBy: { side: "asc" }, select: { id: true, side: true, fileName: true, reviewStatus: true, reviewNote: true, updatedAt: true } },
      _count: { select: { trades: true, fundHoldings: true } },
    },
  });
  if (!user) notFound();

  const st = USER_STATUS[user.status] ?? { label: user.status, tone: "neutral" as PillTone };
  const hasBoth = user.kycDocuments.some((d) => d.side === "FRONT") && user.kycDocuments.some((d) => d.side === "BACK");
  const alreadyApproved = user.kycDocuments.length > 0 && user.kycDocuments.every((d) => d.reviewStatus === "APPROVED");

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <AdminPageHeader
        title={user.name ?? "İsimsiz kullanıcı"}
        description={`${user.email ?? "e-posta yok"} · ${user.phone ?? "telefon yok"}`}
        actions={<Link href="/admin/kullanicilar" className="h-9 rounded-lg border border-border px-3 text-[12px] font-bold leading-9">Listeye dön</Link>}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminPanel title="Hesap">
          <div className="grid grid-cols-2 gap-4">
            <AdminInfo label="Durum" value={<StatusPill tone={st.tone}>{st.label}</StatusPill>} />
            <AdminInfo label="Kayıt" value={formatDateTime(user.createdAt.toISOString())} />
            <AdminInfo label="Cinsiyet" value={user.gender ?? "-"} />
            <AdminInfo label="Doğum tarihi" value={user.birthDate ? user.birthDate.toISOString().slice(0, 10) : "-"} />
            <AdminInfo label="Şehir / ülke" value={[user.city, user.country].filter(Boolean).join(" / ") || "-"} />
            <AdminInfo label="İşlem / pozisyon" value={`${user._count.trades} işlem · ${user._count.fundHoldings} fon`} />
          </div>
          <AdminActionForm action={setUserStatusAction} submitLabel="Durumu kaydet">
            <input type="hidden" name="userId" value={user.id} />
            <AdminField label="Hesap durumu" hint="Askıya alınan veya kapatılan hesap giriş yapamaz ve işlem açamaz.">
              <select name="status" defaultValue={user.status} className={ADMIN_INPUT}>
                <option value="ACTIVE">Aktif</option>
                <option value="PENDING_VERIFICATION">Doğrulama bekliyor</option>
                <option value="SUSPENDED">Askıda</option>
                <option value="CLOSED">Kapalı</option>
              </select>
            </AdminField>
          </AdminActionForm>
        </AdminPanel>

        <AdminPanel title="KYC belgeleri" description="Kimlik ön ve arka yüzünü inceleyin, ardından karar verin.">
          {user.kycDocuments.length === 0 ? (
            <p className="text-[13px] text-muted">Kullanıcı henüz belge yüklemedi.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {user.kycDocuments.map((d) => {
                const k = KYC_TONE[d.reviewStatus] ?? KYC_TONE.PENDING;
                return (
                  <div key={d.id} className="flex flex-col gap-2 rounded-xl border border-border bg-surface-2 p-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 flex-col">
                        <span className="text-[13px] font-bold">{SIDE_LABEL[d.side] ?? d.side}</span>
                        <span className="truncate text-[11px] text-muted">{d.fileName}</span>
                      </div>
                      <StatusPill tone={k.tone}>{k.label}</StatusPill>
                    </div>
                    {d.reviewNote && <p className="text-[12px] text-negative">Not: {d.reviewNote}</p>}
                    <a href={`/api/admin/kyc/${d.id}`} target="_blank" rel="noreferrer" className="text-[12px] font-bold text-brand">
                      Belgeyi aç
                    </a>
                  </div>
                );
              })}
            </div>
          )}

          {!hasBoth && user.kycDocuments.length > 0 && (
            <p className="rounded-lg bg-[#F59E0B]/13 px-3 py-2 text-[12px] font-semibold text-[#F59E0B]">Ön ve arka yüz birlikte yüklenmeli.</p>
          )}

          {hasBoth && !alreadyApproved && (
            <div className="flex flex-col gap-5 border-t border-border pt-5">
              <AdminActionForm action={reviewKycAction} submitLabel="Onayla ve hesabı aktif et">
                <input type="hidden" name="userId" value={user.id} />
                <input type="hidden" name="decision" value="approve" />
                <p className="text-[12px] text-muted">Belgeler okunaklıysa onaylayın. Hesap aktif olur ve kullanıcı işlem yapabilir.</p>
              </AdminActionForm>

              <AdminActionForm action={reviewKycAction} submitLabel="Reddet ve nedeni gönder">
                <input type="hidden" name="userId" value={user.id} />
                <input type="hidden" name="decision" value="reject" />
                <AdminField label="Red nedeni" hint="Kullanıcı bu notu profil sayfasında görür.">
                  <textarea name="note" required rows={2} placeholder="Örnek: Belge okunmuyor, daha net bir fotoğraf yükleyin." className={ADMIN_TEXTAREA} />
                </AdminField>
              </AdminActionForm>
            </div>
          )}

          {alreadyApproved && <p className="text-[13px] font-semibold text-positive">Belgeler onaylandı.</p>}
        </AdminPanel>
      </div>
    </div>
  );
}
