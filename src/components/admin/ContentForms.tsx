"use client";

import { useState, useTransition } from "react";
import { AdminActionForm, AdminField, ADMIN_INPUT, ADMIN_TEXTAREA } from "@/components/admin/AdminForm";
import { updateSiteSettingsAction } from "@/lib/admin/site-actions";
import { createTermDepositProductAction } from "@/lib/admin/term-deposit-actions";
import { createCryptoAddressAction } from "@/lib/admin/crypto-address-actions";
import { createBankAccountAction } from "@/lib/admin/bank-account-actions";
import { createIpoAction } from "@/lib/admin/feed-actions";
import { createAssetAction, createNewsArticleAction, type AdminActionResult } from "@/lib/admin/content-actions";
import { Button } from "@/components/ui/Button";
import { ImageField } from "@/components/admin/ImageField";

/** Generic toggle that runs a server action with an id and shows its result. */
export function ToggleButton({
  label,
  run,
  variant = "secondary",
}: {
  label: string;
  run: () => Promise<AdminActionResult>;
  variant?: "primary" | "secondary";
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<AdminActionResult | null>(null);
  return (
    <span className="flex flex-col items-end gap-1">
      <Button
        type="button"
        size="sm"
        variant={variant}
        disabled={pending}
        onClick={() => startTransition(async () => { setResult(await run()); })}
      >
        {pending ? "Çalışıyor…" : label}
      </Button>
      {result?.error && <span className="max-w-xs text-right text-xs text-negative">{result.error}</span>}
      {result?.success && <span className="max-w-xs text-right text-xs text-positive">{result.success}</span>}
    </span>
  );
}

const ASSET_TYPES = [
  { value: "US_STOCK", label: "Nasdaq / ABD hisse" },
  { value: "STOCK", label: "BIST hisse" },
  { value: "INDEX", label: "Endeks" },
  { value: "CURRENCY", label: "Parite (döviz)" },
  { value: "COMMODITY", label: "Emtia / altın" },
  { value: "CRYPTO", label: "Kripto" },
  { value: "FUND", label: "Fon" },
];

export function AssetCreateForm() {
  return (
    <AdminActionForm action={createAssetAction} submitLabel="Varlığı ekle">
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Sembol" hint="Büyük harfle. Örnek: AAPL, THYAO, USDTRY">
          <input name="symbol" required className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Varlık adı">
          <input name="name" required className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Tür" hint="Piyasa saatleri ve fiyat kaynağı türe göre belirlenir.">
          <select name="type" required defaultValue="US_STOCK" className={ADMIN_INPUT}>
            {ASSET_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField label="Para birimi" hint="Üç harf. Örnek: USD, TRY">
          <input name="currency" defaultValue="USD" maxLength={3} className={ADMIN_INPUT} />
        </AdminField>
        <ImageField name="logoUrl" label="Logo" hint="İsteğe bağlı. Kare bir görsel en iyi sonucu verir." className="md:col-span-2" />
        <label className="flex items-center gap-3 text-[13px] font-bold">
          <input type="checkbox" name="tradingEnabled" className="h-4 w-4 accent-brand" />
          Sanal işleme açık
        </label>
      </div>
    </AdminActionForm>
  );
}

const NEWS_CATEGORIES = [
  { value: "BORSA", label: "BIST" },
  { value: "EKONOMI", label: "Ekonomi" },
  { value: "SIRKET_HABERLERI", label: "Şirket haberleri" },
  { value: "DUNYA", label: "Dünya" },
  { value: "DOVIZ", label: "Döviz" },
  { value: "ALTIN", label: "Altın" },
  { value: "KRIPTO", label: "Kripto" },
  { value: "EMTIA", label: "Emtia" },
  { value: "HALKA_ARZ", label: "Halka arz" },
  { value: "TEMETTU", label: "Temettü" },
  { value: "KAP", label: "KAP" },
];

export function NewsCreateForm() {
  return (
    <AdminActionForm action={createNewsArticleAction} submitLabel="Haberi yayınla">
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Başlık" className="md:col-span-2">
          <input name="title" required className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Kısa özet" hint="İsteğe bağlı. Haber kartında başlığın altında görünür." className="md:col-span-2">
          <textarea name="summary" rows={2} className={ADMIN_TEXTAREA} />
        </AdminField>
        <AdminField label="Kaynak adı" hint="Örnek: Bloomberg HT">
          <input name="sourceName" required className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Haberin kaynak bağlantısı" hint="https:// ile başlamalı.">
          <input name="originalUrl" type="url" required className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Kategori" hint="Haberler sayfasındaki sekmeyi belirler.">
          <select name="category" required defaultValue="BORSA" className={ADMIN_INPUT}>
            {NEWS_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </AdminField>
        <ImageField name="imageUrl" label="Görsel" hint="İsteğe bağlı." />
        <AdminField label="Yayın tarihi" hint="Boş bırakılırsa şu an yayınlanır.">
          <input name="publishedAt" type="datetime-local" className={ADMIN_INPUT} />
        </AdminField>
      </div>
    </AdminActionForm>
  );
}

export function SiteSettingsForm({ siteName, logoUrl, liveChatCode }: { siteName: string; logoUrl: string; liveChatCode: string }) {
  return (
    <AdminActionForm action={updateSiteSettingsAction} submitLabel="Ayarları kaydet">
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Site adı" hint="Üst bar ve sayfa başlıklarında görünür.">
          <input name="siteName" defaultValue={siteName} required minLength={2} maxLength={60} className={ADMIN_INPUT} />
        </AdminField>
        <ImageField name="logoUrl" label="Logo" defaultValue={logoUrl} hint="Boş bırakılırsa varsayılan logo kullanılır." />
        <AdminField
          label="Canlı destek kodu"
          hint="Sağlayıcınızın (Tawk.to, Crisp, Intercom vb.) verdiği embed kodunu olduğu gibi yapıştırın. Her sayfada, en altta çalışır. Boş bırakılırsa hiçbir şey eklenmez. Bu alan olduğu gibi siteye basılır — yalnızca güvendiğiniz bir sağlayıcıdan gelen kodu yapıştırın."
          className="md:col-span-2"
        >
          <textarea
            name="liveChatCode"
            rows={6}
            defaultValue={liveChatCode}
            placeholder={'<script>\n  // sağlayıcınızın verdiği kod\n</script>'}
            className={`${ADMIN_TEXTAREA} font-mono text-[12px]`}
          />
        </AdminField>
      </div>
    </AdminActionForm>
  );
}

export function TermDepositCreateForm() {
  return (
    <AdminActionForm action={createTermDepositProductAction} submitLabel="Vadeli mevduat ürünü ekle">
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Para birimi">
          <select name="currency" defaultValue="TRY" className={ADMIN_INPUT}>
            <option value="TRY">TL</option>
            <option value="USD">USD</option>
          </select>
        </AdminField>
        <AdminField label="Vade (gün)" hint="1 ile 3650 arası.">
          <input name="termDays" type="number" min={1} max={3650} required className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Yıllık basit faiz (%)" hint="Örnek: 42.5">
          <input name="annualRate" type="number" step="0.01" min={0} required className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Minimum tutar">
          <input name="minAmount" type="number" step="0.01" min={0} required className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Sıra">
          <input name="position" type="number" min={0} defaultValue={0} className={ADMIN_INPUT} />
        </AdminField>
      </div>
    </AdminActionForm>
  );
}

export function BankAccountCreateForm() {
  return (
    <AdminActionForm action={createBankAccountAction} submitLabel="Banka hesabı ekle">
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Banka adı" hint="Örnek: Ziraat Bankası">
          <input name="bankName" required className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Şube" hint="İsteğe bağlı.">
          <input name="branch" className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="IBAN" hint="TR ile başlayan 26 haneli IBAN." className="md:col-span-2">
          <input name="iban" required className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Hesap sahibi" hint="Ad soyad veya unvan." className="md:col-span-2">
          <input name="accountHolder" required className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Yatırımcıya not" hint="İsteğe bağlı. Örnek: açıklama alanına referans kodunu yazın." className="md:col-span-2">
          <textarea name="instructions" rows={2} className={ADMIN_TEXTAREA} />
        </AdminField>
      </div>
    </AdminActionForm>
  );
}

const IPO_STATUSES = [
  { value: "UPCOMING", label: "Yakında" },
  { value: "ACTIVE", label: "Talep toplanıyor" },
  { value: "COMPLETED", label: "Tamamlandı" },
  { value: "CANCELLED", label: "İptal" },
];

export function IpoCreateForm() {
  return (
    <AdminActionForm action={createIpoAction} submitLabel="Halka arzı ekle">
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Kod" hint="Örnek: ABCDE">
          <input name="code" required className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Şirket adı">
          <input name="companyName" required className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Pazar" hint="Örnek: Yıldız Pazar">
          <input name="market" className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Durum">
          <select name="status" defaultValue="UPCOMING" className={ADMIN_INPUT}>
            {IPO_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField label="Fiyat (en düşük, TL)">
          <input name="ipoPriceMin" type="number" step="0.01" min={0} className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Fiyat (en yüksek, TL)">
          <input name="ipoPriceMax" type="number" step="0.01" min={0} className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Talep başlangıcı">
          <input name="demandCollectionStart" type="datetime-local" className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Talep bitişi">
          <input name="demandCollectionEnd" type="datetime-local" className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Resmi kaynak bağlantısı" hint="KAP veya şirketin duyurusu." className="md:col-span-2">
          <input name="officialSourceUrl" type="url" className={ADMIN_INPUT} />
        </AdminField>
      </div>
    </AdminActionForm>
  );
}

const CRYPTO_NETWORKS = ["TRC20", "ERC20", "BEP20"];

export function CryptoAddressCreateForm() {
  return (
    <AdminActionForm action={createCryptoAddressAction} submitLabel="Adresi ekle">
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Ağ" hint="Yatırımcının seçeceği ağ. Yanlış ağ para kaybına yol açar.">
          <select name="network" required defaultValue="TRC20" className={ADMIN_INPUT}>
            {CRYPTO_NETWORKS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField label="Etiket" hint="Örnek: Ana cüzdan">
          <input name="label" required className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Cüzdan adresi" className="md:col-span-2">
          <input name="address" required className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Sıra">
          <input name="position" type="number" min={0} defaultValue={0} className={ADMIN_INPUT} />
        </AdminField>
      </div>
    </AdminActionForm>
  );
}
