import type { PillTone } from "@/components/admin/AdminUi";

/** Account status labels and tones, shared by the admin user list and detail pages. */
export const USER_STATUS: Record<string, { label: string; tone: PillTone }> = {
  ACTIVE: { label: "Aktif", tone: "positive" },
  PENDING_VERIFICATION: { label: "Doğrulama bekliyor", tone: "warning" },
  SUSPENDED: { label: "Askıda", tone: "negative" },
  CLOSED: { label: "Kapalı", tone: "neutral" },
};
