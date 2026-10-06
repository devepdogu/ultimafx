"use client";

import { useActionState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { updateSiteSettingsAction } from "@/lib/admin/site-actions";
import {
  createAssetAction,
  createBannerAction,
  createInvestmentFundAction,
  createNewsArticleAction,
  type AdminActionResult,
} from "@/lib/admin/content-actions";

const initial: AdminActionResult = {};

const inputClass = "rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand";

function FormResult({ state }: { state: AdminActionResult }) {
  if (state.error) return <p className="text-sm text-negative">{state.error}</p>;
  if (state.success) return <p className="text-sm text-positive">{state.success}</p>;
  return null;
}

export function AssetCreateForm() {
  const [state, action, pending] = useActionState(createAssetAction, initial);
  return (
    <form action={action} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <input name="symbol" placeholder="Sembol (ör. AAPL)" required className={inputClass} />
      <input name="name" placeholder="Şirket / varlık adı" required className={inputClass} />
      <select name="type" required className={inputClass} defaultValue="US_STOCK">
        <option value="US_STOCK">Nasdaq / ABD hisse</option>
        <option value="STOCK">BIST hisse</option>
        <option value="INDEX">Endeks</option>
        <option value="CURRENCY">Parite (döviz)</option>
        <option value="COMMODITY">Emtia / altın</option>
        <option value="CRYPTO">Kripto</option>
        <option value="FUND">Fon</option>
      </select>
      <input name="currency" placeholder="Para birimi (USD, TRY)" defaultValue="USD" maxLength={3} className={inputClass} />
      <input name="logoUrl" placeholder="Logo bağlantısı (opsiyonel, https://)" className={inputClass} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="tradingEnabled" /> Sanal işleme açık
      </label>
      <div className="sm:col-span-2 flex items-center gap-3">
        <Button type="submit" loading={pending}>Varlık ekle</Button>
        <FormResult state={state} />
      </div>
    </form>
  );
}

export function NewsCreateForm() {
  const [state, action, pending] = useActionState(createNewsArticleAction, initial);
  return (
    <form action={action} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <input name="title" placeholder="Başlık" required className={`${inputClass} sm:col-span-2`} />
      <textarea name="summary" placeholder="Kısa özet (opsiyonel)" rows={2} className={`${inputClass} sm:col-span-2`} />
      <input name="sourceName" placeholder="Kaynak adı (ör. Bloomberg HT)" required className={inputClass} />
      <input name="originalUrl" type="url" placeholder="Haberin kaynak bağlantısı (https://)" required className={inputClass} />
      <select name="category" required className={inputClass} defaultValue="BORSA">
        <option value="BORSA">BIST</option>
        <option value="EKONOMI">Ekonomi</option>
        <option value="SIRKET_HABERLERI">Şirket haberleri</option>
        <option value="DUNYA">Dünya</option>
        <option value="DOVIZ">Döviz</option>
        <option value="ALTIN">Altın</option>
        <option value="KRIPTO">Kripto</option>
        <option value="EMTIA">Emtia</option>
        <option value="HALKA_ARZ">Halka arz</option>
        <option value="TEMETTU">Temettü</option>
        <option value="KAP">KAP</option>
      </select>
      <input name="imageUrl" type="url" placeholder="Görsel bağlantısı (opsiyonel)" className={inputClass} />
      <input name="publishedAt" type="datetime-local" className={inputClass} />
      <div className="sm:col-span-2 flex items-center gap-3">
        <Button type="submit" loading={pending}>Haberi yayınla</Button>
        <FormResult state={state} />
      </div>
    </form>
  );
}

export function BannerCreateForm() {
  const [state, action, pending] = useActionState(createBannerAction, initial);
  return (
    <form action={action} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <input name="title" placeholder="Başlık" required className={inputClass} />
      <input name="subtitle" placeholder="Alt metin (opsiyonel)" className={inputClass} />
      <input name="imageUrl" type="url" placeholder="Görsel bağlantısı (opsiyonel)" className={inputClass} />
      <input name="linkUrl" type="url" placeholder="Tıklanınca gidilecek bağlantı (opsiyonel)" className={inputClass} />
      <input name="position" type="number" min={0} defaultValue={0} className={inputClass} />
      <div className="sm:col-span-2 flex items-center gap-3">
        <Button type="submit" loading={pending}>Banner ekle</Button>
        <FormResult state={state} />
      </div>
    </form>
  );
}

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
  return (
    <Button
      type="button"
      size="sm"
      variant={variant}
      disabled={pending}
      onClick={() => startTransition(async () => { await run(); })}
    >
      {label}
    </Button>
  );
}

export function FundCreateForm() {
  const [state, action, pending] = useActionState(createInvestmentFundAction, initial);
  return (
    <form action={action} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <input name="name" placeholder="Fon adı" required className={inputClass} />
      <input name="companyName" placeholder="Portföy yönetim şirketi" required className={inputClass} />
      <input name="category" placeholder="Kategori (örn. YABANCI, ALTIN)" required className={inputClass} />
      <input name="risk" type="number" min={1} max={7} placeholder="Risk (1-7)" required className={inputClass} />
      <input name="description" placeholder="Açıklama (opsiyonel)" className={inputClass} />
      <input name="unitPrice" type="number" step="any" placeholder="Birim pay fiyatı (TRY)" className={inputClass} />
      <input name="ytdReturn" type="number" step="any" placeholder="YTD getiri (%)" className={inputClass} />
      <input name="oneYearReturn" type="number" step="any" placeholder="1 yıllık getiri (%)" className={inputClass} />
      <input name="aum" type="number" step="any" placeholder="Fon büyüklüğü (TRY)" className={inputClass} />
      <input name="investorCount" type="number" min={0} placeholder="Yatırımcı sayısı" className={inputClass} />
      <input name="position" type="number" min={0} defaultValue={0} placeholder="Sıra" className={inputClass} />
      <div className="sm:col-span-2 flex items-center gap-3">
        <Button type="submit" loading={pending}>Fon ekle</Button>
        <FormResult state={state} />
      </div>
    </form>
  );
}

export function SiteSettingsForm({ siteName, logoUrl }: { siteName: string; logoUrl: string }) {
  const [state, action, pending] = useActionState(updateSiteSettingsAction, initial);
  return (
    <form action={action} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <input name="siteName" defaultValue={siteName} required minLength={2} maxLength={60} placeholder="Site adı" className={inputClass} />
      <input name="logoUrl" type="url" defaultValue={logoUrl} placeholder="Logo bağlantısı (boş bırakılırsa varsayılan logo)" className={inputClass} />
      <div className="sm:col-span-2 flex items-center gap-3">
        <Button type="submit" loading={pending}>Kaydet</Button>
        <FormResult state={state} />
      </div>
    </form>
  );
}
