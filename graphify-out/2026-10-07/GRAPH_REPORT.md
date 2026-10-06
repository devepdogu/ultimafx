# Graph Report - ultima  (2026-10-06)

## Corpus Check
- 252 files · ~358,895 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 2, .ico 2, .toml 1)

## Summary
- 1194 nodes · 3639 edges · 57 communities (52 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bef97cee`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- (app)/layout.tsx
- IpoList.tsx
- MarketSummary
- ContentForms.tsx
- client.ts
- truncgil-provider.ts
- types/index.ts
- auth/actions.ts
- UnimplementedProviderBase
- dependencies
- writeAuditLog
- compilerOptions
- package.json
- MarketsExplorer.tsx
- ayarlar/page.tsx
- MarketDataProvider
- engine.ts
- devDependencies
- tcmb-provider.ts
- cached-provider.ts
- WalletTransaction (source of truth rows)
- WalletFlow.tsx
- Quote
- This is NOT the Next.js you know (agent rules block)
- @prisma/client
- cn
- AdminShell.tsx
- Toaster.tsx
- postcss.config.mjs
- DataProvenance (LIVE/DELAYED/MANUAL_OVERRIDE/CACHED/UNAVAILABLE)
- WalletView.tsx
- { GET, POST }
- market-data-refresh.worker.ts
- scripts
- FundsList.tsx
- requireAdmin
- getCurrentUser
- TradeTerminal.tsx
- next-intl
- AssetIcon
- profil/page.tsx
- (app)/page.tsx
- HoldingsList.tsx
- AssetDetailPage.tsx
- news/sync.ts
- davet/page.tsx
- react
- Link
- feed-actions.ts
- requireUser
- session.ts
- decimal.ts
- zod
- get-history.ts
- campaign-actions.ts
- banner-actions.ts
- eslint.config.mjs

## God Nodes (most connected - your core abstractions)
1. `cn()` - 117 edges
2. `prisma` - 67 edges
3. `Link` - 65 edges
4. `requireAdmin()` - 60 edges
5. `writeAuditLog()` - 57 edges
6. `react` - 54 edges
7. `lucide-react` - 53 edges
8. `formatPrice()` - 31 edges
9. `@prisma/client` - 28 edges
10. `AssetIcon()` - 27 edges

## Surprising Connections (you probably didn't know these)
- `UsdTransferForm()` --indirect_call--> `convertCurrencyAction()`  [INFERRED]
  src/components/wallet/UsdTransferForm.tsx → src/lib/wallet/fx-actions.ts
- `This is NOT the Next.js you know (agent rules block)` --conceptually_related_to--> `Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js`  [AMBIGUOUS]
  AGENTS.md → README.md
- `graphify skill reference (.claude/CLAUDE.md)` --references--> `graphify usage rules (root CLAUDE.md)`  [EXTRACTED]
  .claude/CLAUDE.md → CLAUDE.md
- `SettingsPage()` --calls--> `PageTopBar()`  [EXTRACTED]
  src/app/[locale]/(app)/ayarlar/page.tsx → src/components/ui/PageTopBar.tsx
- `SettingsPage()` --calls--> `requireUserForPage()`  [EXTRACTED]
  src/app/[locale]/(app)/ayarlar/page.tsx → src/lib/auth/rbac.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Agent governance documentation chain (CLAUDE.md/.claude/CLAUDE.md/AGENTS.md)** — claude_claude_graphify, claude_graphify_rules, agents_nextjs_agent_rules [EXTRACTED 0.90]
- **Market data provenance and caching flow** — readme_no_fabricated_market_data, readme_data_provenance, readme_market_data_in_redis, src_lib_market_data_marketdataprovider, src_lib_market_data_cached_provider_cachedprovider, docker_compose_redis [INFERRED 0.80]
- **Wallet ledger integrity and trading settlement** — readme_trading_internal, src_lib_trading_engine_tradingengine, readme_wallet_ledger, readme_wallettransaction, readme_wallet_cashbalance [INFERRED 0.85]

## Communities (57 total, 5 thin omitted)

### Community 0 - "(app)/layout.tsx"
Cohesion: 0.17
Nodes (15): AppLayout(), AuthLayout(), AppHeader(), CUSTOM_HEADER_PATHS, AutoRefresh(), BottomNav(), Header(), HeaderNotification (+7 more)

### Community 1 - "IpoList.tsx"
Cohesion: 0.16
Nodes (19): Card(), compactTry(), dateText(), FOOTER, IpoDrawer(), IpoList(), IpoRow, IpoStatus (+11 more)

### Community 3 - "ContentForms.tsx"
Cohesion: 0.07
Nodes (86): AdminBankAccountsPage(), AdminBannersPage(), AdminFundsPage(), AdminNewsPage(), AdminIposPage(), STATUS, AdminCampaignsPage(), STATUS_LABEL (+78 more)

### Community 4 - "client.ts"
Cohesion: 0.12
Nodes (23): next, createBankAccountAction(), schema, toggleBankAccountAction(), AdminActionResult, createCryptoAddressAction(), schema, toggleCryptoAddressAction() (+15 more)

### Community 5 - "truncgil-provider.ts"
Cohesion: 0.13
Nodes (7): CachedSnapshot, SYMBOL_MAP, TruncgilProvider, TruncgilProviderConfig, TruncgilResponse, TruncgilRow, AssetMeta

### Community 6 - "types/index.ts"
Cohesion: 0.14
Nodes (9): UnconfiguredProvider, AssetRef, AssetType, CorporateActionEvent, IndexValue, MarketStatus, NewsItem, OrderBook (+1 more)

### Community 7 - "auth/actions.ts"
Cohesion: 0.06
Nodes (44): CAMPAIGNS, INVESTMENT_FUNDS, main(), PERMISSIONS, prisma, ROLES, seedCampaigns(), seedInvestmentFunds() (+36 more)

### Community 8 - "UnimplementedProviderBase"
Cohesion: 0.11
Nodes (10): ProviderNotConfiguredError, BorsaIstanbulProvider, BorsaIstanbulProviderConfig, CryptoProvider, CryptoProviderConfig, ForeksProvider, ForeksProviderConfig, KAPProvider (+2 more)

### Community 9 - "dependencies"
Cohesion: 0.09
Nodes (23): dependencies, @auth/prisma-adapter, bcryptjs, bullmq, clsx, date-fns, decimal.js, fast-xml-parser (+15 more)

### Community 10 - "writeAuditLog"
Cohesion: 0.14
Nodes (25): assetSchema, bankSchema, CATEGORIES, cryptoSchema, deleteAssetAction(), deleteBankAction(), deleteCryptoAction(), deleteIpoAction() (+17 more)

### Community 11 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 12 - "package.json"
Cohesion: 0.10
Nodes (19): name, private, version, clsx, date-fns, dotenv, flag-icons, motion (+11 more)

### Community 13 - "MarketsExplorer.tsx"
Cohesion: 0.18
Nodes (18): TradePage(), loadRows(), loadStockRows(), MarketsPage(), POPULAR_ORDER, popularRank(), AssetRowData, AssetClass (+10 more)

### Community 14 - "ayarlar/page.tsx"
Cohesion: 0.11
Nodes (29): SettingsPage(), getServerSnapshot(), getSnapshot(), setTheme(), subscribe(), Theme, ThemeToggle(), useTheme() (+21 more)

### Community 16 - "engine.ts"
Cohesion: 0.27
Nodes (18): marketValue(), ensureWalletAndPortfolio(), evaluateLimitOrders(), executeMarketOrder(), fillLimitOrder(), LimitOrderInput, lockWallet(), MarketOrderInput (+10 more)

### Community 17 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, dotenv, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/postcss, tsx (+5 more)

### Community 18 - "tcmb-provider.ts"
Cohesion: 0.16
Nodes (7): CachedRates, Rate, TCMBCurrencyRow, TCMBProvider, TCMBProviderConfig, PriceBar, PriceInterval

### Community 19 - "cached-provider.ts"
Cohesion: 0.23
Nodes (12): ioredis, cacheAside(), readCache(), writeCacheForever(), globalForRedis, redis, CacheOptions, providerQueue (+4 more)

### Community 20 - "WalletTransaction (source of truth rows)"
Cohesion: 0.20
Nodes (7): postgres service (postgres:17-alpine, port 5434), redis service (redis:7-alpine, port 6380), Wallet.cashBalance (projection field), WalletTransaction (source of truth rows), cached-provider.ts (cache-aside wrapper), MarketDataProvider, trading/engine.ts (order settlement engine)

### Community 21 - "WalletFlow.tsx"
Cohesion: 0.08
Nodes (35): WithdrawPage(), DepositPage(), initialState, ReviewRequestFormProps, ShareInvite(), share(), Button(), ButtonProps (+27 more)

### Community 22 - "Quote"
Cohesion: 0.17
Nodes (7): CommodityProvider, YAHOO_COMMODITY, YahooFinanceBistProvider, YahooFinanceProvider, YahooFinanceUsProvider, yahooBist, Quote

### Community 23 - "This is NOT the Next.js you know (agent rules block)"
Cohesion: 0.40
Nodes (3): graphify skill reference (.claude/CLAUDE.md), Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js, Ultima platform overview

### Community 24 - "@prisma/client"
Cohesion: 0.14
Nodes (16): @prisma/client, recharts, CATEGORY_TYPES, CategoryKey, HomeRow, CARD_SYMBOLS, formatCardPrice(), MarketCards() (+8 more)

### Community 25 - "cn"
Cohesion: 0.19
Nodes (21): Bubble(), Card(), CardHeader(), CASH_TITLES, CashRow(), Cell(), dayFmt, dayKey() (+13 more)

### Community 26 - "AdminShell.tsx"
Cohesion: 0.33
Nodes (7): AdminLayout(), AdminShell(), ALL_ITEMS, isActive(), NAV, NavGroup, NavItem

### Community 27 - "Toaster.tsx"
Cohesion: 0.12
Nodes (15): geistMono, LocaleLayout(), metadata, plexSans, ToastApi, ToastCard(), ToastContext, ToastItem (+7 more)

### Community 30 - "WalletView.tsx"
Cohesion: 0.12
Nodes (27): ICONS, RecentActivity(), BalanceCard(), tryFmt, usdtFmt, CurrencyFlag(), Direction, initial (+19 more)

### Community 32 - "market-data-refresh.worker.ts"
Cohesion: 0.36
Nodes (7): bullmq, queueConnection, MARKET_DATA_REFRESH_QUEUE, marketDataQueue, scheduleMarketDataRefresh(), refreshFxQuotes(), worker

### Community 33 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, db:generate, db:migrate, db:seed, db:studio, dev, lint (+3 more)

### Community 34 - "FundsList.tsx"
Cohesion: 0.14
Nodes (26): FundsPage(), aumText(), count, FundDetail(), FundHoldingRow, FundRow, FundsList(), HoldingsSummary() (+18 more)

### Community 35 - "requireAdmin"
Cohesion: 0.16
Nodes (17): assetSchema, bannerSchema, createAssetAction(), createBannerAction(), createInvestmentFundAction(), createNewsArticleAction(), fundSchema, newsSchema (+9 more)

### Community 36 - "getCurrentUser"
Cohesion: 0.09
Nodes (42): GET(), maskTail(), parseFxMetadata(), WalletPage(), TermDepositPage(), PageTopBar(), COPY, CurrencyConvertCard() (+34 more)

### Community 37 - "TradeTerminal.tsx"
Cohesion: 0.12
Nodes (23): AssetPicker(), AssetPickerProps, FILTERS, PickerAsset, Empty(), fmtMoney(), money, pfmt() (+15 more)

### Community 38 - "next-intl"
Cohesion: 0.18
Nodes (12): nextConfig, withNextIntl, next-intl, GoldMarketPage(), BistMarketPage(), FxMarketPage(), computeIsOpen(), getServerSnapshot() (+4 more)

### Community 39 - "AssetIcon"
Cohesion: 0.17
Nodes (20): AssetIcon(), AssetIconProps, FLAG_CODES, hashColor(), MONOGRAM_PALETTE, tradingViewLogo(), TV_COUNTRY, AssetRow() (+12 more)

### Community 40 - "profil/page.tsx"
Cohesion: 0.17
Nodes (17): Panel(), ProfilePage(), Stat(), KycDocMeta, KycSlot(), KycUploader(), SIDES, Field() (+9 more)

### Community 41 - "(app)/page.tsx"
Cohesion: 0.24
Nodes (16): HomePage(), PortfolioPage(), HomeCategoryList(), CATEGORY_TABS, HomeCategoryPanel(), HomeIpoBanner(), PortfolioHero(), WatchlistCard() (+8 more)

### Community 42 - "HoldingsList.tsx"
Cohesion: 0.18
Nodes (12): HoldingLink(), HoldingsList(), DataStatusBadge(), TONE, TabOption, Tabs(), TabsProps, ResolvedPrice (+4 more)

### Community 43 - "AssetDetailPage.tsx"
Cohesion: 0.20
Nodes (12): GoldAssetPage(), BorsaAssetPage(), FxAssetPage(), NasdaqAssetPage(), AssetDetailPage(), AssetDetailPageProps, Cell(), compact (+4 more)

### Community 44 - "news/sync.ts"
Cohesion: 0.17
Nodes (11): fast-xml-parser, categorize(), IncomingArticle, JSON_CATEGORY, jsonSchema, NewsSyncResult, readJsonNews(), readRssNews() (+3 more)

### Community 45 - "davet/page.tsx"
Cohesion: 0.13
Nodes (18): server-only, InvitePage(), Stat(), STEPS, TIERS, NewsPage(), NewsList(), TABS (+10 more)

### Community 46 - "react"
Cohesion: 0.13
Nodes (14): lightweight-charts, react, @tanstack/react-query, ChartKind, PERIODS, PriceChart(), PriceChartProps, readThemeColors() (+6 more)

### Community 47 - "Link"
Cohesion: 0.13
Nodes (16): lucide-react, AdminDashboardPage(), IpoListPage(), RewardsPage(), HomeBanners(), IOS_STEPS, MobileInstallAction(), PromoCarousel() (+8 more)

### Community 48 - "feed-actions.ts"
Cohesion: 0.23
Nodes (10): createIpoAction(), ipoSchema, refreshIposAction(), refreshNewsAction(), toggleIpoPublishedAction(), ipoListSchema, IpoSyncResult, mapStatus() (+2 more)

### Community 49 - "requireUser"
Cohesion: 0.15
Nodes (15): initialState, TradeSheet(), TradeSheetProps, cancel(), submit(), useToast(), requireUser(), cancelOrderAction() (+7 more)

### Community 50 - "session.ts"
Cohesion: 0.27
Nodes (10): sessionBadge(), BIST_SESSION, hasSession(), hhmm(), isAssetSessionOpen(), NYSE_SESSION, offsetMinutes(), Session (+2 more)

### Community 51 - "decimal.ts"
Cohesion: 0.50
Nodes (3): decimal.js, profitLoss(), toDecimal()

### Community 52 - "zod"
Cohesion: 0.31
Nodes (7): zod, approveDepositAction(), approveWithdrawalAction(), lockWalletByUserId(), rejectDepositAction(), rejectWithdrawalAction(), reviewRequestSchema

### Community 53 - "get-history.ts"
Cohesion: 0.39
Nodes (6): GET(), CHART_PERIODS, getAssetHistory(), isChartPeriod(), PERIOD_DAYS, marketDataRegistry

### Community 54 - "campaign-actions.ts"
Cohesion: 0.40
Nodes (5): campaignSchema, deleteCampaignAction(), saveCampaignAction(), slugify(), toggleCampaignAction()

### Community 55 - "banner-actions.ts"
Cohesion: 0.40
Nodes (4): bannerSchema, deleteBannerAction(), optionalUrl, saveBannerAction()

### Community 56 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

## Ambiguous Edges - Review These
- `Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js` → `This is NOT the Next.js you know (agent rules block)`  [AMBIGUOUS]
  AGENTS.md · relation: conceptually_related_to

## Knowledge Gaps
- **333 isolated node(s):** `eslintConfig`, `withNextIntl`, `nextConfig`, `name`, `version` (+328 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 367 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js` and `This is NOT the Next.js you know (agent rules block)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `cn()` connect `cn` to `(app)/layout.tsx`, `IpoList.tsx`, `ContentForms.tsx`, `auth/actions.ts`, `MarketsExplorer.tsx`, `ayarlar/page.tsx`, `WalletFlow.tsx`, `@prisma/client`, `AdminShell.tsx`, `Toaster.tsx`, `WalletView.tsx`, `FundsList.tsx`, `getCurrentUser`, `TradeTerminal.tsx`, `next-intl`, `AssetIcon`, `profil/page.tsx`, `(app)/page.tsx`, `HoldingsList.tsx`, `AssetDetailPage.tsx`, `davet/page.tsx`, `react`, `Link`, `requireUser`?**
  _High betweenness centrality (0.151) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `withNextIntl`, `nextConfig` to the rest of the system?**
  _333 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ContentForms.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07032799389778795 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `(app)/layout.tsx`, `IpoList.tsx`, `ContentForms.tsx`, `auth/actions.ts`, `package.json`, `MarketsExplorer.tsx`, `ayarlar/page.tsx`, `WalletFlow.tsx`, `@prisma/client`, `cn`, `AdminShell.tsx`, `Toaster.tsx`, `WalletView.tsx`, `FundsList.tsx`, `getCurrentUser`, `TradeTerminal.tsx`, `next-intl`, `AssetIcon`, `profil/page.tsx`, `(app)/page.tsx`, `HoldingsList.tsx`, `AssetDetailPage.tsx`, `davet/page.tsx`, `Link`, `requireUser`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Should `client.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11553030303030302 - nodes in this community are weakly interconnected._
- **Why does `prisma` connect `client.ts` to `(app)/layout.tsx`, `ContentForms.tsx`, `auth/actions.ts`, `writeAuditLog`, `MarketsExplorer.tsx`, `ayarlar/page.tsx`, `engine.ts`, `WalletFlow.tsx`, `@prisma/client`, `market-data-refresh.worker.ts`, `FundsList.tsx`, `requireAdmin`, `getCurrentUser`, `TradeTerminal.tsx`, `profil/page.tsx`, `(app)/page.tsx`, `HoldingsList.tsx`, `AssetDetailPage.tsx`, `news/sync.ts`, `davet/page.tsx`, `Link`, `feed-actions.ts`, `requireUser`, `zod`, `get-history.ts`, `campaign-actions.ts`, `banner-actions.ts`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._