"use client";

import { useState } from "react";
import { AdminActionForm, AdminField, ADMIN_INPUT, ADMIN_TEXTAREA } from "@/components/admin/AdminForm";
import { ImageField } from "@/components/admin/ImageField";
import { ProviderBadge } from "@/components/admin/ProviderBadge";
import { BANK_PRESETS, CRYPTO_NETWORK_PRESETS, presetFor } from "@/lib/admin/presets";
import {
  saveAssetAction,
  saveBankAction,
  saveCryptoAction,
  saveIpoAction,
  saveNewsAction,
  saveTermProductAction,
  setManualAssetPriceAction,
} from "@/lib/admin/entity-actions";

/** Date for datetime-local inputs, in the server's ISO form trimmed to minutes. */
const toLocalInput = (iso: string | null | undefined) => (iso ? iso.slice(0, 16) : "");

// ---------- Varlık ----------

export interface AssetValues {
  id?: string;
  symbol: string;
  name: string;
  type: string;
  currency: string;
  logoUrl: string | null;
  tradingEnabled: boolean;
  coingeckoId: string | null;
  isCustom: boolean;
  manualBasePrice: number | null;
  manualBandPercent: number | null;
  manualPrice: number | null;
}

/** Common ticker → CoinGecko id, shown as a hint; the admin can still type any other coin's id. */
const COMMON_COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  BNB: "binancecoin",
  SOL: "solana",
  XRP: "ripple",
  DOGE: "dogecoin",
  ADA: "cardano",
  TRX: "tron",
  TON: "the-open-network",
  AVAX: "avalanche-2",
  DOT: "polkadot",
  LINK: "chainlink",
  MATIC: "matic-network",
  LTC: "litecoin",
  SHIB: "shiba-inu",
};

const ASSET_TYPES = [
  { value: "US_STOCK", label: "Nasdaq / ABD hisse" },
  { value: "STOCK", label: "BIST hisse" },
  { value: "INDEX", label: "Endeks" },
  { value: "CURRENCY", label: "Parite (döviz)" },
  { value: "COMMODITY", label: "Emtia / altın" },
  { value: "CRYPTO", label: "Kripto" },
  { value: "FUND", label: "Fon" },
];

export function AssetEditor({ asset }: { asset?: AssetValues }) {
  const [type, setType] = useState(asset?.type ?? "CRYPTO");
  const [symbol, setSymbol] = useState(asset?.symbol ?? "");
  const isCrypto = type === "CRYPTO";
  const guessedId = COMMON_COINGECKO_IDS[symbol.trim().toUpperCase()];
  // Every asset added through this form is a house instrument with no real market, so it is
  // always manual-priced — on create there's nothing to check yet; on edit it's whatever the
  // asset already is (fixed at creation, never toggleable).
  const showManualFields = !asset || asset.isCustom;
  // BIST's own circuit breaker caps a stock's daily move at ±10% — a manual BIST "hisse"
  // can't simulate a wider swing than the real exchange would ever allow. No such cap exists
  // for other asset classes.
  const isBist = type === "STOCK" || type === "INDEX";
  const maxBandPercent = isBist ? 10 : 100;

  return (
    <AdminActionForm action={saveAssetAction} submitLabel={asset ? "Değişiklikleri kaydet" : "Varlığı ekle"}>
      {asset?.id && <input type="hidden" name="id" value={asset.id} />}
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField
          label="Sembol"
          hint={
            asset
              ? "Fiyat kaynağı anahtarıdır, sonradan değiştirilemez."
              : isCrypto
                ? 'Binance\'ta işlem gören ticker, örn. "BTC", "ETH", "PEPE". Binance\'ta karşılığı (SEMBOL/USDT) yoksa fiyat gelmez.'
                : "Büyük harf. Örnek: AAPL, THYAO"
          }
        >
          {asset ? (
            <input value={asset.symbol} disabled readOnly className={ADMIN_INPUT} />
          ) : (
            <input name="symbol" required value={symbol} onChange={(e) => setSymbol(e.target.value)} className={ADMIN_INPUT} />
          )}
        </AdminField>
        <AdminField label="Varlık adı">
          <input name="name" required defaultValue={asset?.name} className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Tür" hint="Piyasa saatleri ve fiyat kaynağı türe göre belirlenir.">
          <select name="type" required value={type} onChange={(e) => setType(e.target.value)} className={ADMIN_INPUT}>
            {ASSET_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField label="Para birimi" hint="Üç harf. Kripto genelde TRY'den alınıp satılır.">
          <input name="currency" required maxLength={3} defaultValue={asset?.currency ?? (isCrypto ? "TRY" : "USD")} className={ADMIN_INPUT} />
        </AdminField>
        {isCrypto && (
          <AdminField
            label="CoinGecko coin id (yalnızca logo için)"
            hint={
              guessedId && !asset
                ? `Bu sembol için önerilen: "${guessedId}". Boş bırakırsanız otomatik kullanılır; fiyatı etkilemez, yalnızca logoyu CoinGecko'dan otomatik çeker.`
                : 'Fiyatı etkilemez — yalnızca kaydederken CoinGecko\'dan logo çekmek için kullanılır. coingecko.com üzerinde coinin sayfa adresindeki son parça, örn. "bitcoin", "ripple". Boş bırakılabilir.'
            }
            className="md:col-span-2"
          >
            <input name="coingeckoId" placeholder={guessedId ?? "örn. bitcoin"} defaultValue={asset?.coingeckoId ?? ""} className={ADMIN_INPUT} />
          </AdminField>
        )}
        <ImageField
          name="logoUrl"
          label="Logo"
          defaultValue={asset?.logoUrl}
          hint={isCrypto ? "İsteğe bağlı. Boş bırakılırsa CoinGecko coin id'sinden otomatik çekilir." : "İsteğe bağlı. Kare bir görsel en iyi sonucu verir."}
        />
        <label className="flex items-center gap-3 text-[13px] font-bold">
          <input type="checkbox" name="tradingEnabled" defaultChecked={asset?.tradingEnabled ?? false} className="h-4 w-4 accent-brand" />
          Sanal işleme açık
        </label>
        {showManualFields && (
          <>
            <AdminField
              label="Taban fiyat"
              hint={
                asset
                  ? "Bu varlık manuel fiyatlıdır. Fiyat buradan başlar ve zamanla dalgalanır, ama belirlediğiniz oynama payının dışına asla çıkmaz."
                  : "Bu varlık piyasadan değil, buradan belirlediğiniz fiyattan başlayıp zamanla dalgalanacak."
              }
              className="md:col-span-2"
            >
              <input
                name="manualBasePrice"
                type="number"
                step="0.000001"
                min="0.000001"
                required
                defaultValue={asset?.manualBasePrice ?? ""}
                className={ADMIN_INPUT}
              />
            </AdminField>
            <AdminField
              label="Oynama payı (%)"
              hint={
                isBist
                  ? "BIST varlığı için en fazla %10 (borsanın günlük tavan/taban kuralı). Örn. 5 girilirse fiyat taban fiyatın ±%5 aralığında kalır."
                  : "Örn. 5 girilirse fiyat taban fiyatın ±%5 aralığında kalır."
              }
            >
              <input
                name="manualBandPercent"
                type="number"
                step="0.01"
                min="0.01"
                max={maxBandPercent}
                required
                defaultValue={asset?.manualBandPercent ?? ""}
                className={ADMIN_INPUT}
              />
            </AdminField>
          </>
        )}
      </div>
    </AdminActionForm>
  );
}

/** Pushes a manual asset's current price up or down to a chosen value, right away — separate
 * from the base-price field above, which re-centers the whole band instead of nudging the
 * live price inside it. */
export function ManualAssetPriceForm({
  assetId,
  currentPrice,
  isBist,
}: {
  assetId: string;
  currentPrice: number | null;
  isBist: boolean;
}) {
  return (
    <AdminActionForm action={setManualAssetPriceAction} submitLabel="Fiyatı uygula">
      <input type="hidden" name="id" value={assetId} />
      <AdminField
        label="Fiyatı şuna ayarla"
        hint={
          isBist
            ? "Taban fiyattan günlük %10'dan fazla uzaklaşamaz (borsanın tavan/taban kuralı) — aşarsanız en yakın sınıra çekilir."
            : "Taban fiyattan ne kadar uzaklaşırsa oynama payı da otomatik olarak buna göre genişler."
        }
      >
        <input name="targetPrice" type="number" step="0.000001" min="0.000001" required defaultValue={currentPrice ?? ""} className={ADMIN_INPUT} />
      </AdminField>
    </AdminActionForm>
  );
}

// ---------- Haber ----------

export interface NewsValues {
  id?: string;
  title: string;
  summary: string | null;
  originalUrl: string;
  category: string;
  imageUrl: string | null;
  sourceName: string;
  publishedAt: string;
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
  { value: "MERKEZ_BANKALARI", label: "Merkez bankaları" },
  { value: "HALKA_ARZ", label: "Halka arz" },
  { value: "SERMAYE_ARTIRIMI", label: "Sermaye artırımı" },
  { value: "TEMETTU", label: "Temettü" },
  { value: "KAP", label: "KAP" },
];

export function NewsEditor({ news }: { news?: NewsValues }) {
  return (
    <AdminActionForm action={saveNewsAction} submitLabel={news ? "Değişiklikleri kaydet" : "Haberi yayınla"}>
      {news?.id && <input type="hidden" name="id" value={news.id} />}
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Başlık" className="md:col-span-2">
          <input name="title" required defaultValue={news?.title} className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Kısa özet" hint="İsteğe bağlı. Haber kartında başlığın altında görünür." className="md:col-span-2">
          <textarea name="summary" rows={2} defaultValue={news?.summary ?? ""} className={ADMIN_TEXTAREA} />
        </AdminField>
        <AdminField label="Kaynak adı" hint="Örnek: Bloomberg HT">
          <input name="sourceName" required defaultValue={news?.sourceName} className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Haberin kaynak bağlantısı" hint="https:// ile başlamalı.">
          <input name="originalUrl" type="url" required defaultValue={news?.originalUrl} className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Kategori" hint="Haberler sayfasındaki sekmeyi belirler.">
          <select name="category" required defaultValue={news?.category ?? "BORSA"} className={ADMIN_INPUT}>
            {NEWS_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField label="Yayın tarihi" hint="Boş bırakılırsa şu an yayınlanır.">
          <input name="publishedAt" type="datetime-local" defaultValue={toLocalInput(news?.publishedAt)} className={ADMIN_INPUT} />
        </AdminField>
        <ImageField name="imageUrl" label="Görsel" defaultValue={news?.imageUrl} hint="İsteğe bağlı." />
      </div>
    </AdminActionForm>
  );
}

// ---------- Halka arz ----------

export interface IpoValues {
  id?: string;
  code: string;
  companyName: string;
  market: string | null;
  status: string;
  ipoPriceMin: number | null;
  ipoPriceMax: number | null;
  demandCollectionStart: string | null;
  demandCollectionEnd: string | null;
  officialSourceUrl: string | null;
  logoUrl: string | null;
}

const IPO_STATUSES = [
  { value: "UPCOMING", label: "Yakında" },
  { value: "ACTIVE", label: "Talep toplanıyor" },
  { value: "COMPLETED", label: "Tamamlandı" },
  { value: "CANCELLED", label: "İptal" },
];

export function IpoEditor({ ipo }: { ipo?: IpoValues }) {
  return (
    <AdminActionForm action={saveIpoAction} submitLabel={ipo ? "Değişiklikleri kaydet" : "Halka arzı ekle"}>
      {ipo?.id && <input type="hidden" name="id" value={ipo.id} />}
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Kod" hint={ipo ? "Kod değiştirilemez." : "Örnek: ABCDE"}>
          {ipo ? <input value={ipo.code} disabled readOnly className={ADMIN_INPUT} /> : <input name="code" required className={ADMIN_INPUT} />}
        </AdminField>
        <AdminField label="Şirket adı">
          <input name="companyName" required defaultValue={ipo?.companyName} className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Pazar" hint="Örnek: Yıldız Pazar">
          <input name="market" defaultValue={ipo?.market ?? ""} className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Durum">
          <select name="status" defaultValue={ipo?.status ?? "UPCOMING"} className={ADMIN_INPUT}>
            {IPO_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField label="Fiyat (en düşük, TL)">
          <input name="ipoPriceMin" type="number" step="0.01" min={0} defaultValue={ipo?.ipoPriceMin ?? ""} className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Fiyat (en yüksek, TL)">
          <input name="ipoPriceMax" type="number" step="0.01" min={0} defaultValue={ipo?.ipoPriceMax ?? ""} className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Talep başlangıcı">
          <input name="demandCollectionStart" type="datetime-local" defaultValue={toLocalInput(ipo?.demandCollectionStart)} className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Talep bitişi">
          <input name="demandCollectionEnd" type="datetime-local" defaultValue={toLocalInput(ipo?.demandCollectionEnd)} className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Resmi kaynak bağlantısı" hint="KAP veya şirketin duyurusu." className="md:col-span-2">
          <input name="officialSourceUrl" type="url" defaultValue={ipo?.officialSourceUrl ?? ""} className={ADMIN_INPUT} />
        </AdminField>
        <ImageField name="logoUrl" label="Şirket logosu" defaultValue={ipo?.logoUrl} hint="İsteğe bağlı. Halka arz listesinde ve detayda görünür." className="md:col-span-2" />
      </div>
    </AdminActionForm>
  );
}

// ---------- Banka hesabı ----------

export interface BankValues {
  id?: string;
  bankName: string;
  branch: string | null;
  iban: string;
  accountHolder: string;
  instructions: string | null;
  logoUrl: string | null;
}

/** Bank is chosen from the list; the badge updates as soon as a bank is picked. */
export function BankEditor({ bank }: { bank?: BankValues }) {
  const [selected, setSelected] = useState(bank?.bankName ?? BANK_PRESETS[0].value);
  const preset = presetFor(BANK_PRESETS, selected);

  return (
    <AdminActionForm action={saveBankAction} submitLabel={bank ? "Değişiklikleri kaydet" : "Banka hesabını ekle"}>
      {bank?.id && <input type="hidden" name="id" value={bank.id} />}
      <div className="flex items-center gap-3 rounded-xl bg-surface-2 p-3">
        <ProviderBadge label={preset.label} color={preset.color} logoUrl={preset.logoUrl} size={40} />
        <div className="flex flex-col">
          <span className="text-[13px] font-bold">{preset.label}</span>
          <span className="text-[11px] text-muted">Yatırımcıya bu banka adıyla gösterilir.</span>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Banka" hint="Listeden seçin. Elle yazılmaz.">
          <select name="bankName" value={selected} onChange={(e) => setSelected(e.target.value)} className={ADMIN_INPUT}>
            {BANK_PRESETS.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField label="Şube" hint="İsteğe bağlı.">
          <input name="branch" defaultValue={bank?.branch ?? ""} className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="IBAN" hint="TR ile başlayan 26 karakter. Boşluklar otomatik silinir." className="md:col-span-2">
          <input name="iban" required defaultValue={bank?.iban} className={`${ADMIN_INPUT} font-mono`} />
        </AdminField>
        <AdminField label="Hesap sahibi" hint="Ad soyad veya unvan." className="md:col-span-2">
          <input name="accountHolder" required defaultValue={bank?.accountHolder} className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Yatırımcıya not" hint="İsteğe bağlı. Örnek: açıklama alanına referans kodunu yazın." className="md:col-span-2">
          <textarea name="instructions" rows={2} defaultValue={bank?.instructions ?? ""} className={ADMIN_TEXTAREA} />
        </AdminField>
      </div>
    </AdminActionForm>
  );
}

// ---------- Kripto adresi ----------

export interface CryptoValues {
  id?: string;
  network: string;
  label: string;
  address: string;
  logoUrl: string | null;
  position: number;
}

export function CryptoEditor({ crypto }: { crypto?: CryptoValues }) {
  const [network, setNetwork] = useState(crypto?.network ?? CRYPTO_NETWORK_PRESETS[0].value);
  const preset = presetFor(CRYPTO_NETWORK_PRESETS, network);

  return (
    <AdminActionForm action={saveCryptoAction} submitLabel={crypto ? "Değişiklikleri kaydet" : "Adresi ekle"}>
      {crypto?.id && <input type="hidden" name="id" value={crypto.id} />}
      <div className="flex items-center gap-3 rounded-xl bg-surface-2 p-3">
        <ProviderBadge label={preset.label} color={preset.color} logoUrl={preset.logoUrl} size={40} />
        <div className="flex flex-col">
          <span className="text-[13px] font-bold">USDT · {preset.value}</span>
          <span className="text-[11px] text-muted">Yanlış ağa gönderilen varlık geri alınamayabilir.</span>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Ağ" hint="Listeden seçin.">
          <select name="network" value={network} onChange={(e) => setNetwork(e.target.value)} className={ADMIN_INPUT}>
            {CRYPTO_NETWORK_PRESETS.map((n) => (
              <option key={n.value} value={n.value}>
                {n.label}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField label="Etiket" hint="Örnek: Ana cüzdan">
          <input name="label" required defaultValue={crypto?.label} className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Cüzdan adresi" className="md:col-span-2">
          <input name="address" required defaultValue={crypto?.address} className={`${ADMIN_INPUT} font-mono`} />
        </AdminField>
        <AdminField label="Sıra">
          <input name="position" type="number" min={0} defaultValue={crypto?.position ?? 0} className={ADMIN_INPUT} />
        </AdminField>
      </div>
    </AdminActionForm>
  );
}

// ---------- Vadeli mevduat ürünü ----------

export interface TermValues {
  id?: string;
  currency: string;
  termDays: number;
  label: string | null;
  annualRate: number;
  rateMultiplier: number;
  minAmount: number;
  position: number;
}

/** annualRate is never an input here — it's always Faiz Konfigürasyonu's base rate ×
 * rateMultiplier, shown read-only so admins can see what a term actually pays without being
 * able to make it drift from that formula. See saveTermProductAction. */
export function TermEditor({ product }: { product?: TermValues }) {
  return (
    <AdminActionForm action={saveTermProductAction} submitLabel={product ? "Değişiklikleri kaydet" : "Ürünü ekle"}>
      {product?.id && <input type="hidden" name="id" value={product.id} />}
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Para birimi">
          <select name="currency" defaultValue={product?.currency ?? "TRY"} className={ADMIN_INPUT}>
            <option value="TRY">TL</option>
            <option value="USD">USD</option>
          </select>
        </AdminField>
        <AdminField label="Vade (gün)" hint="1 ile 3650 arası.">
          <input name="termDays" type="number" min={1} max={3650} required defaultValue={product?.termDays} className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Etiket" hint='Örnek: "7 Günlük". Boş bırakılırsa gün sayısı gösterilir.'>
          <input name="label" defaultValue={product?.label ?? ""} className={ADMIN_INPUT} />
        </AdminField>
        <AdminField
          label="Çarpan"
          hint={
            product
              ? `Faiz Konfigürasyonu'ndaki taban orana uygulanır. Şu an: %${product.annualRate.toFixed(2)} yıllık.`
              : "Faiz Konfigürasyonu'ndaki taban orana uygulanır (1 = taban oranın aynısı)."
          }
        >
          <input name="rateMultiplier" type="number" step="0.0001" min="0.0001" required defaultValue={product?.rateMultiplier ?? 1} className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Minimum tutar">
          <input name="minAmount" type="number" step="0.01" min={0} required defaultValue={product?.minAmount} className={ADMIN_INPUT} />
        </AdminField>
        <AdminField label="Sıra">
          <input name="position" type="number" min={0} defaultValue={product?.position ?? 0} className={ADMIN_INPUT} />
        </AdminField>
      </div>
    </AdminActionForm>
  );
}
