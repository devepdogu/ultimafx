# Graph Report - ultima  (2026-10-12)

## Corpus Check
- 256 files · ~236,473 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 2, .ico 2, .toml 1)

## Summary
- 1217 nodes · 3715 edges · 55 communities (50 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1c5b6b9e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- navigation.ts
- IpoList.tsx
- MarketDataProvider
- EntityEditors.tsx
- requireAdmin
- MarketSummary
- types/index.ts
- auth/actions.ts
- UnimplementedProviderBase
- dependencies
- client.ts
- compilerOptions
- package.json
- MarketsExplorer.tsx
- ayarlar/page.tsx
- LoginForm.tsx
- profil/page.tsx
- devDependencies
- PriceBar
- cached-provider.ts
- WalletTransaction (source of truth rows)
- WalletFlow.tsx
- registry.ts
- This is NOT the Next.js you know (agent rules block)
- funds/service.ts
- WalletHistory.tsx
- next
- feed-actions.ts
- postcss.config.mjs
- DataProvenance (LIVE/DELAYED/MANUAL_OVERRIDE/CACHED/UNAVAILABLE)
- WalletView.tsx
- { GET, POST }
- get-history.ts
- scripts
- FundsList.tsx
- BottomSheet.tsx
- TermDepositView.tsx
- TradeTerminal.tsx
- AccountChangeRows.tsx
- AssetIcon
- rbac.ts
- Link
- DataStatusBadge.tsx
- AssetDetailPage.tsx
- news/sync.ts
- Quote
- cn
- seed.ts
- campaign-actions.ts
- NewsList.tsx
- ThemeToggle.tsx
- types.d.ts
- lucide-react
- eslint.config.mjs

## God Nodes (most connected - your core abstractions)
1. `cn()` - 118 edges
2. `prisma` - 67 edges
3. `Link` - 65 edges
4. `requireAdmin()` - 60 edges
5. `writeAuditLog()` - 57 edges
6. `lucide-react` - 56 edges
7. `react` - 54 edges
8. `formatPrice()` - 31 edges
9. `@prisma/client` - 28 edges
10. `UnimplementedProviderBase` - 28 edges

## Surprising Connections (you probably didn't know these)
- `RegisterForm()` --indirect_call--> `registerAction()`  [INFERRED]
  src/components/auth/RegisterForm.tsx → src/lib/auth/actions.ts
- `PurchaseForm()` --indirect_call--> `purchaseFundAction()`  [INFERRED]
  src/components/funds/FundsList.tsx → src/lib/funds/actions.ts
- `RedeemForm()` --indirect_call--> `redeemFundAction()`  [INFERRED]
  src/components/funds/FundsList.tsx → src/lib/funds/actions.ts
- `UsdTransferForm()` --indirect_call--> `convertCurrencyAction()`  [INFERRED]
  src/components/wallet/UsdTransferForm.tsx → src/lib/wallet/fx-actions.ts
- `ReceiptProvider` --calls--> `presetFor()`  [EXTRACTED]
  src/components/wallet/WalletFlow.tsx → src/lib/admin/presets.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Agent governance documentation chain (CLAUDE.md/.claude/CLAUDE.md/AGENTS.md)** — claude_claude_graphify, claude_graphify_rules, agents_nextjs_agent_rules [EXTRACTED 0.90]
- **Market data provenance and caching flow** — readme_no_fabricated_market_data, readme_data_provenance, readme_market_data_in_redis, src_lib_market_data_marketdataprovider, src_lib_market_data_cached_provider_cachedprovider, docker_compose_redis [INFERRED 0.80]
- **Wallet ledger integrity and trading settlement** — readme_trading_internal, src_lib_trading_engine_tradingengine, readme_wallet_ledger, readme_wallettransaction, readme_wallet_cashbalance [INFERRED 0.85]

## Communities (55 total, 5 thin omitted)

### Community 0 - "navigation.ts"
Cohesion: 0.05
Nodes (50): nextConfig, withNextIntl, next-intl, @tanstack/react-query, AdminLayout(), AppLayout(), GoldMarketPage(), BistMarketPage() (+42 more)

### Community 1 - "IpoList.tsx"
Cohesion: 0.16
Nodes (20): IpoListPage(), Card(), compactTry(), dateText(), FOOTER, IpoDrawer(), IpoList(), IpoRow (+12 more)

### Community 2 - "MarketDataProvider"
Cohesion: 0.16
Nodes (3): MarketDataProvider, UnconfiguredProvider, MarketDataProviderRegistry

### Community 3 - "EntityEditors.tsx"
Cohesion: 0.07
Nodes (84): AdminBankAccountsPage(), AdminBannersPage(), AdminFundsPage(), AdminNewsPage(), AdminIposPage(), STATUS, AdminCampaignsPage(), AdminCryptoAddressesPage() (+76 more)

### Community 4 - "requireAdmin"
Cohesion: 0.07
Nodes (63): ASSET_TYPES, CRYPTO_NETWORKS, IPO_STATUSES, NEWS_CATEGORIES, createBankAccountAction(), schema, toggleBankAccountAction(), bannerSchema (+55 more)

### Community 5 - "MarketSummary"
Cohesion: 0.12
Nodes (7): CachedSnapshot, SYMBOL_MAP, TruncgilProvider, TruncgilProviderConfig, TruncgilResponse, TruncgilRow, MarketSummary

### Community 6 - "types/index.ts"
Cohesion: 0.12
Nodes (13): CachedRates, Rate, TCMBCurrencyRow, TCMBProviderConfig, AssetMeta, AssetRef, AssetType, CorporateActionEvent (+5 more)

### Community 7 - "auth/actions.ts"
Cohesion: 0.22
Nodes (14): bcryptjs, logoutAction(), registerAction(), handlers, signIn, signOut, hashTcKimlik(), isValidTcKimlik() (+6 more)

### Community 8 - "UnimplementedProviderBase"
Cohesion: 0.10
Nodes (10): ProviderNotConfiguredError, BorsaIstanbulProvider, BorsaIstanbulProviderConfig, CryptoProvider, CryptoProviderConfig, ForeksProvider, ForeksProviderConfig, KAPProvider (+2 more)

### Community 9 - "dependencies"
Cohesion: 0.09
Nodes (23): dependencies, @auth/prisma-adapter, bcryptjs, bullmq, clsx, date-fns, decimal.js, fast-xml-parser (+15 more)

### Community 10 - "client.ts"
Cohesion: 0.12
Nodes (19): server-only, InvitePage(), Stat(), STEPS, TIERS, deleteFundAction(), fundSchema, optionalNumber (+11 more)

### Community 11 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 12 - "package.json"
Cohesion: 0.11
Nodes (18): name, private, version, @auth/prisma-adapter, clsx, date-fns, dotenv, flag-icons (+10 more)

### Community 13 - "MarketsExplorer.tsx"
Cohesion: 0.14
Nodes (22): CATEGORY_TYPES, HomeCategoryList(), CATEGORY_TABS, CategoryKey, HomeCategoryPanel(), HomeRow, AssetRow(), AssetRowData (+14 more)

### Community 14 - "ayarlar/page.tsx"
Cohesion: 0.29
Nodes (11): SettingsPage(), AccountChangeRows(), getSnapshot(), NotificationSwitchRow(), subscribe(), SettingsRow(), SettingsRowProps, SettingsSection() (+3 more)

### Community 15 - "LoginForm.tsx"
Cohesion: 0.19
Nodes (14): LoginPage(), RegisterPage(), LegalModal(), LegalModalProps, initialState, LoginForm(), Mode, ConsentKey (+6 more)

### Community 16 - "profil/page.tsx"
Cohesion: 0.18
Nodes (15): Panel(), ProfilePage(), Stat(), KycDocMeta, KycSlot(), KycUploader(), SIDES, Field() (+7 more)

### Community 17 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, dotenv, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/postcss, tsx (+5 more)

### Community 18 - "PriceBar"
Cohesion: 0.18
Nodes (6): BASE_INTERVAL, Kline, Ticker24h, TCMBProvider, PriceBar, PriceInterval

### Community 19 - "cached-provider.ts"
Cohesion: 0.23
Nodes (12): ioredis, cacheAside(), readCache(), writeCacheForever(), globalForRedis, redis, CacheOptions, providerQueue (+4 more)

### Community 20 - "WalletTransaction (source of truth rows)"
Cohesion: 0.20
Nodes (7): postgres service (postgres:17-alpine, port 5434), redis service (redis:7-alpine, port 6380), Wallet.cashBalance (projection field), WalletTransaction (source of truth rows), cached-provider.ts (cache-aside wrapper), MarketDataProvider, trading/engine.ts (order settlement engine)

### Community 21 - "WalletFlow.tsx"
Cohesion: 0.07
Nodes (36): ShareInvite(), share(), Button(), ButtonProps, Size, SIZE_STYLES, Variant, VARIANT_STYLES (+28 more)

### Community 22 - "registry.ts"
Cohesion: 0.18
Nodes (6): CommodityProvider, YAHOO_COMMODITY, YahooFinanceBistProvider, YahooFinanceProvider, YahooFinanceUsProvider, yahooBist

### Community 23 - "This is NOT the Next.js you know (agent rules block)"
Cohesion: 0.40
Nodes (3): graphify skill reference (.claude/CLAUDE.md), Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js, Ultima platform overview

### Community 24 - "funds/service.ts"
Cohesion: 0.35
Nodes (10): FundPurchaseState, purchaseFundAction(), redeemFundAction(), MIN_FUND_PURCHASE_TRY, floorUnits(), FundError, lockCash(), purchaseFund() (+2 more)

### Community 25 - "WalletHistory.tsx"
Cohesion: 0.18
Nodes (20): Bubble(), Card(), CardHeader(), CASH_TITLES, CashRow(), Cell(), dayFmt, dayKey() (+12 more)

### Community 26 - "next"
Cohesion: 0.12
Nodes (16): next, zod, initialState, ReviewRequestFormProps, GENDERS, KYC_TYPES, profileSchema, amountSchema (+8 more)

### Community 27 - "feed-actions.ts"
Cohesion: 0.23
Nodes (10): createIpoAction(), ipoSchema, refreshIposAction(), refreshNewsAction(), toggleIpoPublishedAction(), ipoListSchema, IpoSyncResult, mapStatus() (+2 more)

### Community 30 - "WalletView.tsx"
Cohesion: 0.13
Nodes (26): money, money2(), PnlOverview(), PositionDetail(), PriceScale(), Stat(), toTry(), UsdTransferForm() (+18 more)

### Community 32 - "get-history.ts"
Cohesion: 0.17
Nodes (14): bullmq, GET(), CHART_PERIODS, ChartPeriod, getAssetHistory(), isChartPeriod(), PERIOD_DAYS, marketDataRegistry (+6 more)

### Community 33 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, db:generate, db:migrate, db:seed, db:studio, dev, lint (+3 more)

### Community 34 - "FundsList.tsx"
Cohesion: 0.22
Nodes (16): FundsPage(), aumText(), count, FundDetail(), FundHoldingRow, FundRow, FundsList(), HoldingsSummary() (+8 more)

### Community 35 - "BottomSheet.tsx"
Cohesion: 0.25
Nodes (8): motion, react-dom, IOS_STEPS, MobileInstallAction(), ACTIONS, QuickActions(), BottomSheet(), BottomSheetProps

### Community 36 - "TermDepositView.tsx"
Cohesion: 0.11
Nodes (34): TermDepositPage(), COPY, CurrencyConvertCard(), Direction, initial, money, AccountList(), dateFmt (+26 more)

### Community 37 - "TradeTerminal.tsx"
Cohesion: 0.05
Nodes (70): decimal.js, TradePage(), sessionBadge(), AssetPicker(), AssetPickerProps, FILTERS, PickerAsset, initialState (+62 more)

### Community 38 - "AccountChangeRows.tsx"
Cohesion: 0.27
Nodes (9): AccountForm(), FieldDef, AccountActionState, changeEmailAction(), changeEmailSchema, changePasswordAction(), changePasswordSchema, passwordSchema (+1 more)

### Community 39 - "AssetIcon"
Cohesion: 0.18
Nodes (13): CARD_SYMBOLS, formatCardPrice(), MarketCards(), AssetIcon(), AssetIconProps, FLAG_CODES, hashColor(), MONOGRAM_PALETTE (+5 more)

### Community 40 - "rbac.ts"
Cohesion: 0.17
Nodes (20): @prisma/client, GET(), maskTail(), parseFxMetadata(), WalletPage(), WithdrawPage(), DepositPage(), loadRows() (+12 more)

### Community 41 - "Link"
Cohesion: 0.14
Nodes (28): recharts, AdminDashboardPage(), HomePage(), PortfolioPage(), HomeIpoBanner(), PortfolioHero(), ICONS, RecentActivity() (+20 more)

### Community 42 - "DataStatusBadge.tsx"
Cohesion: 0.20
Nodes (8): Badge(), BadgeProps, Tone, TONE_STYLES, TONE, ResolvedPrice, DataProvenance, HoldingRow

### Community 43 - "AssetDetailPage.tsx"
Cohesion: 0.19
Nodes (13): GoldAssetPage(), BorsaAssetPage(), FxAssetPage(), CryptoAssetPage(), NasdaqAssetPage(), AssetDetailPage(), AssetDetailPageProps, Cell() (+5 more)

### Community 45 - "news/sync.ts"
Cohesion: 0.18
Nodes (11): fast-xml-parser, categorize(), IncomingArticle, JSON_CATEGORY, jsonSchema, NewsSyncResult, readJsonNews(), readRssNews() (+3 more)

### Community 47 - "cn"
Cohesion: 0.14
Nodes (18): react, HomeBanners(), PromoCarousel(), PromoSlide, ChartKind, PERIODS, PriceChart(), PriceChartProps (+10 more)

### Community 48 - "seed.ts"
Cohesion: 0.28
Nodes (8): CAMPAIGNS, INVESTMENT_FUNDS, main(), PERMISSIONS, prisma, ROLES, seedCampaigns(), seedInvestmentFunds()

### Community 49 - "campaign-actions.ts"
Cohesion: 0.36
Nodes (6): STATUS_LABEL, campaignSchema, deleteCampaignAction(), saveCampaignAction(), slugify(), toggleCampaignAction()

### Community 50 - "NewsList.tsx"
Cohesion: 0.36
Nodes (6): NewsPage(), NewsList(), TABS, getNewsFeed(), NewsItem, relativeTime()

### Community 51 - "ThemeToggle.tsx"
Cohesion: 0.43
Nodes (7): getServerSnapshot(), getSnapshot(), setTheme(), subscribe(), Theme, ThemeToggle(), useTheme()

### Community 52 - "types.d.ts"
Cohesion: 0.29
Nodes (6): next-auth, JWT, next-auth, next-auth/jwt, Session, User

### Community 53 - "lucide-react"
Cohesion: 0.53
Nodes (4): lucide-react, RewardsPage(), CampaignCard(), ICONS

### Community 56 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

## Ambiguous Edges - Review These
- `Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js` → `This is NOT the Next.js you know (agent rules block)`  [AMBIGUOUS]
  AGENTS.md · relation: conceptually_related_to

## Knowledge Gaps
- **338 isolated node(s):** `eslintConfig`, `withNextIntl`, `nextConfig`, `name`, `version` (+333 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 374 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js` and `This is NOT the Next.js you know (agent rules block)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `cn()` connect `cn` to `navigation.ts`, `IpoList.tsx`, `EntityEditors.tsx`, `client.ts`, `MarketsExplorer.tsx`, `ayarlar/page.tsx`, `LoginForm.tsx`, `profil/page.tsx`, `WalletFlow.tsx`, `WalletHistory.tsx`, `WalletView.tsx`, `FundsList.tsx`, `TermDepositView.tsx`, `TradeTerminal.tsx`, `AssetIcon`, `Link`, `DataStatusBadge.tsx`, `AssetDetailPage.tsx`, `NewsList.tsx`, `lucide-react`?**
  _High betweenness centrality (0.134) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `withNextIntl`, `nextConfig` to the rest of the system?**
  _338 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `navigation.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.053208137715179966 - nodes in this community are weakly interconnected._
- **Why does `react` connect `cn` to `navigation.ts`, `IpoList.tsx`, `EntityEditors.tsx`, `requireAdmin`, `package.json`, `MarketsExplorer.tsx`, `ayarlar/page.tsx`, `LoginForm.tsx`, `profil/page.tsx`, `WalletFlow.tsx`, `WalletHistory.tsx`, `next`, `WalletView.tsx`, `FundsList.tsx`, `BottomSheet.tsx`, `TermDepositView.tsx`, `TradeTerminal.tsx`, `AccountChangeRows.tsx`, `AssetIcon`, `Link`, `DataStatusBadge.tsx`, `AssetDetailPage.tsx`, `NewsList.tsx`, `ThemeToggle.tsx`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Should `EntityEditors.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0723996723996724 - nodes in this community are weakly interconnected._
- **Why does `prisma` connect `client.ts` to `navigation.ts`, `IpoList.tsx`, `EntityEditors.tsx`, `requireAdmin`, `auth/actions.ts`, `MarketsExplorer.tsx`, `profil/page.tsx`, `funds/service.ts`, `next`, `feed-actions.ts`, `get-history.ts`, `FundsList.tsx`, `TermDepositView.tsx`, `TradeTerminal.tsx`, `AccountChangeRows.tsx`, `AssetIcon`, `rbac.ts`, `Link`, `AssetDetailPage.tsx`, `news/sync.ts`, `cn`, `campaign-actions.ts`, `lucide-react`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._