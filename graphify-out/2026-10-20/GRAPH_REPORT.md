# Graph Report - ultima  (2026-10-19)

## Corpus Check
- 258 files · ~238,000 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 5, .ico 2, .toml 1)

## Summary
- 1223 nodes · 3723 edges · 63 communities (58 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2a0e4649`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- (app)/layout.tsx
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
- react
- profil/page.tsx
- devDependencies
- PriceBar
- cached-provider.ts
- WalletTransaction (source of truth rows)
- WalletFlow.tsx
- registry.ts
- This is NOT the Next.js you know (agent rules block)
- ContentForms.tsx
- WalletHistory.tsx
- admin-actions.ts
- feed-actions.ts
- postcss.config.mjs
- DataProvenance (LIVE/DELAYED/MANUAL_OVERRIDE/CACHED/UNAVAILABLE)
- WalletView.tsx
- { GET, POST }
- get-history.ts
- scripts
- FundsList.tsx
- Link
- resolveAssetPrice
- requireUser
- account-actions.ts
- AssetIcon
- @prisma/client
- (app)/page.tsx
- Badge.tsx
- AssetDetailPage.tsx
- news/sync.ts
- Quote
- cn.ts
- seed.ts
- campaign-actions.ts
- navigation.ts
- ThemeToggle.tsx
- types.d.ts
- TradeTerminal.tsx
- engine.ts
- Toaster.tsx
- eslint.config.mjs
- AssetRow.tsx
- cn
- PriceChart.tsx
- HomeBanners.tsx
- deploy.sh
- decimal.ts

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
- `LoginForm()` --indirect_call--> `loginAction()`  [INFERRED]
  src/components/auth/LoginForm.tsx → src/lib/auth/actions.ts
- `RegisterForm()` --indirect_call--> `registerAction()`  [INFERRED]
  src/components/auth/RegisterForm.tsx → src/lib/auth/actions.ts
- `PurchaseForm()` --indirect_call--> `purchaseFundAction()`  [INFERRED]
  src/components/funds/FundsList.tsx → src/lib/funds/actions.ts
- `RedeemForm()` --indirect_call--> `redeemFundAction()`  [INFERRED]
  src/components/funds/FundsList.tsx → src/lib/funds/actions.ts
- `UsdTransferForm()` --indirect_call--> `convertCurrencyAction()`  [INFERRED]
  src/components/wallet/UsdTransferForm.tsx → src/lib/wallet/fx-actions.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Agent governance documentation chain (CLAUDE.md/.claude/CLAUDE.md/AGENTS.md)** — claude_claude_graphify, claude_graphify_rules, agents_nextjs_agent_rules [EXTRACTED 0.90]
- **Market data provenance and caching flow** — readme_no_fabricated_market_data, readme_data_provenance, readme_market_data_in_redis, src_lib_market_data_marketdataprovider, src_lib_market_data_cached_provider_cachedprovider, docker_compose_redis [INFERRED 0.80]
- **Wallet ledger integrity and trading settlement** — readme_trading_internal, src_lib_trading_engine_tradingengine, readme_wallet_ledger, readme_wallettransaction, readme_wallet_cashbalance [INFERRED 0.85]

## Communities (63 total, 5 thin omitted)

### Community 0 - "(app)/layout.tsx"
Cohesion: 0.13
Nodes (21): @tanstack/react-query, AppLayout(), AuthLayout(), AppHeader(), CUSTOM_HEADER_PATHS, AutoRefresh(), BottomNav(), Header() (+13 more)

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
Cohesion: 0.13
Nodes (33): createBannerAction(), createInvestmentFundAction(), toggleAssetActiveAction(), toggleBannerAction(), toggleNewsArticleAction(), assetSchema, bankSchema, CATEGORIES (+25 more)

### Community 5 - "MarketSummary"
Cohesion: 0.12
Nodes (7): CachedSnapshot, SYMBOL_MAP, TruncgilProvider, TruncgilProviderConfig, TruncgilResponse, TruncgilRow, MarketSummary

### Community 6 - "types/index.ts"
Cohesion: 0.12
Nodes (13): CachedRates, Rate, TCMBCurrencyRow, TCMBProviderConfig, AssetMeta, AssetRef, AssetType, CorporateActionEvent (+5 more)

### Community 7 - "auth/actions.ts"
Cohesion: 0.19
Nodes (16): bcryptjs, next-auth, loginAction(), logoutAction(), registerAction(), handlers, signIn, signOut (+8 more)

### Community 8 - "UnimplementedProviderBase"
Cohesion: 0.10
Nodes (10): ProviderNotConfiguredError, BorsaIstanbulProvider, BorsaIstanbulProviderConfig, CryptoProvider, CryptoProviderConfig, ForeksProvider, ForeksProviderConfig, KAPProvider (+2 more)

### Community 9 - "dependencies"
Cohesion: 0.09
Nodes (23): dependencies, @auth/prisma-adapter, bcryptjs, bullmq, clsx, date-fns, decimal.js, fast-xml-parser (+15 more)

### Community 10 - "client.ts"
Cohesion: 0.13
Nodes (17): bannerSchema, deleteBannerAction(), optionalUrl, saveBannerAction(), toggleInvestmentFundAction(), deleteFundAction(), fundSchema, optionalNumber (+9 more)

### Community 11 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 12 - "package.json"
Cohesion: 0.11
Nodes (18): name, private, version, @auth/prisma-adapter, clsx, date-fns, dotenv, flag-icons (+10 more)

### Community 13 - "MarketsExplorer.tsx"
Cohesion: 0.14
Nodes (25): loadRows(), loadStockRows(), MarketsPage(), POPULAR_ORDER, popularRank(), AssetRowData, AssetClass, currentMinute() (+17 more)

### Community 14 - "ayarlar/page.tsx"
Cohesion: 0.23
Nodes (14): SettingsPage(), setTheme(), AccountChangeRows(), AccountForm(), FieldDef, getSnapshot(), NotificationSwitchRow(), subscribe() (+6 more)

### Community 15 - "react"
Cohesion: 0.19
Nodes (14): react, LoginPage(), RegisterPage(), LegalModal(), LegalModalProps, initialState, LoginForm(), Mode (+6 more)

### Community 16 - "profil/page.tsx"
Cohesion: 0.16
Nodes (18): Panel(), ProfilePage(), Stat(), KycDocMeta, KycSlot(), KycUploader(), SIDES, Field() (+10 more)

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
Nodes (41): WithdrawPage(), DepositPage(), initialState, ReviewRequestFormProps, ShareInvite(), share(), BackButton(), BackButtonProps (+33 more)

### Community 22 - "registry.ts"
Cohesion: 0.18
Nodes (6): CommodityProvider, YAHOO_COMMODITY, YahooFinanceBistProvider, YahooFinanceProvider, YahooFinanceUsProvider, yahooBist

### Community 23 - "This is NOT the Next.js you know (agent rules block)"
Cohesion: 0.40
Nodes (3): graphify skill reference (.claude/CLAUDE.md), Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js, Ultima platform overview

### Community 24 - "ContentForms.tsx"
Cohesion: 0.10
Nodes (27): nextConfig, withNextIntl, next, zod, ASSET_TYPES, CRYPTO_NETWORKS, IPO_STATUSES, NEWS_CATEGORIES (+19 more)

### Community 25 - "WalletHistory.tsx"
Cohesion: 0.19
Nodes (19): Bubble(), Card(), CardHeader(), CASH_TITLES, CashRow(), Cell(), dayFmt, dayKey() (+11 more)

### Community 26 - "admin-actions.ts"
Cohesion: 0.36
Nodes (6): approveDepositAction(), approveWithdrawalAction(), lockWalletByUserId(), rejectDepositAction(), rejectWithdrawalAction(), reviewRequestSchema

### Community 27 - "feed-actions.ts"
Cohesion: 0.25
Nodes (9): createIpoAction(), ipoSchema, refreshIposAction(), toggleIpoPublishedAction(), ipoListSchema, IpoSyncResult, mapStatus(), syncIposFromFeed() (+1 more)

### Community 30 - "WalletView.tsx"
Cohesion: 0.12
Nodes (25): BalanceCard(), tryFmt, usdtFmt, CurrencyFlag(), Direction, initial, money, UsdTransferForm() (+17 more)

### Community 32 - "get-history.ts"
Cohesion: 0.08
Nodes (33): bullmq, server-only, GET(), NewsPage(), NewsList(), TABS, FundPurchaseState, purchaseFundAction() (+25 more)

### Community 33 - "scripts"
Cohesion: 0.15
Nodes (13): scripts, build, db:deploy, db:generate, db:migrate, db:seed, db:studio, dev (+5 more)

### Community 34 - "FundsList.tsx"
Cohesion: 0.24
Nodes (15): aumText(), count, FundDetail(), FundHoldingRow, FundRow, FundsList(), HoldingsSummary(), PurchaseForm() (+7 more)

### Community 35 - "Link"
Cohesion: 0.14
Nodes (17): lucide-react, motion, react-dom, AdminDashboardPage(), FundsPage(), RewardsPage(), IOS_STEPS, MobileInstallAction() (+9 more)

### Community 36 - "resolveAssetPrice"
Cohesion: 0.09
Nodes (44): GET(), maskTail(), parseFxMetadata(), WalletPage(), TermDepositPage(), COPY, CurrencyConvertCard(), Direction (+36 more)

### Community 37 - "requireUser"
Cohesion: 0.14
Nodes (17): initialState, TradeSheet(), TradeSheetProps, cancel(), closePosition(), submit(), useToast(), requireUser() (+9 more)

### Community 38 - "account-actions.ts"
Cohesion: 0.32
Nodes (7): AccountActionState, changeEmailAction(), changeEmailSchema, changePasswordAction(), changePasswordSchema, passwordSchema, verifyCurrentPassword()

### Community 39 - "AssetIcon"
Cohesion: 0.14
Nodes (19): CARD_SYMBOLS, formatCardPrice(), MarketCards(), AssetIcon(), AssetIconProps, FLAG_CODES, hashColor(), MONOGRAM_PALETTE (+11 more)

### Community 40 - "@prisma/client"
Cohesion: 0.38
Nodes (6): @prisma/client, ResolvedPrice, DataProvenance, HoldingViewModel, HoldingRow, PortfolioSummary

### Community 41 - "(app)/page.tsx"
Cohesion: 0.18
Nodes (21): recharts, HomePage(), PortfolioPage(), HomeIpoBanner(), PortfolioHero(), ICONS, RecentActivity(), WatchlistCard() (+13 more)

### Community 42 - "Badge.tsx"
Cohesion: 0.33
Nodes (4): Badge(), BadgeProps, Tone, TONE_STYLES

### Community 43 - "AssetDetailPage.tsx"
Cohesion: 0.19
Nodes (13): GoldAssetPage(), BorsaAssetPage(), FxAssetPage(), CryptoAssetPage(), NasdaqAssetPage(), AssetDetailPage(), AssetDetailPageProps, Cell() (+5 more)

### Community 45 - "news/sync.ts"
Cohesion: 0.17
Nodes (12): fast-xml-parser, refreshNewsAction(), categorize(), IncomingArticle, JSON_CATEGORY, jsonSchema, NewsSyncResult, readJsonNews() (+4 more)

### Community 47 - "cn.ts"
Cohesion: 0.16
Nodes (11): InvitePage(), Stat(), STEPS, TIERS, InviteProgram(), copy(), share(), TabOption (+3 more)

### Community 48 - "seed.ts"
Cohesion: 0.28
Nodes (8): CAMPAIGNS, INVESTMENT_FUNDS, main(), PERMISSIONS, prisma, ROLES, seedCampaigns(), seedInvestmentFunds()

### Community 49 - "campaign-actions.ts"
Cohesion: 0.36
Nodes (6): STATUS_LABEL, campaignSchema, deleteCampaignAction(), saveCampaignAction(), slugify(), toggleCampaignAction()

### Community 50 - "navigation.ts"
Cohesion: 0.18
Nodes (14): next-intl, AdminLayout(), GoldMarketPage(), BistMarketPage(), FxMarketPage(), AdminShell(), ALL_ITEMS, isActive() (+6 more)

### Community 51 - "ThemeToggle.tsx"
Cohesion: 0.33
Nodes (8): getServerSnapshot(), getSnapshot(), subscribe(), Theme, ThemeToggle(), useTheme(), IconButton(), IconButtonProps

### Community 52 - "types.d.ts"
Cohesion: 0.33
Nodes (5): JWT, next-auth, next-auth/jwt, Session, User

### Community 53 - "TradeTerminal.tsx"
Cohesion: 0.16
Nodes (17): TradePage(), AssetPicker(), PickerAsset, Empty(), fmtMoney(), money, pfmt(), PositionCard() (+9 more)

### Community 54 - "engine.ts"
Cohesion: 0.27
Nodes (18): marketValue(), ensureWalletAndPortfolio(), evaluateLimitOrders(), executeMarketOrder(), fillLimitOrder(), LimitOrderInput, lockWallet(), MarketOrderInput (+10 more)

### Community 55 - "Toaster.tsx"
Cohesion: 0.13
Nodes (14): FONT_VARS, LocaleLayout(), metadata, ToastApi, ToastCard(), ToastContext, ToastItem, ToastKind (+6 more)

### Community 56 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 57 - "AssetRow.tsx"
Cohesion: 0.26
Nodes (10): CATEGORY_TYPES, HomeCategoryList(), CATEGORY_TABS, CategoryKey, HomeCategoryPanel(), HomeRow, AssetRow(), formatRowPrice() (+2 more)

### Community 58 - "cn"
Cohesion: 0.56
Nodes (8): money, money2(), PnlOverview(), PositionDetail(), PriceScale(), Stat(), toTry(), cn()

### Community 59 - "PriceChart.tsx"
Cohesion: 0.36
Nodes (6): ChartKind, PERIODS, PriceChart(), PriceChartProps, readThemeColors(), Skeleton()

### Community 60 - "HomeBanners.tsx"
Cohesion: 0.43
Nodes (3): HomeBanners(), PromoCarousel(), PromoSlide

### Community 61 - "deploy.sh"
Cohesion: 0.70
Nodes (4): die(), log(), deploy.sh script, warn()

### Community 62 - "decimal.ts"
Cohesion: 0.50
Nodes (3): decimal.js, profitLoss(), toDecimal()

## Ambiguous Edges - Review These
- `Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js` → `This is NOT the Next.js you know (agent rules block)`  [AMBIGUOUS]
  AGENTS.md · relation: conceptually_related_to

## Knowledge Gaps
- **339 isolated node(s):** `eslintConfig`, `withNextIntl`, `nextConfig`, `name`, `version` (+334 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 375 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js` and `This is NOT the Next.js you know (agent rules block)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `react` connect `react` to `(app)/layout.tsx`, `IpoList.tsx`, `EntityEditors.tsx`, `package.json`, `MarketsExplorer.tsx`, `ayarlar/page.tsx`, `profil/page.tsx`, `WalletFlow.tsx`, `ContentForms.tsx`, `WalletHistory.tsx`, `WalletView.tsx`, `get-history.ts`, `FundsList.tsx`, `Link`, `resolveAssetPrice`, `requireUser`, `AssetIcon`, `(app)/page.tsx`, `Badge.tsx`, `AssetDetailPage.tsx`, `cn.ts`, `navigation.ts`, `ThemeToggle.tsx`, `TradeTerminal.tsx`, `Toaster.tsx`, `AssetRow.tsx`, `PriceChart.tsx`, `HomeBanners.tsx`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `withNextIntl`, `nextConfig` to the rest of the system?**
  _339 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `(app)/layout.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12643678160919541 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `(app)/layout.tsx`, `IpoList.tsx`, `EntityEditors.tsx`, `MarketsExplorer.tsx`, `ayarlar/page.tsx`, `react`, `profil/page.tsx`, `WalletFlow.tsx`, `WalletHistory.tsx`, `WalletView.tsx`, `get-history.ts`, `FundsList.tsx`, `Link`, `resolveAssetPrice`, `requireUser`, `AssetIcon`, `(app)/page.tsx`, `Badge.tsx`, `AssetDetailPage.tsx`, `cn.ts`, `navigation.ts`, `ThemeToggle.tsx`, `TradeTerminal.tsx`, `Toaster.tsx`, `AssetRow.tsx`, `PriceChart.tsx`, `HomeBanners.tsx`?**
  _High betweenness centrality (0.120) - this node is a cross-community bridge._
- **Should `EntityEditors.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07175032175032175 - nodes in this community are weakly interconnected._
- **Why does `prisma` connect `client.ts` to `(app)/layout.tsx`, `IpoList.tsx`, `EntityEditors.tsx`, `requireAdmin`, `auth/actions.ts`, `MarketsExplorer.tsx`, `profil/page.tsx`, `WalletFlow.tsx`, `ContentForms.tsx`, `admin-actions.ts`, `feed-actions.ts`, `get-history.ts`, `FundsList.tsx`, `Link`, `resolveAssetPrice`, `requireUser`, `account-actions.ts`, `AssetIcon`, `@prisma/client`, `(app)/page.tsx`, `AssetDetailPage.tsx`, `news/sync.ts`, `cn.ts`, `campaign-actions.ts`, `TradeTerminal.tsx`, `engine.ts`, `AssetRow.tsx`, `HomeBanners.tsx`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._