"use client";

import { AdminActionForm, AdminField, ADMIN_INPUT, ADMIN_TEXTAREA } from "@/components/admin/AdminForm";
import { saveFundAction } from "@/lib/admin/fund-actions";

export interface FundValues {
  id?: string;
  name: string;
  companyName: string;
  category: string;
  description: string | null;
  risk: number;
  unitPrice: number | null;
  ytdReturn: number | null;
  oneYearReturn: number | null;
  aum: number | null;
  investorCount: number | null;
  position: number;
}

const CATEGORIES = ["Para Piyasası", "Hisse Senedi", "Altın", "Sektörel", "Yabancı", "Kira Sertifikası", "Karma", "Tahvil"];

/** Fund form for create and edit. Unit price and returns stay optional until the fund publishes them. */
export function FundEditor({ fund }: { fund?: FundValues }) {
  return (
    <AdminActionForm action={saveFundAction} submitLabel={fund ? "Değişiklikleri kaydet" : "Fon ekle"}>
      {fund?.id && <input type="hidden" name="id" value={fund.id} />}
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Fon adı" className="md:col-span-2">
          <input name="name" required defaultValue={fund?.name} className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Yönetici şirket" hint="Örnek: Ak Portföy Yönetimi A.Ş.">
          <input name="companyName" required defaultValue={fund?.companyName} className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Kategori" hint="Kullanıcı filtresinde bu adla görünür.">
          <select name="category" defaultValue={fund?.category ?? "Hisse Senedi"} className={ADMIN_INPUT}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField label="Açıklama" className="md:col-span-2">
          <textarea name="description" rows={2} defaultValue={fund?.description ?? ""} className={ADMIN_TEXTAREA} />
        </AdminField>
        <AdminField label="Risk (1-7)" hint="7 en yüksek risk.">
          <input name="risk" type="number" min={1} max={7} required defaultValue={fund?.risk ?? 4} className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Birim pay (TL)" hint="Alım ve satım bu fiyattan yapılır. Boşsa alım kapalı kalır.">
          <input name="unitPrice" type="number" step="0.000001" min={0} defaultValue={fund?.unitPrice ?? ""} className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="YTD getiri (%)">
          <input name="ytdReturn" type="number" step="0.01" defaultValue={fund?.ytdReturn ?? ""} className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="1 yıl getiri (%)">
          <input name="oneYearReturn" type="number" step="0.01" defaultValue={fund?.oneYearReturn ?? ""} className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Fon büyüklüğü (TL)">
          <input name="aum" type="number" step="1" min={0} defaultValue={fund?.aum ?? ""} className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Yatırımcı sayısı">
          <input name="investorCount" type="number" step="1" min={0} defaultValue={fund?.investorCount ?? ""} className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Sıra" hint="Küçük sayı önce gelir.">
          <input name="position" type="number" min={0} max={1000} defaultValue={fund?.position ?? 0} className={ADMIN_INPUT} />
        </AdminField>
      </div>
    </AdminActionForm>
  );
}
