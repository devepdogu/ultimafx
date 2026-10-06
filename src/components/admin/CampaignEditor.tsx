"use client";

import { AdminActionForm, AdminField, ADMIN_INPUT, ADMIN_TEXTAREA } from "@/components/admin/AdminForm";
import { saveCampaignAction } from "@/lib/admin/campaign-actions";

export interface CampaignValues {
  id?: string;
  title: string;
  tagline: string;
  description: string;
  rewardLabel: string;
  category: string;
  status: "ACTIVE" | "UPCOMING" | "ENDED";
  isFeatured: boolean;
  position: number;
}

const CATEGORIES = ["Hoş geldin", "İşlem hacmi", "VIP", "Sadakat", "Eğitim", "Yatırım bonusu", "Yarışma"];

/** Campaign form used for both creating and editing. Each field says what it changes on the user side. */
export function CampaignEditor({ campaign }: { campaign?: CampaignValues }) {
  return (
    <AdminActionForm action={saveCampaignAction} submitLabel={campaign ? "Değişiklikleri kaydet" : "Kampanya ekle"}>
      {campaign?.id && <input type="hidden" name="id" value={campaign.id} />}
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Başlık" hint="Kartın en üstünde büyük görünür.">
          <input name="title" required defaultValue={campaign?.title} className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Alt başlık" hint="Başlığın altındaki kısa mavi satır.">
          <input name="tagline" required defaultValue={campaign?.tagline} className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Açıklama" hint="Kampanya koşullarını anlatır. En az 10 karakter." className="md:col-span-2">
          <textarea name="description" required rows={3} defaultValue={campaign?.description} className={ADMIN_TEXTAREA} />
        </AdminField>
        <AdminField label="Ödül metni" hint="Örnek: 5.000 ₺'ye varan">
          <input name="rewardLabel" required defaultValue={campaign?.rewardLabel} className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Kategori" hint="İkonu belirler.">
          <select name="category" defaultValue={campaign?.category ?? "Hoş geldin"} className={ADMIN_INPUT}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField label="Durum" hint="Aktif kampanyalar üstte, diğerleri 'Tamamlanan & gelecek' altında görünür.">
          <select name="status" defaultValue={campaign?.status ?? "ACTIVE"} className={ADMIN_INPUT}>
            <option value="ACTIVE">Aktif</option>
            <option value="UPCOMING">Yakında</option>
            <option value="ENDED">Sona erdi</option>
          </select>
        </AdminField>
        <AdminField label="Sıra" hint="Küçük sayı önce gelir.">
          <input name="position" type="number" min={0} max={1000} defaultValue={campaign?.position ?? 0} className={ADMIN_INPUT} />
        </AdminField>
        <label className="flex items-center gap-3 self-end pb-2 text-[13px] font-bold">
          <input name="isFeatured" type="checkbox" defaultChecked={campaign?.isFeatured} className="h-4 w-4 accent-brand" />
          Öne çıkar (kartta ÖNE ÇIKAN etiketi ve vurgu)
        </label>
      </div>
    </AdminActionForm>
  );
}
