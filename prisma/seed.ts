/**
 * Reference/catalog seed data — RBAC roles/permissions, the admin account, the
 * BIST/Nasdaq/crypto asset catalog, investment funds, campaigns and term
 * deposit products. Every upsert is keyed by a unique field, so re-running
 * this (on every deploy, in dev or in prod) only ever creates-or-updates
 * these same rows — it never seeds a fabricated *quote*: asset prices always
 * come from a live MarketDataProvider (Binance/Yahoo/TCMB/...), never from
 * here, in any environment.
 *
 * This is meant to run in production too — it's how a brand-new deployment
 * gets its admin account and tradable asset list in the first place — but
 * only when deliberately asked for: in production it additionally requires
 * ALLOW_PRODUCTION_SEED=true, so a seed never fires against a live database
 * by accident. See docker-compose.yml's `migrate` service for where that's set.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { encryptSecret } from "../src/lib/crypto/secret-box";

const prisma = new PrismaClient();

const PERMISSIONS = [
  "asset:read",
  "asset:write",
  "price:override",
  "provider:manage",
  "news:manage",
  "ipo:manage",
  "bank:manage",
  "withdrawal:approve",
  "user:manage",
  "audit:read",
  "system:manage",
] as const;

const ROLES: { key: string; name: string; permissions: readonly string[] }[] = [
  { key: "SUPER_ADMIN", name: "Süper Yönetici", permissions: PERMISSIONS },
  {
    key: "ADMIN",
    name: "Yönetici",
    permissions: PERMISSIONS.filter((p) => p !== "system:manage"),
  },
  {
    key: "SUPPORT",
    name: "Destek",
    permissions: ["asset:read", "audit:read"],
  },
  { key: "USER", name: "Kullanıcı", permissions: [] },
];

/** Investment funds from the yatirim-fon mock. Idempotent: matched by name, so re-running updates values in place. */
const INVESTMENT_FUNDS: {
  name: string;
  companyName: string;
  category: string;
  description: string;
  risk: number;
  unitPrice: string;
  ytdReturn: string;
  oneYearReturn: string;
  aum: number;
  investorCount: number;
}[] = [
  { name: "AK PORTFÖY YENİ TEKNOLOJİLER YABANCI HİSSE SENEDİ FONU", companyName: "Ak Portföy Yönetimi A.Ş.", category: "Yabancı", description: "Nasdaq ve küresel teknoloji devlerine yatırım yapan, Türkiye'nin en büyük yabancı hisse senedi fonlarından.", risk: 6, unitPrice: "1.0746", ytdReturn: "25.42", oneYearReturn: "33.10", aum: 19_000_000_000, investorCount: 131149 },
  { name: "İŞ PORTFÖY BIST TEKNOLOJİ AĞIRLIK SINIRLAMALI ENDEKSİ HİSSE SENEDİ (TL) FONU (HİSSE SENEDİ YOĞUN FON)", companyName: "İş Portföy Yönetimi A.Ş.", category: "Sektörel", description: "BIST Teknoloji endeksini takip eden, yerli teknoloji şirketlerine odaklanan endeks fonu.", risk: 7, unitPrice: "1.2082", ytdReturn: "20.26", oneYearReturn: "15.00", aum: 2_400_000_000, investorCount: 40112 },
  { name: "AK PORTFÖY ALTIN FONU", companyName: "Ak Portföy Yönetimi A.Ş.", category: "Altın", description: "Fiziki altın ve altına dayalı araçlarla enflasyona karşı koruma sağlayan altın fonu.", risk: 4, unitPrice: "1.2928", ytdReturn: "5.92", oneYearReturn: "13.20", aum: 18_200_000_000, investorCount: 79087 },
  { name: "MARMARA CAPITAL PORTFÖY HİSSE SENEDİ (TL) FONU (HİSSE SENEDİ YOĞUN FON)", companyName: "Marmara Capital Portföy Yönetimi A.Ş.", category: "Hisse Senedi", description: "Değer yatırımı stratejisiyle yönetilen, uzun vadeli getiri hedefleyen aktif hisse senedi fonu.", risk: 6, unitPrice: "0.6915", ytdReturn: "2.96", oneYearReturn: "7.50", aum: 3_700_000_000, investorCount: 31890 },
  { name: "NEO PORTFÖY BİRİNCİ PARA PİYASASI FONU", companyName: "Neo Portföy Yönetimi A.Ş.", category: "Para Piyasası", description: "Kısa vadeli para piyasası araçlarıyla düşük riskli, istikrarlı günlük getiri hedefler.", risk: 1, unitPrice: "5.8398", ytdReturn: "33.74", oneYearReturn: "46.40", aum: 2_500_000_000, investorCount: 2442 },
  { name: "ZİRAAT PORTFÖY KISA VADELİ KİRA SERTİFİKASI KATILIM (TL) FONU", companyName: "Ziraat Portföy Yönetimi A.Ş.", category: "Kira Sertifikası", description: "Faizsiz finans ilkelerine uygun kısa vadeli kira sertifikalarına yatırım yapan katılım fonu.", risk: 2, unitPrice: "8.7996", ytdReturn: "31.16", oneYearReturn: "42.50", aum: 25_800_000_000, investorCount: 31010 },
  { name: "AZİMUT PYŞ BİRİNCİ HİSSE SENEDİ FONU (HİSSE SENEDİ YOĞUN FON)", companyName: "Azimut Portföy Yönetimi A.Ş.", category: "Hisse Senedi", description: "Azimut'un küresel tecrübesiyle yönetilen, seçilmiş BIST hisselerine odaklı fon.", risk: 6, unitPrice: "1443.5641", ytdReturn: "21.16", oneYearReturn: "31.00", aum: 1_200_000_000, investorCount: 925 },
  { name: "İŞ PORTFÖY HİSSE SENEDİ (TL) FONU (HİSSE SENEDİ YOĞUN FON)", companyName: "İş Portföy Yönetimi A.Ş.", category: "Hisse Senedi", description: "BIST'in köklü şirketlerinden oluşan, Türkiye'nin en eski hisse senedi fonlarından.", risk: 6, unitPrice: "0.1221", ytdReturn: "10.46", oneYearReturn: "17.40", aum: 3_000_000_000, investorCount: 19148 },
  { name: "YAPI KREDİ PORTFÖY KOÇ HOLDİNG İŞTİRAK VE HİSSE SENEDİ FONU(HİSSE SENEDİ YOĞUN FON)", companyName: "Yapı Kredi Portföy Yönetimi A.Ş.", category: "Hisse Senedi", description: "Koç Holding iştiraklerine ve BIST hisselerine yatırım yapan iştirak fonu.", risk: 6, unitPrice: "14.6406", ytdReturn: "10.39", oneYearReturn: "11.30", aum: 5_900_000_000, investorCount: 58563 },
  { name: "GARANTİ PORTFÖY ALTIN FONU", companyName: "Garanti Portföy Yönetimi A.Ş.", category: "Altın", description: "Altın ve kıymetli madenlere dayalı sermaye piyasası araçlarına yatırım yapar.", risk: 4, unitPrice: "1.5577", ytdReturn: "5.96", oneYearReturn: "14.50", aum: 23_300_000_000, investorCount: 72801 },
];

async function seedInvestmentFunds() {
  for (const [position, fund] of INVESTMENT_FUNDS.entries()) {
    const data = {
      companyName: fund.companyName,
      category: fund.category,
      description: fund.description,
      risk: fund.risk,
      unitPrice: fund.unitPrice,
      currency: "TRY",
      ytdReturn: fund.ytdReturn,
      oneYearReturn: fund.oneYearReturn,
      aum: fund.aum,
      investorCount: fund.investorCount,
      position,
      isActive: true,
    };
    const existing = await prisma.investmentFund.findFirst({ where: { name: fund.name }, select: { id: true } });
    if (existing) await prisma.investmentFund.update({ where: { id: existing.id }, data });
    else await prisma.investmentFund.create({ data: { ...data, name: fund.name } });
  }
  console.log(`Seeded ${INVESTMENT_FUNDS.length} investment funds.`);
}

/** Kampanyalar from the odul mock, in the mock's order. Matched by slug so re-running updates in place. */
const CAMPAIGNS: {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  rewardLabel: string;
  category: string;
  status: "ACTIVE" | "UPCOMING";
  isFeatured?: boolean;
}[] = [
  {
    slug: "hos-geldin-bonusu",
    title: "Hoş Geldin Bonusu",
    tagline: "Yeni yatırımcılara özel",
    description: "Ultima FX ailesine katılan yeni yatırımcılarımıza özel fırsat: İlk para yatırma işleminize %10 oranında, 5.000 ₺'ye varan hoş geldin bonusu tanımlanır. Bonus tutarı, yatırımınız hesabınıza geçtiği anda otomatik olarak yüklenir.",
    rewardLabel: "5.000 ₺'ye varan",
    category: "Hoş geldin",
    status: "ACTIVE",
  },
  {
    slug: "islem-hacmi-odul-programi",
    title: "İşlem Hacmi Ödül Programı",
    tagline: "Aktif yatırımcılara aylık ödül",
    description: "Ay içerisinde 250.000 ₺ ve üzeri işlem hacmine ulaşan yatırımcılarımıza, hacim kademelerine göre 2.500 ₺'ye varan nakit ödül tanımlanır. Ödüller her ayın ilk iş günü hesabınıza yansıtılır.",
    rewardLabel: "2.500 ₺'ye varan",
    category: "İşlem hacmi",
    status: "ACTIVE",
    isFeatured: true,
  },
  {
    slug: "vip-ayricaliklar-programi",
    title: "VIP Ayrıcalıklar Programı",
    tagline: "Seçkin yatırımcılara özel hizmet",
    description: "Portföy büyüklüğü 1.000.000 ₺ üzerindeki yatırımcılarımız VIP statüsüne yükseltilir: Düşürülmüş spread oranları, özel piyasa analiz raporları, kişiye özel portföy danışmanı ve öncelikli 7/24 destek hattı ayrıcalıklarından yararlanır.",
    rewardLabel: "VIP Statü",
    category: "VIP",
    status: "ACTIVE",
  },
  {
    slug: "sadakat-programi",
    title: "Sadakat Programı",
    tagline: "Düzenli girişlere aylık ödül",
    description: "Platformumuza 30 gün kesintisiz giriş yapan yatırımcılarımıza ay sonunda 250 ₺ sadakat ödülü tanımlanır. Seriniz bozulmadan devam ettiği her ay ödül tutarınız %10 artarak birikir.",
    rewardLabel: "250 ₺ / ay",
    category: "Sadakat",
    status: "ACTIVE",
  },
  {
    slug: "yatirimci-akademisi",
    title: "Yatırımcı Akademisi",
    tagline: "Öğrenin, uygulayın, kazanın",
    description: "Ultima FX Akademisi'ndeki temel ve ileri seviye eğitim serilerini tamamlayan yatırımcılarımıza 500 ₺ eğitim bonusu tanımlanır. Eğitimler; temel analiz, teknik analiz ve risk yönetimi modüllerinden oluşur.",
    rewardLabel: "500 ₺",
    category: "Eğitim",
    status: "ACTIVE",
  },
  {
    slug: "yatirim-bonusu",
    title: "Yatırım Bonusu",
    tagline: "Yüksek tutarlı yatırımlara ek kazanç",
    description: "25.000 ₺ ve üzeri para yatırma işlemlerinize %5 oranında, 7.500 ₺'ye varan ek yatırım bonusu tanımlanır. Bonus, yatırım tutarınızla birlikte anında kullanılabilir bakiyenize eklenir.",
    rewardLabel: "7.500 ₺'ye varan",
    category: "Yatırım bonusu",
    status: "ACTIVE",
  },
  {
    slug: "demo-hesap-yarismasi",
    title: "Demo Hesap Yarışması",
    tagline: "Risksiz yarış, gerçek ödül",
    description: "Sanal bakiye ile gerçek piyasa koşullarında yatırım yapın: Yarışma dönemi sonunda en yüksek getiriyi elde eden ilk 10 yatırımcıya toplam 100.000 ₺ ödül havuzundan pay dağıtılır. Birinciye 25.000 ₺ nakit ödül hesabına tanımlanır.",
    rewardLabel: "25.000 ₺",
    category: "Yarışma",
    status: "UPCOMING",
  },
];

async function seedCampaigns() {
  for (const [position, c] of CAMPAIGNS.entries()) {
    const data = {
      title: c.title,
      tagline: c.tagline,
      description: c.description,
      rewardLabel: c.rewardLabel,
      category: c.category,
      status: c.status,
      isFeatured: c.isFeatured ?? false,
      isActive: true,
      position,
    };
    await prisma.campaign.upsert({ where: { slug: c.slug }, create: { ...data, slug: c.slug }, update: data });
  }
  console.log(`Seeded ${CAMPAIGNS.length} campaigns.`);
}

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PRODUCTION_SEED !== "true") {
    throw new Error(
      "Refusing to run seed data against a production environment. This only seeds reference/" +
        "catalog data (admin account, asset list, funds, campaigns) and is safe to re-run, but it " +
        "requires an explicit ALLOW_PRODUCTION_SEED=true to make that an intentional choice, not an accident."
    );
  }

  for (const key of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key },
    });
  }

  for (const role of ROLES) {
    const created = await prisma.role.upsert({
      where: { key: role.key },
      update: { name: role.name },
      create: { key: role.key, name: role.name },
    });

    for (const permKey of role.permissions) {
      const permission = await prisma.permission.findUniqueOrThrow({
        where: { key: permKey },
      });
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: created.id, permissionId: permission.id } },
        update: {},
        create: { roleId: created.id, permissionId: permission.id },
      });
    }
  }

  const bist = await prisma.exchange.upsert({
    where: { code: "BIST" },
    update: {},
    create: {
      code: "BIST",
      name: "Borsa İstanbul",
      country: "TR",
      timezone: "Europe/Istanbul",
    },
  });
  void bist;

  // Real, freely tradeable (internally) FX pairs sourced from TCMB's public
  // feed. These are the only assets seeded with trading enabled in Phase
  // 1.5 — everything else in the catalog stays display-only until a real
  // data source is wired up for it, so nothing here can mislead a user into
  // thinking a fabricated price is tradeable.
  const fxPairs = [
    { symbol: "USDTRY", name: "ABD Doları / Türk Lirası" },
    { symbol: "EURTRY", name: "Euro / Türk Lirası" },
    { symbol: "GBPTRY", name: "İngiliz Sterlini / Türk Lirası" },
    { symbol: "AUDTRY", name: "Avustralya Doları / Türk Lirası" },
    { symbol: "CADTRY", name: "Kanada Doları / Türk Lirası" },
    { symbol: "CHFTRY", name: "İsviçre Frangı / Türk Lirası" },
    { symbol: "DKKTRY", name: "Danimarka Kronu / Türk Lirası" },
    { symbol: "SEKTRY", name: "İsveç Kronu / Türk Lirası" },
    { symbol: "NOKTRY", name: "Norveç Kronu / Türk Lirası" },
    { symbol: "SARTRY", name: "Suudi Riyali / Türk Lirası" },
    { symbol: "JPYTRY", name: "Japon Yeni / Türk Lirası" },
    { symbol: "RONTRY", name: "Romanya Leyi / Türk Lirası" },
    { symbol: "RUBTRY", name: "Rus Rublesi / Türk Lirası" },
    { symbol: "CNYTRY", name: "Çin Yuanı / Türk Lirası" },
    { symbol: "PKRTRY", name: "Pakistan Rupisi / Türk Lirası" },
    { symbol: "QARTRY", name: "Katar Riyali / Türk Lirası" },
    { symbol: "KRWTRY", name: "Güney Kore Wonu / Türk Lirası" },
    { symbol: "AZNTRY", name: "Azerbaycan Manatı / Türk Lirası" },
    { symbol: "AEDTRY", name: "BAE Dirhemi / Türk Lirası" },
    { symbol: "KWDTRY", name: "Kuveyt Dinarı / Türk Lirası" },
    { symbol: "KZTTRY", name: "Kazakistan Tengesi / Türk Lirası" },
  ];
  for (const pair of fxPairs) {
    await prisma.asset.upsert({
      where: { symbol: pair.symbol },
      update: {},
      create: {
        symbol: pair.symbol,
        name: pair.name,
        type: "CURRENCY",
        currency: "TRY",
        decimalPrecision: 4,
        isActive: true,
        tradingEnabled: true,
        visibility: "PUBLIC",
      },
    });
  }

  // Gold/silver/oil sourced from Truncgil's free public feed — tradable
  // internally like FX. See src/lib/market-data/providers/truncgil-provider.ts.
  const commodities = [
    { symbol: "GRAMALTIN", name: "Gram Altın", currency: "TRY", decimalPrecision: 2 },
    { symbol: "CEYREKALTIN", name: "Çeyrek Altın", currency: "TRY", decimalPrecision: 2 },
    { symbol: "ONSALTIN", name: "Ons Altın", currency: "USD", decimalPrecision: 2 },
    { symbol: "GUMUS", name: "Gram Gümüş", currency: "TRY", decimalPrecision: 2 },
    { symbol: "GRAMHASALTIN", name: "Gram Has Altın", currency: "TRY", decimalPrecision: 2 },
    { symbol: "YARIMALTIN", name: "Yarım Altın", currency: "TRY", decimalPrecision: 2 },
    { symbol: "TAMALTIN", name: "Tam Altın", currency: "TRY", decimalPrecision: 2 },
    { symbol: "CUMHURIYETALTINI", name: "Cumhuriyet Altını", currency: "TRY", decimalPrecision: 2 },
    { symbol: "ATAALTIN", name: "Ata Altın", currency: "TRY", decimalPrecision: 2 },
    { symbol: "AYAR14ALTIN", name: "14 Ayar Altın", currency: "TRY", decimalPrecision: 2 },
    { symbol: "AYAR18ALTIN", name: "18 Ayar Altın", currency: "TRY", decimalPrecision: 2 },
    { symbol: "AYAR22BILEZIK", name: "22 Ayar Bilezik", currency: "TRY", decimalPrecision: 2 },
    { symbol: "GRAMPLATIN", name: "Gram Platin", currency: "TRY", decimalPrecision: 2 },
    { symbol: "GRAMPALADYUM", name: "Gram Paladyum", currency: "TRY", decimalPrecision: 2 },
  ];
  for (const c of commodities) {
    await prisma.asset.upsert({
      where: { symbol: c.symbol },
      update: {},
      create: {
        symbol: c.symbol,
        name: c.name,
        type: "COMMODITY",
        currency: c.currency,
        decimalPrecision: c.decimalPrecision,
        isActive: true,
        tradingEnabled: true,
        visibility: "PUBLIC",
      },
    });
  }

  // BIST 100 index level — informational only. There is no retail "buy the
  // index" product here (that would need a real ETF/fund wrapper), so this
  // stays display-only.
  await prisma.asset.upsert({
    where: { symbol: "XU100" },
    update: { logoUrl: "/logos/XU100.png" },
    create: {
      symbol: "XU100",
      name: "BIST 100",
      logoUrl: "/logos/XU100.png",
      type: "INDEX",
      currency: "TRY",
      decimalPrecision: 2,
      isActive: true,
      tradingEnabled: false,
      visibility: "PUBLIC",
    },
  });

  // Additional BIST index levels (Yahoo .IS symbols). Display-only, like XU100.
  const indexes = [{ symbol: "XU030", name: "BIST 30" }, { symbol: "XU050", name: "BIST 50" }, { symbol: "XBANK", name: "BIST Banka" }, { symbol: "XUSIN", name: "BIST Sınai" }, { symbol: "XUTUM", name: "BIST Tüm" }];
  for (const idx of indexes) {
    await prisma.asset.upsert({
      where: { symbol: idx.symbol },
      update: {},
      create: { symbol: idx.symbol, name: idx.name, type: "INDEX", currency: "TRY", decimalPrecision: 2, isActive: true, tradingEnabled: false, visibility: "PUBLIC" },
    });
  }

  // Individual BIST equities, sourced from Yahoo Finance's public chart feed
  // (see yahoo-bist-provider.ts) for prices and from the MIT-licensed
  // ahmeterenodaci/Istanbul-Stock-Exchange--BIST--including-symbols-and-logos
  // GitHub repo (itself sourced from KAP, the official disclosure platform)
  // for symbol/name/logo — downloaded once into public/logos/ rather than
  // hotlinked. 129 names, covering BIST30 plus a long tail of other liquid,
  // well-known BIST-listed companies — tradable internally like FX/gold,
  // same simulated closed-loop ledger.
  const bistStocks = [
    { symbol: "THYAO", name: "Türk Hava Yolları A.O.", logoUrl: "/logos/THYAO.png" },
    { symbol: "GARAN", name: "Türkiye Garanti Bankası A.Ş.", logoUrl: "/logos/GARAN.png" },
    { symbol: "AKBNK", name: "Akbank T.A.Ş.", logoUrl: "/logos/AKBNK.png" },
    { symbol: "YKBNK", name: "Yapı ve Kredi Bankası A.Ş.", logoUrl: "/logos/YKBNK.png" },
    { symbol: "ISCTR", name: "Türkiye İş Bankası A.Ş.", logoUrl: "/logos/ISCTR.png" },
    { symbol: "ASELS", name: "Aselsan Elektronik Sanayi ve Ticaret A.Ş.", logoUrl: "/logos/ASELS.png" },
    { symbol: "SISE", name: "Türkiye Şişe ve Cam Fabrikaları A.Ş.", logoUrl: "/logos/SISE.png" },
    { symbol: "EREGL", name: "Ereğli Demir ve Çelik Fabrikaları T.A.Ş.", logoUrl: "/logos/EREGL.png" },
    { symbol: "KCHOL", name: "Koç Holding A.Ş.", logoUrl: "/logos/KCHOL.png" },
    { symbol: "SAHOL", name: "Hacı Ömer Sabancı Holding A.Ş.", logoUrl: "/logos/SAHOL.png" },
    { symbol: "BIMAS", name: "Bim Birleşik Mağazalar A.Ş.", logoUrl: "/logos/BIMAS.png" },
    { symbol: "TUPRS", name: "Tüpraş-Türkiye Petrol Rafinerileri A.Ş.", logoUrl: "/logos/TUPRS.png" },
    { symbol: "PGSUS", name: "Pegasus Hava Taşımacılığı A.Ş.", logoUrl: "/logos/PGSUS.png" },
    { symbol: "TOASO", name: "Tofaş Türk Otomobil Fabrikası A.Ş.", logoUrl: "/logos/TOASO.png" },
    { symbol: "FROTO", name: "Ford Otomotiv Sanayi A.Ş.", logoUrl: "/logos/FROTO.png" },
    { symbol: "TCELL", name: "Turkcell İletişim Hizmetleri A.Ş.", logoUrl: "/logos/TCELL.png" },
    { symbol: "TTKOM", name: "Türk Telekomünikasyon A.Ş.", logoUrl: "/logos/TTKOM.png" },
    { symbol: "PETKM", name: "Petkim Petrokimya Holding A.Ş.", logoUrl: "/logos/PETKM.png" },
    { symbol: "MGROS", name: "Migros Ticaret A.Ş.", logoUrl: "/logos/MGROS.png" },
    { symbol: "VESTL", name: "Vestel Elektronik Sanayi ve Ticaret A.Ş.", logoUrl: "/logos/VESTL.png" },
    { symbol: "ENKAI", name: "Enka İnşaat ve Sanayi A.Ş.", logoUrl: "/logos/ENKAI.png" },
    { symbol: "VAKBN", name: "Türkiye Vakıflar Bankası T.A.O.", logoUrl: "/logos/VAKBN.png" },
    { symbol: "HALKB", name: "Türkiye Halk Bankası A.Ş.", logoUrl: "/logos/HALKB.png" },
    { symbol: "TSKB", name: "Türkiye Sınai Kalkınma Bankası A.Ş.", logoUrl: "/logos/TSKB.png" },
    { symbol: "EKGYO", name: "Emlak Konut Gayrimenkul Yatırım Ortaklığı A.Ş.", logoUrl: "/logos/EKGYO.png" },
    { symbol: "KOZAL", name: "Koza Altın İşletmeleri A.Ş.", logoUrl: "/logos/KOZAL.png" },
    { symbol: "KOZAA", name: "Koza Anadolu Metal Madencilik İşletmeleri A.Ş.", logoUrl: "/logos/KOZAA.png" },
    { symbol: "TAVHL", name: "Tav Havalimanları Holding A.Ş.", logoUrl: "/logos/TAVHL.png" },
    { symbol: "DOHOL", name: "Doğan Şirketler Grubu Holding A.Ş.", logoUrl: "/logos/DOHOL.png" },
    { symbol: "ALARK", name: "Alarko Holding A.Ş.", logoUrl: "/logos/ALARK.png" },
    { symbol: "ANSGR", name: "Anadolu Anonim Türk Sigorta Şirketi", logoUrl: "/logos/ANSGR.png" },
    { symbol: "AEFES", name: "Anadolu Efes Biracılık ve Malt Sanayii A.Ş.", logoUrl: "/logos/AEFES.png" },
    { symbol: "ULKER", name: "Ülker Bisküvi Sanayi A.Ş.", logoUrl: "/logos/ULKER.png" },
    { symbol: "SASA", name: "Sasa Polyester Sanayi A.Ş.", logoUrl: "/logos/SASA.png" },
    { symbol: "KONTR", name: "Kontrolmatik Teknoloji Enerji ve Mühendislik A.Ş.", logoUrl: "/logos/KONTR.png" },
    { symbol: "ARCLK", name: "Arçelik A.Ş.", logoUrl: "/logos/ARCLK.png" },
    { symbol: "OTKAR", name: "Otokar Otomotiv ve Savunma Sanayi A.Ş.", logoUrl: "/logos/OTKAR.png" },
    { symbol: "OYAKC", name: "Oyak Çimento Fabrikaları A.Ş.", logoUrl: "/logos/OYAKC.png" },
    { symbol: "TTRAK", name: "Türk Traktör ve Ziraat Makineleri A.Ş.", logoUrl: "/logos/TTRAK.png" },
    { symbol: "ALBRK", name: "Albaraka Türk Katılım Bankası A.Ş.", logoUrl: "/logos/ALBRK.png" },
    { symbol: "AKSA", name: "Aksa Akrilik Kimya Sanayii A.Ş.", logoUrl: "/logos/AKSA.png" },
    { symbol: "KRDMD", name: "Kardemir Karabük Demir Çelik Sanayi ve Ticaret A.Ş.", logoUrl: "/logos/KRDMD.png" },
    { symbol: "KARSN", name: "Karsan Otomotiv Sanayii ve Ticaret A.Ş.", logoUrl: "/logos/KARSN.png" },
    { symbol: "ISGYO", name: "İş Gayrimenkul Yatırım Ortaklığı A.Ş.", logoUrl: "/logos/ISGYO.png" },
    { symbol: "EUPWR", name: "Europower Enerji ve Otomasyon Teknolojileri Sanayi Ticaret A.Ş.", logoUrl: "/logos/EUPWR.png" },
    { symbol: "HEKTS", name: "Hektaş Ticaret T.A.Ş.", logoUrl: "/logos/HEKTS.png" },
    { symbol: "ASTOR", name: "Astor Enerji A.Ş.", logoUrl: "/logos/ASTOR.png" },
    { symbol: "SMRTG", name: "Smart Güneş Enerjisi Teknolojileri Araştırma Geliştirme Üretim Sanayi ve Ticaret A.Ş.", logoUrl: "/logos/SMRTG.png" },
    { symbol: "MAVI", name: "Mavi Giyim Sanayi ve Ticaret A.Ş.", logoUrl: "/logos/MAVI.png" },
    { symbol: "SOKM", name: "Şok Marketler Ticaret A.Ş.", logoUrl: "/logos/SOKM.png" },
    { symbol: "CIMSA", name: "Çimsa Çimento Sanayi ve Ticaret A.Ş.", logoUrl: "/logos/CIMSA.png" },
    { symbol: "AKSEN", name: "Aksa Enerji Üretim A.Ş.", logoUrl: "/logos/AKSEN.png" },
    { symbol: "AGHOL", name: "Ag Anadolu Grubu Holding A.Ş.", logoUrl: "/logos/AGHOL.png" },
    { symbol: "ZOREN", name: "Zorlu Enerji Elektrik Üretim A.Ş.", logoUrl: "/logos/ZOREN.png" },
    { symbol: "TKFEN", name: "Tekfen Holding A.Ş.", logoUrl: "/logos/TKFEN.png" },
    { symbol: "YATAS", name: "Yataş Yatak ve Yorgan Sanayi Ticaret A.Ş.", logoUrl: "/logos/YATAS.png" },
    { symbol: "GUBRF", name: "Gübre Fabrikaları T.A.Ş.", logoUrl: "/logos/GUBRF.png" },
    { symbol: "BRSAN", name: "Borusan Mannesmann Boru Sanayi ve Ticaret A.Ş.", logoUrl: "/logos/BRSAN.png" },
    { symbol: "BRYAT", name: "Borusan Yatırım ve Pazarlama A.Ş.", logoUrl: "/logos/BRYAT.png" },
    { symbol: "ODAS", name: "Odaş Elektrik Üretim Sanayi Ticaret A.Ş.", logoUrl: "/logos/ODAS.png" },
    { symbol: "CCOLA", name: "Coca-Cola İçecek A.Ş.", logoUrl: "/logos/CCOLA.png" },
    { symbol: "KORDS", name: "Kordsa Teknik Tekstil A.Ş.", logoUrl: "/logos/KORDS.png" },
    { symbol: "SOKE", name: "Söke Değirmencilik Sanayi ve Ticaret A.Ş.", logoUrl: "/logos/SOKE.png" },
    { symbol: "TRGYO", name: "Torunlar Gayrimenkul Yatırım Ortaklığı A.Ş.", logoUrl: "/logos/TRGYO.png" },
    { symbol: "ISMEN", name: "İş Yatırım Menkul Değerler A.Ş.", logoUrl: "/logos/ISMEN.png" },
    { symbol: "ISDMR", name: "İskenderun Demir ve Çelik A.Ş.", logoUrl: "/logos/ISDMR.png" },
    { symbol: "NTHOL", name: "Net Holding A.Ş.", logoUrl: "/logos/NTHOL.png" },
    { symbol: "SNGYO", name: "Sinpaş Gayrimenkul Yatırım Ortaklığı A.Ş.", logoUrl: "/logos/SNGYO.png" },
    { symbol: "PENTA", name: "Penta Teknoloji Ürünleri Dağıtım Ticaret A.Ş.", logoUrl: "/logos/PENTA.png" },
    { symbol: "ECZYT", name: "Eczacıbaşı Yatırım Holding Ortaklığı A.Ş.", logoUrl: "/logos/ECZYT.png" },
    { symbol: "AKFGY", name: "Akfen Gayrimenkul Yatırım Ortaklığı A.Ş.", logoUrl: "/logos/AKFGY.png" },
    { symbol: "AKSGY", name: "Akiş Gayrimenkul Yatırım Ortaklığı A.Ş.", logoUrl: "/logos/AKSGY.png" },
    { symbol: "ALFAS", name: "Alfa Solar Enerji Sanayi ve Ticaret A.Ş.", logoUrl: "/logos/ALFAS.png" },
    { symbol: "ANHYT", name: "Anadolu Hayat Emeklilik A.Ş.", logoUrl: "/logos/ANHYT.png" },
    { symbol: "ASUZU", name: "Anadolu Isuzu Otomotiv Sanayi ve Ticaret A.Ş.", logoUrl: "/logos/ASUZU.png" },
    { symbol: "AYDEM", name: "Aydem Yenilenebilir Enerji A.Ş.", logoUrl: "/logos/AYDEM.png" },
    { symbol: "AYGAZ", name: "Aygaz A.Ş.", logoUrl: "/logos/AYGAZ.png" },
    { symbol: "BAGFS", name: "Bagfaş Bandırma Gübre Fabrikaları A.Ş.", logoUrl: "/logos/BAGFS.png" },
    { symbol: "BANVT", name: "Banvit Bandırma Vitaminli Yem Sanayii A.Ş.", logoUrl: "/logos/BANVT.png" },
    { symbol: "BERA", name: "Bera Holding A.Ş.", logoUrl: "/logos/BERA.png" },
    { symbol: "BFREN", name: "Bosch Fren Sistemleri Sanayi ve Ticaret A.Ş.", logoUrl: "/logos/BFREN.png" },
    { symbol: "BIOEN", name: "Biotrend Çevre ve Enerji Yatırımları A.Ş.", logoUrl: "/logos/BIOEN.png" },
    { symbol: "BIZIM", name: "Bizim Toptan Satış Mağazaları A.Ş.", logoUrl: "/logos/BIZIM.png" },
    { symbol: "BRISA", name: "Brisa Brıdgestone Sabancı Lastik Sanayi ve Ticaret A.Ş.", logoUrl: "/logos/BRISA.png" },
    { symbol: "BUCIM", name: "Bursa Çimento Fabrikası A.Ş.", logoUrl: "/logos/BUCIM.png" },
    { symbol: "CANTE", name: "Çan2 Termik A.Ş.", logoUrl: "/logos/CANTE.png" },
    { symbol: "CEMTS", name: "Çemtaş Çelik Makina Sanayi ve Ticaret A.Ş.", logoUrl: "/logos/CEMTS.png" },
    { symbol: "CLEBI", name: "Çelebi Hava Servisi A.Ş.", logoUrl: "/logos/CLEBI.png" },
    { symbol: "DOAS", name: "Doğuş Otomotiv Servis ve Ticaret A.Ş.", logoUrl: "/logos/DOAS.png" },
    { symbol: "ECILC", name: "Eis Eczacıbaşı İlaç Sınai ve Finansal Yatırımlar Sanayi ve Ticaret A.Ş.", logoUrl: "/logos/ECILC.png" },
    { symbol: "EGEEN", name: "Ege Endüstri ve Ticaret A.Ş.", logoUrl: "/logos/EGEEN.png" },
    { symbol: "ENJSA", name: "Enerjisa Enerji A.Ş.", logoUrl: "/logos/ENJSA.png" },
    { symbol: "ESEN", name: "Esenboğa Elektrik Üretim A.Ş.", logoUrl: "/logos/ESEN.png" },
    { symbol: "GESAN", name: "Girişim Elektrik Sanayi Taahhüt ve Ticaret A.Ş.", logoUrl: "/logos/GESAN.png" },
    { symbol: "GLYHO", name: "Global Yatırım Holding A.Ş.", logoUrl: "/logos/GLYHO.png" },
    { symbol: "GOLTS", name: "Göltaş Göller Bölgesi Çimento Sanayi ve Ticaret A.Ş.", logoUrl: "/logos/GOLTS.png" },
    { symbol: "GSDHO", name: "Gsd Holding A.Ş.", logoUrl: "/logos/GSDHO.png" },
    { symbol: "GWIND", name: "Galata Wınd Enerji A.Ş.", logoUrl: "/logos/GWIND.png" },
    { symbol: "ICBCT", name: "Icbc Turkey Bank A.Ş.", logoUrl: "/logos/ICBCT.png" },
    { symbol: "IPEKE", name: "İpek Doğal Enerji Kaynakları Araştırma ve Üretim A.Ş.", logoUrl: "/logos/IPEKE.png" },
    { symbol: "ISFIN", name: "İş Finansal Kiralama A.Ş.", logoUrl: "/logos/ISFIN.png" },
    { symbol: "IZMDC", name: "İzmir Demir Çelik Sanayi A.Ş.", logoUrl: "/logos/IZMDC.png" },
    { symbol: "KLSER", name: "Kaleseramik Çanakkale Kalebodur Seramik Sanayi A.Ş.", logoUrl: "/logos/KLSER.png" },
    { symbol: "KMPUR", name: "Kimteks Poliüretan Sanayi ve Ticaret A.Ş.", logoUrl: "/logos/KMPUR.png" },
    { symbol: "KONYA", name: "Konya Çimento Sanayii A.Ş.", logoUrl: "/logos/KONYA.png" },
    { symbol: "KUYAS", name: "Kuyaş Yatırım A.Ş.", logoUrl: "/logos/KUYAS.png" },
    { symbol: "MACKO", name: "Mackolik İnternet Hizmetleri Ticaret A.Ş.", logoUrl: "/logos/MACKO.png" },
    { symbol: "MPARK", name: "Mlp Sağlık Hizmetleri A.Ş.", logoUrl: "/logos/MPARK.png" },
    { symbol: "NUHCM", name: "Nuh Çimento Sanayi A.Ş.", logoUrl: "/logos/NUHCM.png" },
    { symbol: "OYAYO", name: "Oyak Yatırım Ortaklığı A.Ş.", logoUrl: "/logos/OYAYO.png" },
    { symbol: "PARSN", name: "Parsan Makina Parçaları Sanayii A.Ş.", logoUrl: "/logos/PARSN.png" },
    { symbol: "PRKME", name: "Park Elektrik Üretim Madencilik Sanayi ve Ticaret A.Ş.", logoUrl: "/logos/PRKME.png" },
    { symbol: "QUAGR", name: "Qua Granıte Hayal Yapı ve Ürünleri Sanayi Ticaret A.Ş.", logoUrl: "/logos/QUAGR.png" },
    { symbol: "SELEC", name: "Selçuk Ecza Deposu Ticaret ve Sanayi A.Ş.", logoUrl: "/logos/SELEC.png" },
    { symbol: "SEYKM", name: "Seyitler Kimya Sanayi A.Ş.", logoUrl: "/logos/SEYKM.png" },
    { symbol: "SKBNK", name: "Şekerbank T.A.Ş.", logoUrl: "/logos/SKBNK.png" },
    { symbol: "SNKRN", name: "Senkron Siber Güvenlik Yazılım ve Bilişim Çözümleri A.Ş.", logoUrl: "/logos/SNKRN.png" },
    { symbol: "TATGD", name: "Tat Gıda Sanayi A.Ş.", logoUrl: "/logos/TATGD.png" },
    { symbol: "TDGYO", name: "Trend Gayrimenkul Yatırım Ortaklığı A.Ş.", logoUrl: "/logos/TDGYO.png" },
    { symbol: "TEZOL", name: "Europap Tezol Kağıt Sanayi ve Ticaret A.Ş.", logoUrl: "/logos/TEZOL.png" },
    { symbol: "TMSN", name: "Tümosan Motor ve Traktör Sanayi A.Ş.", logoUrl: "/logos/TMSN.png" },
    { symbol: "TRCAS", name: "Turcas Petrol A.Ş.", logoUrl: "/logos/TRCAS.png" },
    { symbol: "TUKAS", name: "Tukaş Gıda Sanayi ve Ticaret A.Ş.", logoUrl: "/logos/TUKAS.png" },
    { symbol: "TUREX", name: "Tureks Turizm Taşımacılık A.Ş.", logoUrl: "/logos/TUREX.png" },
    { symbol: "ULUUN", name: "Ulusoy Un Sanayi ve Ticaret A.Ş.", logoUrl: "/logos/ULUUN.png" },
    { symbol: "VAKFN", name: "Vakıf Finansal Kiralama A.Ş.", logoUrl: "/logos/VAKFN.png" },
    { symbol: "VERUS", name: "Verusa Holding A.Ş.", logoUrl: "/logos/VERUS.png" },
    { symbol: "YUNSA", name: "Yünsa Yünlü Sanayi ve Ticaret A.Ş.", logoUrl: "/logos/YUNSA.png" },
    { symbol: "ZRGYO", name: "Ziraat Gayrimenkul Yatırım Ortaklığı A.Ş.", logoUrl: "/logos/ZRGYO.png" },
  ];
  for (const s of bistStocks) {
    await prisma.asset.upsert({
      where: { symbol: s.symbol },
      update: { logoUrl: s.logoUrl },
      create: {
        symbol: s.symbol,
        name: s.name,
        logoUrl: s.logoUrl,
        type: "STOCK",
        currency: "TRY",
        decimalPrecision: 2,
        isActive: true,
        tradingEnabled: true,
        visibility: "PUBLIC",
      },
    });
  }


  // Nasdaq-listed US equities — catalog entries only (symbol + name). Prices are
  // fetched live from Yahoo Finance; nothing here is a price or a fabricated figure.
  const usStocks = [{"symbol":"AAPL","name":"Apple"},{"symbol":"MSFT","name":"Microsoft"},{"symbol":"NVDA","name":"NVIDIA"},{"symbol":"AMZN","name":"Amazon"},{"symbol":"GOOGL","name":"Alphabet (Class A)"},{"symbol":"GOOG","name":"Alphabet (Class C)"},{"symbol":"META","name":"Meta Platforms"},{"symbol":"TSLA","name":"Tesla"},{"symbol":"AVGO","name":"Broadcom"},{"symbol":"NFLX","name":"Netflix"},{"symbol":"AMD","name":"Advanced Micro Devices"},{"symbol":"ADBE","name":"Adobe"},{"symbol":"INTC","name":"Intel"},{"symbol":"CSCO","name":"Cisco Systems"},{"symbol":"PEP","name":"PepsiCo"},{"symbol":"COST","name":"Costco"},{"symbol":"QCOM","name":"Qualcomm"},{"symbol":"TXN","name":"Texas Instruments"},{"symbol":"AMGN","name":"Amgen"},{"symbol":"INTU","name":"Intuit"},{"symbol":"SBUX","name":"Starbucks"},{"symbol":"ISRG","name":"Intuitive Surgical"},{"symbol":"BKNG","name":"Booking Holdings"},{"symbol":"MDLZ","name":"Mondelez"},{"symbol":"GILD","name":"Gilead Sciences"},{"symbol":"ADI","name":"Analog Devices"},{"symbol":"REGN","name":"Regeneron"},{"symbol":"VRTX","name":"Vertex Pharmaceuticals"},{"symbol":"PANW","name":"Palo Alto Networks"},{"symbol":"LRCX","name":"Lam Research"},{"symbol":"MU","name":"Micron Technology"},{"symbol":"KLAC","name":"KLA Corporation"},{"symbol":"SNPS","name":"Synopsys"},{"symbol":"CDNS","name":"Cadence Design"},{"symbol":"MELI","name":"MercadoLibre"},{"symbol":"PYPL","name":"PayPal"},{"symbol":"ABNB","name":"Airbnb"},{"symbol":"PDD","name":"PDD Holdings"},{"symbol":"ASML","name":"ASML Holding"},{"symbol":"ARM","name":"Arm Holdings"},{"symbol":"SMCI","name":"Super Micro Computer"},{"symbol":"PLTR","name":"Palantir"}];
  for (const s of usStocks) {
    await prisma.asset.upsert({
      where: { symbol: s.symbol },
      update: {},
      create: {
        symbol: s.symbol,
        name: s.name,
        type: "US_STOCK",
        currency: "USD",
        decimalPrecision: 2,
        isActive: true,
        tradingEnabled: true,
        visibility: "PUBLIC",
      },
    });
  }

  // Popular cryptocurrencies — catalog entries only. Prices come live from CoinGecko's public
  // API (see src/lib/market-data/providers/coingecko-provider.ts); nothing here is a fabricated price.
  // Names and logos are fetched from CoinGecko itself at seed time, not typed in by hand, so a
  // re-run keeps them in sync; if the fetch fails (offline, rate limit) the seed still proceeds —
  // assets are created with a readable fallback name and no logo rather than failing outright.
  const cryptoIds = [
    "bitcoin", "ethereum", "tether", "binancecoin", "solana", "ripple", "usd-coin", "dogecoin",
    "cardano", "tron", "the-open-network", "avalanche-2", "shiba-inu", "polkadot", "chainlink",
    "matic-network", "litecoin", "bitcoin-cash", "internet-computer", "uniswap", "ethereum-classic",
    "stellar", "cosmos", "filecoin", "aptos", "near", "optimism", "arbitrum", "vechain",
    "hedera-hashgraph", "sui", "pepe", "injective-protocol", "aave", "maker",
  ];
  let cryptoLogos = new Map<string, { name: string; symbol: string; image: string }>();
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=try&ids=${cryptoIds.join(",")}&per_page=${cryptoIds.length}`,
      { signal: AbortSignal.timeout(15_000) }
    );
    if (res.ok) {
      const rows: { id: string; name: string; symbol: string; image: string }[] = await res.json();
      cryptoLogos = new Map(rows.map((r) => [r.id, { name: r.name, symbol: r.symbol.toUpperCase(), image: r.image }]));
    }
  } catch {
    // Offline or rate-limited — fall through and seed without live names/logos this run.
  }
  // CoinGecko's own `symbol` field is occasionally a legacy/renamed ticker that no longer matches
  // the coin's actual trading symbol on Binance (our price source) — e.g. it still reports "GRAM"
  // for The Open Network, which is a *different*, unrelated listing on Binance. Known mismatches
  // are corrected here so we never price or trade the wrong asset under the right-looking name.
  const SYMBOL_OVERRIDES: Record<string, string> = { "the-open-network": "TON" };
  // Same idea for the display name: CoinGecko's own `name` for this id is the confusing
  // "Gram (prev. Toncoin)" — the ticker/price are for the real, current TON, just labelled oddly.
  const NAME_OVERRIDES: Record<string, string> = { "the-open-network": "Toncoin" };
  for (const id of cryptoIds) {
    const meta = cryptoLogos.get(id);
    const symbol = SYMBOL_OVERRIDES[id] ?? meta?.symbol ?? id.slice(0, 10).toUpperCase();
    const name = NAME_OVERRIDES[id] ?? meta?.name ?? id;
    await prisma.asset.upsert({
      where: { symbol },
      update: { coingeckoId: id, ...(meta ? { name, logoUrl: meta.image } : {}) },
      create: {
        symbol,
        name,
        logoUrl: meta?.image ?? null,
        type: "CRYPTO",
        currency: "TRY",
        coingeckoId: id,
        decimalPrecision: 2,
        isActive: true,
        tradingEnabled: true,
        visibility: "PUBLIC",
      },
    });
  }
  console.log(`Seeded ${cryptoIds.length} crypto assets${cryptoLogos.size > 0 ? " with live names/logos" : " (CoinGecko unreachable — names/logos not updated this run)"}.`);

  // Faiz Konfigürasyonu's base annual rates — every term product's own rate is this × its
  // rateMultiplier (see recomputeTermProductRates()). Upserted, never overwritten on re-seed.
  const interestConfig = await prisma.interestConfig.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", tryAnnualRate: "50", usdAnnualRate: "6", autoDistribute: true, earlyWithdrawalPenaltyPercent: "50" },
  });

  // Term deposit products per currency. Existing (currency, term) rows are left untouched
  // (admin edits survive re-running the seed) — only missing pairs are created, with a rate
  // computed from the base rate above × this term's multiplier.
  const TERM_OPTIONS: { termDays: number; label: string; multiplier: string; minAmountTRY: string; minAmountUSD: string }[] = [
    { termDays: 1, label: "1 Günlük", multiplier: "0.85", minAmountTRY: "100", minAmountUSD: "100" },
    { termDays: 7, label: "7 Günlük", multiplier: "0.95", minAmountTRY: "500", minAmountUSD: "100" },
    { termDays: 15, label: "15 Günlük", multiplier: "1", minAmountTRY: "1000", minAmountUSD: "100" },
    { termDays: 30, label: "30 Günlük", multiplier: "1.05", minAmountTRY: "2500", minAmountUSD: "100" },
    { termDays: 90, label: "90 Günlük", multiplier: "1.15", minAmountTRY: "10000", minAmountUSD: "100" },
    { termDays: 180, label: "180 Günlük", multiplier: "1.25", minAmountTRY: "25000", minAmountUSD: "100" },
  ];
  let position = 0;
  for (const currency of ["TRY", "USD"] as const) {
    const baseRate = currency === "TRY" ? Number(interestConfig.tryAnnualRate) : Number(interestConfig.usdAnnualRate);
    for (const term of TERM_OPTIONS) {
      const existing = await prisma.termDepositProduct.findFirst({ where: { currency, termDays: term.termDays } });
      if (!existing) {
        await prisma.termDepositProduct.create({
          data: {
            currency,
            termDays: term.termDays,
            label: term.label,
            rateMultiplier: term.multiplier,
            annualRate: (baseRate * Number(term.multiplier)).toFixed(4),
            minAmount: currency === "TRY" ? term.minAmountTRY : term.minAmountUSD,
            position: position++,
            isActive: true,
          },
        });
      }
    }
  }

  // Per-asset-class leveraged-trading terms (see prisma/schema.prisma's LeverageConfig doc
  // comment) — one row per AssetType, upserted so re-seeding never resets an admin's edits.
  const LEVERAGE_CONFIGS: Record<
    "STOCK" | "US_STOCK" | "COMMODITY" | "INDEX" | "CURRENCY" | "CRYPTO" | "FUND",
    { maxLeverage: number; contractSize: string; minLot: string; spreadPercent: string; longSwap: string; shortSwap: string }
  > = {
    STOCK: { maxLeverage: 10, contractSize: "1", minLot: "1", spreadPercent: "500", longSwap: "-12.5", shortSwap: "8.3" },
    US_STOCK: { maxLeverage: 20, contractSize: "1", minLot: "0.01", spreadPercent: "1500", longSwap: "-8.2", shortSwap: "4.1" },
    COMMODITY: { maxLeverage: 100, contractSize: "100", minLot: "0.01", spreadPercent: "1300", longSwap: "-69", shortSwap: "38" },
    INDEX: { maxLeverage: 100, contractSize: "1", minLot: "0.1", spreadPercent: "5000", longSwap: "-15", shortSwap: "7.5" },
    CURRENCY: { maxLeverage: 500, contractSize: "100000", minLot: "0.01", spreadPercent: "120", longSwap: "-3.5", shortSwap: "1.8" },
    CRYPTO: { maxLeverage: 50, contractSize: "1", minLot: "0.01", spreadPercent: "0", longSwap: "-25", shortSwap: "12.5" },
    FUND: { maxLeverage: 1, contractSize: "1", minLot: "0.01", spreadPercent: "0", longSwap: "0", shortSwap: "0" },
  };
  for (const [type, cfg] of Object.entries(LEVERAGE_CONFIGS)) {
    await prisma.leverageConfig.upsert({
      where: { type: type as keyof typeof LEVERAGE_CONFIGS },
      update: {},
      create: { type: type as keyof typeof LEVERAGE_CONFIGS, ...cfg },
    });
  }

  // Login accepts T.C. or phone only, so the admin is identified by phone (ADMIN_PHONE, 5XXXXXXXXX).
  const adminPhoneLocal = process.env.ADMIN_PHONE;
  const adminPassword = process.env.ADMIN_PASS;
  if (!adminPhoneLocal || !/^5\d{9}$/.test(adminPhoneLocal) || !adminPassword) {
    throw new Error("ADMIN_PHONE (5XXXXXXXXX) and ADMIN_PASS must be set to seed the admin account.");
  }
  const adminPhone = `+90${adminPhoneLocal}`;
  const adminRole = await prisma.role.findUniqueOrThrow({ where: { key: "SUPER_ADMIN" } });

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const passwordEncrypted = encryptSecret(adminPassword);
  const admin = await prisma.user.upsert({
    where: { phone: adminPhone },
    update: {},
    create: {
      phone: adminPhone,
      name: "Ultima Admin",
      passwordHash,
      passwordEncrypted,
      status: "ACTIVE",
      wallet: { create: {} },
      portfolio: { create: {} },
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id },
  });

  await seedInvestmentFunds();
  await seedCampaigns();

  console.log(`Seeded RBAC + BIST exchange. Admin phone: ${adminPhone}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
