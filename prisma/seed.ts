/**
 * Development-only seed data (section 51 of the product spec).
 *
 * This seeds RBAC roles/permissions, the BIST exchange record, and a local
 * admin account so Phase 1 auth/RBAC can be exercised. It intentionally
 * seeds ZERO assets, quotes, or prices — production market data must only
 * ever come from a configured MarketDataProvider, never from seed data.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to run seed data against a production environment.");
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

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@ultima.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const adminRole = await prisma.role.findUniqueOrThrow({ where: { key: "SUPER_ADMIN" } });

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Ultima Admin",
      passwordHash,
      status: "ACTIVE",
      emailVerified: new Date(),
      wallet: { create: {} },
      portfolio: { create: {} },
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id },
  });

  console.log(`Seeded RBAC + BIST exchange. Dev admin: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
