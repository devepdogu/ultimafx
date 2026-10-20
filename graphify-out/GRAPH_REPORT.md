# Graph Report - ultima  (2026-10-21)

## Corpus Check
- 266 files · ~243,868 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 5, .ico 2, .toml 1)

## Summary
- 1266 nodes · 3854 edges · 59 communities (52 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f1c2e1d4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Toaster.tsx
- IpoList.tsx
- MarketDataProvider
- ContentForms.tsx
- writeAuditLog
- truncgil-provider.ts
- types/index.ts
- auth/actions.ts
- UnimplementedProviderBase
- dependencies
- client.ts
- compilerOptions
- package.json
- AssetIcon
- ayarlar/page.tsx
- feed-actions.ts
- account-actions.ts
- devDependencies
- PriceBar
- cached-provider.ts
- WalletTransaction (source of truth rows)
- WalletFlow.tsx
- registry.ts
- This is NOT the Next.js you know (agent rules block)
- requireAdmin
- WalletHistory.tsx
- zod
- news/sync.ts
- postcss.config.mjs
- DataProvenance (LIVE/DELAYED/MANUAL_OVERRIDE/CACHED/UNAVAILABLE)
- cn
- { GET, POST }
- manual-simulation.ts
- scripts
- FundsList.tsx
- Link
- TermDepositView.tsx
- (app)/page.tsx
- user-actions.ts
- MarketCards.tsx
- react
- seed.ts
- @prisma/client
- AssetDetailPage.tsx
- ThemeToggle.tsx
- Quote
- PriceChart.tsx
- feed.ts
- campaign-actions.ts
- navigation.ts
- DataStatusBadge.tsx
- HomeBanners.tsx
- TradeTerminal.tsx
- eslint.config.mjs
- cn.ts
- types.d.ts
- MarketsExplorer.tsx
- deploy.sh

## God Nodes (most connected - your core abstractions)
1. `cn()` - 118 edges
2. `prisma` - 67 edges
3. `Link` - 66 edges
4. `requireAdmin()` - 65 edges
5. `writeAuditLog()` - 62 edges
6. `lucide-react` - 56 edges
7. `react` - 55 edges
8. `formatPrice()` - 31 edges
9. `@prisma/client` - 30 edges
10. `UnimplementedProviderBase` - 28 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `encryptSecret()`  [EXTRACTED]
  prisma/seed.ts → src/lib/crypto/secret-box.ts
- `LoginForm()` --indirect_call--> `loginAction()`  [INFERRED]
  src/components/auth/LoginForm.tsx → src/lib/auth/actions.ts
- `RegisterForm()` --indirect_call--> `registerAction()`  [INFERRED]
  src/components/auth/RegisterForm.tsx → src/lib/auth/actions.ts
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

## Communities (59 total, 7 thin omitted)

### Community 0 - "Toaster.tsx"
Cohesion: 0.11
Nodes (19): AdminSitePage(), AuthLayout(), FONT_VARS, LocaleLayout(), metadata, ToastApi, ToastCard(), ToastContext (+11 more)

### Community 1 - "IpoList.tsx"
Cohesion: 0.16
Nodes (19): Card(), compactTry(), dateText(), FOOTER, IpoDrawer(), IpoList(), IpoRow, IpoStatus (+11 more)

### Community 3 - "ContentForms.tsx"
Cohesion: 0.06
Nodes (93): AdminBankAccountsPage(), AdminBannersPage(), AdminFundsPage(), AdminNewsPage(), AdminIposPage(), STATUS, AdminCampaignsPage(), STATUS_LABEL (+85 more)

### Community 4 - "writeAuditLog"
Cohesion: 0.12
Nodes (29): assetSchema, bankSchema, BIST_TYPES, CATEGORIES, cryptoSchema, deleteAssetAction(), deleteBankAction(), deleteCryptoAction() (+21 more)

### Community 5 - "truncgil-provider.ts"
Cohesion: 0.12
Nodes (7): CachedSnapshot, SYMBOL_MAP, TruncgilProvider, TruncgilProviderConfig, TruncgilResponse, TruncgilRow, AssetMeta

### Community 6 - "types/index.ts"
Cohesion: 0.12
Nodes (15): CachedRates, Rate, TCMBCurrencyRow, TCMBProviderConfig, UnconfiguredProvider, AssetRef, AssetType, CorporateActionEvent (+7 more)

### Community 7 - "auth/actions.ts"
Cohesion: 0.19
Nodes (16): @auth/prisma-adapter, loginAction(), logoutAction(), registerAction(), auth, handlers, signIn, signOut (+8 more)

### Community 8 - "UnimplementedProviderBase"
Cohesion: 0.10
Nodes (10): ProviderNotConfiguredError, BorsaIstanbulProvider, BorsaIstanbulProviderConfig, CryptoProvider, CryptoProviderConfig, ForeksProvider, ForeksProviderConfig, KAPProvider (+2 more)

### Community 9 - "dependencies"
Cohesion: 0.09
Nodes (23): dependencies, @auth/prisma-adapter, bcryptjs, bullmq, clsx, date-fns, decimal.js, fast-xml-parser (+15 more)

### Community 10 - "client.ts"
Cohesion: 0.11
Nodes (21): nextConfig, withNextIntl, next, bannerSchema, deleteBannerAction(), optionalUrl, saveBannerAction(), AdminActionResult (+13 more)

### Community 11 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 12 - "package.json"
Cohesion: 0.11
Nodes (17): name, private, version, clsx, date-fns, dotenv, flag-icons, prisma (+9 more)

### Community 13 - "AssetIcon"
Cohesion: 0.19
Nodes (18): AssetIcon(), AssetIconProps, FLAG_CODES, hashColor(), MONOGRAM_PALETTE, tradingViewLogo(), TV_COUNTRY, AssetRow() (+10 more)

### Community 14 - "ayarlar/page.tsx"
Cohesion: 0.23
Nodes (14): SettingsPage(), setTheme(), AccountChangeRows(), AccountForm(), FieldDef, getSnapshot(), NotificationSwitchRow(), subscribe() (+6 more)

### Community 15 - "feed-actions.ts"
Cohesion: 0.21
Nodes (11): createIpoAction(), ipoSchema, refreshIposAction(), refreshNewsAction(), toggleIpoPublishedAction(), ipoListSchema, IpoSyncResult, mapStatus() (+3 more)

### Community 16 - "account-actions.ts"
Cohesion: 0.23
Nodes (10): AccountActionState, changeEmailAction(), changeEmailSchema, changePasswordAction(), changePasswordSchema, passwordSchema, verifyCurrentPassword(), decryptSecret() (+2 more)

### Community 17 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, dotenv, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/postcss, tsx (+5 more)

### Community 19 - "cached-provider.ts"
Cohesion: 0.23
Nodes (12): ioredis, cacheAside(), readCache(), writeCacheForever(), globalForRedis, redis, CacheOptions, providerQueue (+4 more)

### Community 20 - "WalletTransaction (source of truth rows)"
Cohesion: 0.20
Nodes (7): postgres service (postgres:17-alpine, port 5434), redis service (redis:7-alpine, port 6380), Wallet.cashBalance (projection field), WalletTransaction (source of truth rows), cached-provider.ts (cache-aside wrapper), MarketDataProvider, trading/engine.ts (order settlement engine)

### Community 21 - "WalletFlow.tsx"
Cohesion: 0.07
Nodes (42): WithdrawPage(), DepositPage(), initialState, ReviewRequestFormProps, ShareInvite(), share(), Button(), ButtonProps (+34 more)

### Community 22 - "registry.ts"
Cohesion: 0.17
Nodes (6): CommodityProvider, YAHOO_COMMODITY, YahooFinanceBistProvider, YahooFinanceProvider, YahooFinanceUsProvider, yahooBist

### Community 23 - "This is NOT the Next.js you know (agent rules block)"
Cohesion: 0.40
Nodes (3): graphify skill reference (.claude/CLAUDE.md), Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js, Ultima platform overview

### Community 24 - "requireAdmin"
Cohesion: 0.13
Nodes (21): createBankAccountAction(), schema, toggleBankAccountAction(), assetSchema, bannerSchema, createAssetAction(), createBannerAction(), createInvestmentFundAction() (+13 more)

### Community 25 - "WalletHistory.tsx"
Cohesion: 0.19
Nodes (19): Bubble(), Card(), CardHeader(), CASH_TITLES, CashRow(), Cell(), dayFmt, dayKey() (+11 more)

### Community 26 - "zod"
Cohesion: 0.31
Nodes (7): zod, approveDepositAction(), approveWithdrawalAction(), lockWalletByUserId(), rejectDepositAction(), rejectWithdrawalAction(), reviewRequestSchema

### Community 27 - "news/sync.ts"
Cohesion: 0.17
Nodes (11): fast-xml-parser, categorize(), IncomingArticle, JSON_CATEGORY, jsonSchema, NewsSyncResult, readJsonNews(), readRssNews() (+3 more)

### Community 30 - "cn"
Cohesion: 0.14
Nodes (25): maskTail(), parseFxMetadata(), WalletPage(), HoldingsSummary(), UsdTransferForm(), FxDetails, IconBubble(), ListCard() (+17 more)

### Community 32 - "manual-simulation.ts"
Cohesion: 0.07
Nodes (40): bullmq, server-only, GET(), InvitePage(), Stat(), STEPS, TIERS, InviteProgram() (+32 more)

### Community 33 - "scripts"
Cohesion: 0.15
Nodes (13): scripts, build, db:deploy, db:generate, db:migrate, db:seed, db:studio, dev (+5 more)

### Community 34 - "FundsList.tsx"
Cohesion: 0.16
Nodes (24): FundsPage(), aumText(), count, FundDetail(), FundHoldingRow, FundRow, FundsList(), PurchaseForm() (+16 more)

### Community 35 - "Link"
Cohesion: 0.14
Nodes (16): lucide-react, AdminDashboardPage(), IpoHeader(), IpoListPage(), RewardsPage(), IOS_STEPS, MobileInstallAction(), ACTIONS (+8 more)

### Community 36 - "TermDepositView.tsx"
Cohesion: 0.06
Nodes (55): TermDepositPage(), Panel(), ProfilePage(), Stat(), KycDocMeta, KycSlot(), KycUploader(), SIDES (+47 more)

### Community 37 - "(app)/page.tsx"
Cohesion: 0.14
Nodes (30): HomePage(), PortfolioPage(), HomeBanners(), CATEGORY_TYPES, HomeCategoryList(), CATEGORY_TABS, CategoryKey, HomeCategoryPanel() (+22 more)

### Community 38 - "user-actions.ts"
Cohesion: 0.19
Nodes (12): adjustSchema, adjustUserBalanceAction(), holdingSchema, newPasswordSchema, revealUserPasswordAction(), reviewKycAction(), round2(), round6() (+4 more)

### Community 39 - "MarketCards.tsx"
Cohesion: 0.21
Nodes (9): recharts, CARD_SYMBOLS, formatCardPrice(), MarketCards(), AllocationDonutProps, COLORS, TYPE_TO_KEY, Sparkline() (+1 more)

### Community 40 - "react"
Cohesion: 0.19
Nodes (14): react, LoginPage(), RegisterPage(), LegalModal(), LegalModalProps, initialState, LoginForm(), Mode (+6 more)

### Community 41 - "seed.ts"
Cohesion: 0.24
Nodes (9): CAMPAIGNS, INVESTMENT_FUNDS, main(), PERMISSIONS, prisma, ROLES, seedCampaigns(), seedInvestmentFunds() (+1 more)

### Community 42 - "@prisma/client"
Cohesion: 0.38
Nodes (6): @prisma/client, ResolvedPrice, DataProvenance, HoldingViewModel, HoldingRow, PortfolioSummary

### Community 43 - "AssetDetailPage.tsx"
Cohesion: 0.19
Nodes (13): GoldAssetPage(), BorsaAssetPage(), FxAssetPage(), CryptoAssetPage(), NasdaqAssetPage(), AssetDetailPage(), AssetDetailPageProps, Cell() (+5 more)

### Community 45 - "ThemeToggle.tsx"
Cohesion: 0.33
Nodes (8): getServerSnapshot(), getSnapshot(), subscribe(), Theme, ThemeToggle(), useTheme(), IconButton(), IconButtonProps

### Community 46 - "Quote"
Cohesion: 0.19
Nodes (5): BASE_INTERVAL, BinanceProvider, Kline, Ticker24h, Quote

### Community 47 - "PriceChart.tsx"
Cohesion: 0.31
Nodes (7): lightweight-charts, ChartKind, PERIODS, PriceChart(), PriceChartProps, readThemeColors(), Skeleton()

### Community 48 - "feed.ts"
Cohesion: 0.31
Nodes (8): NewsPage(), NewsList(), TABS, getNewsFeed(), NewsItem, relativeTime(), rtf, TAB_FOR_CATEGORY

### Community 49 - "campaign-actions.ts"
Cohesion: 0.40
Nodes (5): campaignSchema, deleteCampaignAction(), saveCampaignAction(), slugify(), toggleCampaignAction()

### Community 50 - "navigation.ts"
Cohesion: 0.10
Nodes (28): next-intl, @tanstack/react-query, GET(), AdminLayout(), AppLayout(), GoldMarketPage(), BistMarketPage(), FxMarketPage() (+20 more)

### Community 51 - "DataStatusBadge.tsx"
Cohesion: 0.29
Nodes (5): Badge(), BadgeProps, Tone, TONE_STYLES, TONE

### Community 53 - "TradeTerminal.tsx"
Cohesion: 0.05
Nodes (71): decimal.js, motion, TradePage(), sessionBadge(), AssetPicker(), PickerAsset, initialState, TradeSheet() (+63 more)

### Community 54 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 55 - "cn.ts"
Cohesion: 0.26
Nodes (8): computeIsOpen(), getServerSnapshot(), MarketStatusPill(), subscribe(), ITEMS, Sidebar(), TabOption, TabsProps

### Community 56 - "types.d.ts"
Cohesion: 0.29
Nodes (6): next-auth, JWT, next-auth, next-auth/jwt, Session, User

### Community 57 - "MarketsExplorer.tsx"
Cohesion: 0.21
Nodes (15): loadRows(), loadStockRows(), MarketsPage(), POPULAR_ORDER, popularRank(), AssetRowData, AssetClass, currentMinute() (+7 more)

### Community 61 - "deploy.sh"
Cohesion: 0.70
Nodes (4): die(), log(), deploy.sh script, warn()

## Ambiguous Edges - Review These
- `Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js` → `This is NOT the Next.js you know (agent rules block)`  [AMBIGUOUS]
  AGENTS.md · relation: conceptually_related_to

## Knowledge Gaps
- **350 isolated node(s):** `eslintConfig`, `withNextIntl`, `nextConfig`, `name`, `version` (+345 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 387 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js` and `This is NOT the Next.js you know (agent rules block)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `cn()` connect `cn` to `Toaster.tsx`, `IpoList.tsx`, `ContentForms.tsx`, `AssetIcon`, `ayarlar/page.tsx`, `WalletFlow.tsx`, `WalletHistory.tsx`, `manual-simulation.ts`, `FundsList.tsx`, `Link`, `TermDepositView.tsx`, `(app)/page.tsx`, `MarketCards.tsx`, `react`, `AssetDetailPage.tsx`, `ThemeToggle.tsx`, `PriceChart.tsx`, `feed.ts`, `navigation.ts`, `DataStatusBadge.tsx`, `HomeBanners.tsx`, `TradeTerminal.tsx`, `cn.ts`, `MarketsExplorer.tsx`?**
  _High betweenness centrality (0.128) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `withNextIntl`, `nextConfig` to the rest of the system?**
  _350 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Toaster.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10582010582010581 - nodes in this community are weakly interconnected._
- **Why does `prisma` connect `client.ts` to `Toaster.tsx`, `ContentForms.tsx`, `writeAuditLog`, `auth/actions.ts`, `feed-actions.ts`, `account-actions.ts`, `WalletFlow.tsx`, `requireAdmin`, `zod`, `news/sync.ts`, `cn`, `manual-simulation.ts`, `FundsList.tsx`, `Link`, `TermDepositView.tsx`, `(app)/page.tsx`, `user-actions.ts`, `MarketCards.tsx`, `@prisma/client`, `AssetDetailPage.tsx`, `feed.ts`, `campaign-actions.ts`, `navigation.ts`, `HomeBanners.tsx`, `TradeTerminal.tsx`, `MarketsExplorer.tsx`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Should `ContentForms.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06438499868869657 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `Toaster.tsx`, `IpoList.tsx`, `ContentForms.tsx`, `package.json`, `AssetIcon`, `ayarlar/page.tsx`, `WalletFlow.tsx`, `WalletHistory.tsx`, `cn`, `FundsList.tsx`, `Link`, `TermDepositView.tsx`, `(app)/page.tsx`, `MarketCards.tsx`, `AssetDetailPage.tsx`, `ThemeToggle.tsx`, `PriceChart.tsx`, `feed.ts`, `navigation.ts`, `DataStatusBadge.tsx`, `HomeBanners.tsx`, `TradeTerminal.tsx`, `cn.ts`, `MarketsExplorer.tsx`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._