import { headers } from "next/headers";
import { requireUserForPage } from "@/lib/auth/rbac";
import { ensureReferralCode, getReferralStats } from "@/lib/referrals";
import { Card } from "@/components/ui/Card";
import { ShareInvite } from "@/components/referrals/ShareInvite";
import { Gift, Users } from "lucide-react";

export default async function RewardsPage() {
  const user = await requireUserForPage();
  const code = await ensureReferralCode(user.id);
  const { invitedCount } = await getReferralStats(user.id);

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const inviteUrl = `${proto}://${host}/kayit?ref=${code}`;

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <h1 className="text-xl font-bold">Ödüller &amp; Davet Et</h1>

      <Card elevated className="flex flex-col items-center gap-3 py-6 text-center">
        <Gift size={28} className="text-brand" />
        <div className="text-sm text-muted">Davet kodunuz</div>
        <div className="num-tabular text-2xl font-bold tracking-widest">{code}</div>
        <ShareInvite url={inviteUrl} />
      </Card>

      <Card className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Users size={16} className="text-muted" /> Davet ettiğiniz kişi
        </div>
        <div className="num-tabular text-lg font-semibold">{invitedCount}</div>
      </Card>

      <p className="text-xs text-muted">
        Davet bağlantınızla kayıt olan her kullanıcı burada sayılır. Ödül kuralları henüz tanımlanmadığı için
        bu sayfada ödül tutarı gösterilmez.
      </p>
    </div>
  );
}
