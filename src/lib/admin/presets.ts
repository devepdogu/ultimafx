/**
 * Known Turkish banks and crypto networks. Admins pick from these lists instead of typing names,
 * so the stored name always matches what the badge and the user-facing copy expect.
 * Logos are not bundled: the badge is a monogram in the bank's colour until an admin uploads a logo.
 */
export interface Preset {
  value: string;
  label: string;
  color: string;
  /** Public logo for the network or coin. Used when no logo was uploaded for a record. */
  logoUrl?: string;
}

export const BANK_PRESETS: Preset[] = [
  { value: "Akbank", label: "Akbank", color: "#C8102E", logoUrl: "/banks/akbank.svg" },
  { value: "Aktif Bank", label: "Aktif Bank", color: "#00A88E", logoUrl: "/banks/aktifbank.svg" },
  { value: "Albaraka Türk", label: "Albaraka Türk", color: "#1B5E20", logoUrl: "/banks/albaraka.svg" },
  { value: "Alternatif Bank", label: "Alternatif Bank", color: "#E4002B", logoUrl: "/banks/alternatifbank.svg" },
  { value: "Anadolubank", label: "Anadolubank", color: "#0054A6", logoUrl: "/banks/anadolubank.svg" },
  { value: "ATBank", label: "ATBank", color: "#7C3AED", logoUrl: "/banks/atbank.svg" },
  { value: "Burgan Bank", label: "Burgan Bank", color: "#C00000", logoUrl: "/banks/burgan.svg" },
  { value: "Citibank", label: "Citibank", color: "#056DAE", logoUrl: "/banks/citibank.svg" },
  { value: "DenizBank", label: "DenizBank", color: "#00A3E0", logoUrl: "/banks/denizbank.svg" },
  { value: "Dünya Katılım", label: "Dünya Katılım", color: "#0B5394", logoUrl: "/banks/dunyakatilim.svg" },
  { value: "Emlak Katılım", label: "Emlak Katılım", color: "#0E7C3A", logoUrl: "/banks/emlakkatilim.svg" },
  { value: "Fibabanka", label: "Fibabanka", color: "#00529B", logoUrl: "/banks/fibabanka.svg" },
  { value: "Freedom Bank", label: "Freedom Bank", color: "#00A651", logoUrl: "/banks/freedombank.svg" },
  { value: "Garanti BBVA", label: "Garanti BBVA", color: "#2E7D32", logoUrl: "/banks/garanti.svg" },
  { value: "Golden Global", label: "Golden Global", color: "#B8860B", logoUrl: "/banks/goldenglobal.svg" },
  { value: "Halkbank", label: "Halkbank", color: "#00703C", logoUrl: "/banks/halkbank.svg" },
  { value: "Hayat Finans", label: "Hayat Finans", color: "#D81B60", logoUrl: "/banks/hayatfinans.svg" },
  { value: "HSBC", label: "HSBC", color: "#DB0011", logoUrl: "/banks/hsbc.svg" },
  { value: "ICBC Turkey", label: "ICBC Turkey", color: "#C8102E", logoUrl: "/banks/icbc.svg" },
  { value: "ING", label: "ING", color: "#FF6200", logoUrl: "/banks/ing.svg" },
  { value: "İş Bankası", label: "İş Bankası", color: "#0054A6", logoUrl: "/banks/isbank.svg" },
  { value: "Kuveyt Türk", label: "Kuveyt Türk", color: "#0B6E4F", logoUrl: "/banks/kuveytturk.svg" },
  { value: "N Kolay", label: "N Kolay", color: "#F9A11B", logoUrl: "/banks/nkolay.svg" },
  { value: "Odeabank", label: "Odeabank", color: "#E31E24", logoUrl: "/banks/odeabank.svg" },
  { value: "QNB", label: "QNB", color: "#5B2C83", logoUrl: "/banks/qnb.svg" },
  { value: "Şekerbank", label: "Şekerbank", color: "#005BAC", logoUrl: "/banks/sekerbank.svg" },
  { value: "TEB", label: "TEB", color: "#00843D", logoUrl: "/banks/teb.svg" },
  { value: "Tera Bank", label: "Tera Bank", color: "#1E3A5F", logoUrl: "/banks/terabank.svg" },
  { value: "Türkiye Finans", label: "Türkiye Finans", color: "#0A4D8C", logoUrl: "/banks/turkiyefinans.svg" },
  { value: "Vakıf Katılım", label: "Vakıf Katılım", color: "#E65100", logoUrl: "/banks/vakifkatilim.svg" },
  { value: "VakıfBank", label: "VakıfBank", color: "#F7941D", logoUrl: "/banks/vakifbank.svg" },
  { value: "Yapı Kredi", label: "Yapı Kredi", color: "#1B3A8C", logoUrl: "/banks/yapikredi.svg" },
  { value: "Ziraat Bankası", label: "Ziraat Bankası", color: "#E30613", logoUrl: "/banks/ziraat.svg" },
  { value: "Ziraat Katılım", label: "Ziraat Katılım", color: "#B71C1C", logoUrl: "/banks/ziraatkatilim.svg" },
  { value: "Diğer", label: "Diğer", color: "#64748B" },
];

/** USDT networks. Logos are public network logos from cryptologos.cc, linked at display time, not copied. */
export const CRYPTO_NETWORK_PRESETS: Preset[] = [
  { value: "TRC20", label: "TRC20 · Tron", color: "#D93025", logoUrl: "https://cryptologos.cc/logos/tron-trx-logo.png" },
  { value: "ERC20", label: "ERC20 · Ethereum", color: "#627EEA", logoUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.png" },
  { value: "BEP20", label: "BEP20 · BNB Chain", color: "#F3BA2F", logoUrl: "https://cryptologos.cc/logos/bnb-bnb-logo.png" },
  { value: "SOL", label: "Solana", color: "#14F195", logoUrl: "https://cryptologos.cc/logos/solana-sol-logo.png" },
  { value: "MATIC", label: "Polygon", color: "#8247E5", logoUrl: "https://cryptologos.cc/logos/polygon-matic-logo.png" },
];

/**
 * Colour and display label for a stored name. Older records hold free text such as "Ziraat", so an
 * unknown name is matched loosely against the list before falling back to a neutral badge.
 */
export function presetFor(list: Preset[], value: string | null | undefined): Preset {
  const fallback: Preset = { value: value ?? "", label: value ?? "-", color: "#64748B" };
  if (!value) return fallback;
  const exact = list.find((p) => p.value === value);
  if (exact) return exact;
  const v = value.toLocaleLowerCase("tr-TR").trim();
  const loose = list.find((p) => p.value !== "Diğer" && (p.label.toLocaleLowerCase("tr-TR").startsWith(v) || v.startsWith(p.value.toLocaleLowerCase("tr-TR").split(" ")[0])));
  return loose ?? fallback;
}

/** Bank IBAN: Turkish format, 26 characters after removing spaces. */
export const IBAN_PATTERN = /^TR\d{24}$/;
