import { ReviewRequestForm } from "@/components/admin/ReviewRequestForm";
import { ProviderBadge } from "@/components/admin/ProviderBadge";
import { StatusPill, type PillTone } from "@/components/admin/AdminUi";
import type { WalletActionResult } from "@/lib/wallet/actions";

const STATUS: Record<string, { label: string; tone: PillTone }> = {
  PENDING: { label: "Bekliyor", tone: "warning" },
  APPROVED: { label: "Onaylandı", tone: "positive" },
  COMPLETED: { label: "Tamamlandı", tone: "positive" },
  REJECTED: { label: "Reddedildi", tone: "negative" },
  FAILED: { label: "Başarısız", tone: "negative" },
};

export interface RequestProvider {
  label: string;
  color: string;
  logoUrl?: string | null;
}

/**
 * One deposit or withdrawal request as a card. Provider badge and destination come first so the admin
 * can check the account before approving; approve and reject only appear while the request is pending.
 */
export function RequestCard({
  id,
  email,
  amount,
  reference,
  provider,
  detail,
  requestedAt,
  status,
  approve,
  reject,
}: {
  id: string;
  email: string;
  amount: string;
  reference: string | null;
  provider: RequestProvider;
  detail: string;
  requestedAt: string;
  status: string;
  approve: (prev: WalletActionResult, formData: FormData) => Promise<WalletActionResult>;
  reject: (prev: WalletActionResult, formData: FormData) => Promise<WalletActionResult>;
}) {
  const st = STATUS[status] ?? { label: status, tone: "neutral" as PillTone };
  const pending = status === "PENDING";

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <ProviderBadge label={provider.label} color={provider.color} logoUrl={provider.logoUrl} size={44} />
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="num-tabular text-[18px] font-extrabold">{amount}</span>
            <StatusPill tone={st.tone}>{st.label}</StatusPill>
          </div>
          <span className="truncate text-[13px] font-semibold">{email}</span>
          <span className="break-all font-mono text-[12px] text-muted">{provider.label} · {detail}</span>
          <div className="flex flex-wrap gap-x-3 text-[11px] text-muted">
            <span>{requestedAt}</span>
            {reference && <span className="font-mono">Referans: {reference}</span>}
          </div>
        </div>
      </div>
      {pending && (
        <div className="flex shrink-0 flex-wrap gap-2">
          <ReviewRequestForm id={id} action={approve} variant="approve" />
          <ReviewRequestForm id={id} action={reject} variant="reject" />
        </div>
      )}
    </article>
  );
}
