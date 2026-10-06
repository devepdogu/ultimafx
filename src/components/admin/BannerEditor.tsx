"use client";

import { AdminActionForm, AdminField, ADMIN_INPUT } from "@/components/admin/AdminForm";
import { ImageField } from "@/components/admin/ImageField";
import { saveBannerAction } from "@/lib/admin/banner-actions";

export interface BannerValues {
  id?: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  position: number;
}

/** Banner form for create and edit. The image is uploaded from the device, not typed as a link. */
export function BannerEditor({ banner }: { banner?: BannerValues }) {
  return (
    <AdminActionForm action={saveBannerAction} submitLabel={banner ? "Değişiklikleri kaydet" : "Banner ekle"}>
      {banner?.id && <input type="hidden" name="id" value={banner.id} />}
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Başlık">
          <input name="title" required defaultValue={banner?.title} className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Alt metin" hint="İsteğe bağlı.">
          <input name="subtitle" defaultValue={banner?.subtitle ?? ""} className={ADMIN_INPUT} />
        </AdminField>
        <ImageField name="imageUrl" label="Görsel" defaultValue={banner?.imageUrl} />
        <div className="flex flex-col gap-4">
          <AdminField label="Tıklanınca gidilecek bağlantı" hint="İsteğe bağlı. Örnek: /halka-arz">
            <input name="linkUrl" defaultValue={banner?.linkUrl ?? ""} className={ADMIN_INPUT} />
          </AdminField>
          <AdminField label="Sıra" hint="Küçük sayı önce gösterilir.">
            <input name="position" type="number" min={0} defaultValue={banner?.position ?? 0} className={ADMIN_INPUT} />
          </AdminField>
        </div>
      </div>
    </AdminActionForm>
  );
}
