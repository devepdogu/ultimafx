import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma/client";
import { Link } from "@/i18n/navigation";
import { AdminActionForm, AdminField, ADMIN_INPUT, ADMIN_TEXTAREA } from "@/components/admin/AdminForm";
import { AdminInfo, AdminPageHeader, AdminPanel, StatusPill, type PillTone } from "@/components/admin/AdminUi";
import {
  adjustUserBalanceAction,
  reviewKycAction,
  setUserPasswordAction,
  setUserStatusAction,
  updateHoldingQuantityAction,
} from "@/lib/admin/user-actions";
import { RevealPasswordButton } from "@/components/admin/RevealPasswordButton";
import { formatDateTime } from "@/lib/utils/format";
import { USER_STATUS } from "@/lib/admin/user-status";

const KYC_TONE: Record<string, { label: string; tone: PillTone }> = {
  PENDING: { label: "İncelenecek", tone: "warning" },
  APPROVED: { label: "Onaylandı", tone: "positive" },
  REJECTED: { label: "Reddedildi", tone: "negative" },
};

const SIDE_LABEL: Record<string, string> = { FRONT: "Ön yüz", BACK: "Arka yüz" };
const num = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const qty = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 6 });

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      phone: true,
      tcKimlikHash: true,
      status: true,
      gender: true,
      birthDate: true,
      city: true,
      country: true,
      locale: true,
      referralCode: true,
      referredById: true,
      termsAcceptedAt: true,
      kvkkAcceptedAt: true,
      passwordEncrypted: true,
      createdAt: true,
      updatedAt: true,
      roles: { select: { role: { select: { name: true } } } },
      kycDocuments: { orderBy: { side: "asc" }, select: { id: true, side: true, fileName: true, reviewStatus: true, reviewNote: true, updatedAt: true } },
      wallet: { select: { cashBalance: true, usdBalance: true, pendingBalance: true } },
      _count: {
        select: {
          trades: true,
          orders: true,
          fundHoldings: true,
          deposits: true,
          withdrawals: true,
          notifications: true,
          watchlists: true,
          priceAlerts: true,
        },
      },
      portfolio: {
        select: {
          holdings: {
            select: { id: true, quantity: true, averageCost: true, asset: { select: { symbol: true, name: true, currency: true, logoUrl: true } } },
            orderBy: { updatedAt: "desc" },
          },
        },
      },
    },
  });
  if (!user) notFound();

  const st = USER_STATUS[user.status] ?? { label: user.status, tone: "neutral" as PillTone };
  const hasBoth = user.kycDocuments.some((d) => d.side === "FRONT") && user.kycDocuments.some((d) => d.side === "BACK");
  const alreadyApproved = user.kycDocuments.length > 0 && user.kycDocuments.every((d) => d.reviewStatus === "APPROVED");
  const holdings = user.portfolio?.holdings ?? [];

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
            <AdminInfo label="Son güncelleme" value={formatDateTime(user.updatedAt.toISOString())} />
            <AdminInfo label="E-posta doğrulandı mı" value={user.emailVerified ? formatDateTime(user.emailVerified.toISOString()) : "Hayır"} />
            <AdminInfo label="TC kimlik" value={user.tcKimlikHash ? "Girilmiş (hash olarak saklanır)" : "Girilmemiş"} />
            <AdminInfo label="Roller" value={user.roles.map((r) => r.role.name).join(", ") || "Kullanıcı"} />
            <AdminInfo label="Cinsiyet" value={user.gender ?? "-"} />
            <AdminInfo label="Doğum tarihi" value={user.birthDate ? user.birthDate.toISOString().slice(0, 10) : "-"} />
            <AdminInfo label="Şehir / ülke" value={[user.city, user.country].filter(Boolean).join(" / ") || "-"} />
            <AdminInfo label="Dil" value={user.locale} />
            <AdminInfo label="Davet kodu" value={user.referralCode ?? "-"} />
            <AdminInfo label="Sözleşme / KVKK onayı" value={user.termsAcceptedAt && user.kvkkAcceptedAt ? "Onaylı" : "Onaylanmamış"} />
            <AdminInfo
              label="İşlem / pozisyon"
              value={`${user._count.trades} işlem · ${user._count.orders} emir · ${holdings.length} pozisyon · ${user._count.fundHoldings} fon`}
            />
            <AdminInfo
              label="Talepler"
              value={`${user._count.deposits} yatırma · ${user._count.withdrawals} çekme · ${user._count.watchlists} liste · ${user._count.priceAlerts} alarm`}
            />
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

        <div className="flex flex-col gap-6">
          <AdminPanel
            title="Şifre"
            description="Giriş kontrolü yine geri döndürülemeyen bir hash ile yapılır; şifre ayrıca şifrelenmiş olarak saklanır ve istediğinizde çözülüp gösterilebilir."
          >
            <div className="flex flex-col gap-3">
              {user.passwordEncrypted ? (
                <RevealPasswordButton userId={user.id} />
              ) : (
                <p className="text-[12px] text-muted">Bu kullanıcı bu özellik eklendikten sonra hiç şifre değiştirmedi, şifre görüntülenemiyor.</p>
              )}
            </div>
            <AdminActionForm action={setUserPasswordAction} submitLabel="Yeni şifreyi kaydet">
              <input type="hidden" name="userId" value={user.id} />
              <div className="grid gap-4 md:grid-cols-2">
                <AdminField label="Yeni şifre">
                  <input name="newPassword" type="password" required minLength={8} className={ADMIN_INPUT} />
                </AdminField>
                <AdminField label="Yeni şifre (tekrar)">
                  <input name="confirmPassword" type="password" required minLength={8} className={ADMIN_INPUT} />
                </AdminField>
              </div>
            </AdminActionForm>
          </AdminPanel>

          <AdminPanel title="Bakiye" description="Para yatırma/çekme talebi dışında, elle ekleme veya çıkarma. Her işlem kullanıcının cüzdan geçmişinde görünür.">
            <div className="grid grid-cols-2 gap-4">
              <AdminInfo label="TL bakiye" value={`${num.format(Number(user.wallet?.cashBalance ?? 0))} TRY`} />
              <AdminInfo label="USD bakiye" value={`${num.format(Number(user.wallet?.usdBalance ?? 0))} USD`} />
            </div>
            {!user.wallet ? (
              <p className="text-[13px] text-muted">Bu kullanıcının henüz cüzdanı yok.</p>
            ) : (
              <AdminActionForm action={adjustUserBalanceAction} submitLabel="Bakiyeyi güncelle">
                <input type="hidden" name="userId" value={user.id} />
                <div className="grid gap-4 md:grid-cols-2">
                  <AdminField label="Yön">
                    <select name="direction" defaultValue="add" className={ADMIN_INPUT}>
                      <option value="add">Ekle</option>
                      <option value="remove">Çıkar</option>
                    </select>
                  </AdminField>
                  <AdminField label="Para birimi">
                    <select name="currency" defaultValue="TRY" className={ADMIN_INPUT}>
                      <option value="TRY">TRY</option>
                      <option value="USD">USD</option>
                    </select>
                  </AdminField>
                  <AdminField label="Tutar">
                    <input name="amount" type="number" step="0.01" min="0.01" required className={ADMIN_INPUT} />
                  </AdminField>
                  <AdminField label="Açıklama" hint="Kullanıcı bunu cüzdan geçmişinde görür." className="md:col-span-2">
                    <textarea name="reason" rows={2} required className={ADMIN_TEXTAREA} />
                  </AdminField>
                </div>
              </AdminActionForm>
            )}
          </AdminPanel>
        </div>
      </div>

      <AdminPanel title={`Pozisyonlar (${holdings.length})`} description="Adet (lot) ve maliyeti elle düzeltin. Bu bir alım/satım değildir — nakit hareket etmez.">
        {holdings.length === 0 ? (
          <p className="text-[13px] text-muted">Kullanıcının açık pozisyonu yok.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {holdings.map((h) => (
              <details key={h.id} className="overflow-hidden rounded-xl border border-border">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                  <div className="flex min-w-0 flex-col">
                    <span className="text-[13px] font-bold">{h.asset.symbol}</span>
                    <span className="truncate text-[11px] text-muted">
                      {qty.format(Number(h.quantity))} adet · ort. maliyet {num.format(Number(h.averageCost))} {h.asset.currency}
                    </span>
                  </div>
                  <span className="shrink-0 text-[12px] font-bold text-brand">Düzenle</span>
                </summary>
                <div className="border-t border-border px-4 py-4">
                  <AdminActionForm action={updateHoldingQuantityAction} submitLabel="Pozisyonu kaydet">
                    <input type="hidden" name="holdingId" value={h.id} />
                    <input type="hidden" name="userId" value={user.id} />
                    <div className="grid gap-4 md:grid-cols-2">
                      <AdminField label="Adet (lot)" hint="0 girilirse pozisyon kapatılır.">
                        <input name="quantity" type="number" step="0.000001" min="0" required defaultValue={h.quantity.toString()} className={ADMIN_INPUT} />
                      </AdminField>
                      <AdminField label={`Ortalama maliyet (${h.asset.currency})`}>
                        <input name="averageCost" type="number" step="0.000001" min="0" required defaultValue={h.averageCost.toString()} className={ADMIN_INPUT} />
                      </AdminField>
                    </div>
                  </AdminActionForm>
                </div>
              </details>
            ))}
          </div>
        )}
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
  );
}
