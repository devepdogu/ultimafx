# Graph Report - ultima  (2026-10-21)

## Corpus Check
- 267 files · ~245,269 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 5, .ico 2, .toml 1)

## Summary
- 1278 nodes · 3884 edges · 62 communities (55 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2ce7d98d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Toaster.tsx
- IpoList.tsx
- MarketDataProvider
- EntityEditors.tsx
- writeAuditLog
- MarketSummary
- types/index.ts
- auth/actions.ts
- UnimplementedProviderBase
- dependencies
- ContentForms.tsx
- compilerOptions
- package.json
- AssetIcon
- ayarlar/page.tsx
- feed-actions.ts
- profil/page.tsx
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
- engine.ts
- postcss.config.mjs
- DataProvenance (LIVE/DELAYED/MANUAL_OVERRIDE/CACHED/UNAVAILABLE)
- WalletView.tsx
- { GET, POST }
- manual-simulation.ts
- scripts
- FundsList.tsx
- Link
- TermDepositView.tsx
- (app)/page.tsx
- [id]/page.tsx
- MarketCards.tsx
- lucide-react
- TradeSheet.tsx
- @prisma/client
- AssetDetailPage.tsx
- funds/service.ts
- Quote
- cn
- NewsList.tsx
- client.ts
- navigation.ts
- requireUser
- fund-actions.ts
- TradeTerminal.tsx
- eslint.config.mjs
- Sidebar.tsx
- AssetPicker.tsx
- MarketsExplorer.tsx
- UnconfiguredProvider
- decimal.ts
- update.sh
- deploy.sh

## God Nodes (most connected - your core abstractions)
1. `cn()` - 119 edges
2. `prisma` - 67 edges
3. `Link` - 66 edges
4. `requireAdmin()` - 66 edges
5. `writeAuditLog()` - 63 edges
6. `lucide-react` - 57 edges
7. `react` - 55 edges
8. `formatPrice()` - 31 edges
9. `@prisma/client` - 30 edges
10. `UnimplementedProviderBase` - 28 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `encryptSecret()`  [EXTRACTED]
  prisma/seed.ts → src/lib/crypto/secret-box.ts
- `PurchaseForm()` --indirect_call--> `purchaseFundAction()`  [INFERRED]
  src/components/funds/FundsList.tsx → src/lib/funds/actions.ts
- `RedeemForm()` --indirect_call--> `redeemFundAction()`  [INFERRED]
  src/components/funds/FundsList.tsx → src/lib/funds/actions.ts
- `TradeSheet()` --indirect_call--> `placeMarketOrderAction()`  [INFERRED]
  src/components/trading/TradeSheet.tsx → src/lib/trading/actions.ts
- `cancel()` --calls--> `cancelOrderAction()`  [EXTRACTED]
  src/components/trading/TradeTerminal.tsx → src/lib/trading/actions.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Agent governance documentation chain (CLAUDE.md/.claude/CLAUDE.md/AGENTS.md)** — claude_claude_graphify, claude_graphify_rules, agents_nextjs_agent_rules [EXTRACTED 0.90]
- **Market data provenance and caching flow** — readme_no_fabricated_market_data, readme_data_provenance, readme_market_data_in_redis, src_lib_market_data_marketdataprovider, src_lib_market_data_cached_provider_cachedprovider, docker_compose_redis [INFERRED 0.80]
- **Wallet ledger integrity and trading settlement** — readme_trading_internal, src_lib_trading_engine_tradingengine, readme_wallet_ledger, readme_wallettransaction, readme_wallet_cashbalance [INFERRED 0.85]

## Communities (62 total, 7 thin omitted)

### Community 0 - "Toaster.tsx"
Cohesion: 0.33
Nodes (5): ToastApi, ToastCard(), ToastContext, ToastItem, ToastKind

### Community 1 - "IpoList.tsx"
Cohesion: 0.15
Nodes (21): IpoHeader(), IpoListPage(), Card(), compactTry(), dateText(), FOOTER, IpoDrawer(), IpoList() (+13 more)

### Community 3 - "EntityEditors.tsx"
Cohesion: 0.08
Nodes (77): AdminBankAccountsPage(), AdminBannersPage(), AdminFundsPage(), AdminNewsPage(), AdminIposPage(), STATUS, AdminCampaignsPage(), AdminCryptoAddressesPage() (+69 more)

### Community 4 - "writeAuditLog"
Cohesion: 0.12
Nodes (29): assetSchema, bankSchema, BIST_TYPES, CATEGORIES, cryptoSchema, deleteAssetAction(), deleteBankAction(), deleteCryptoAction() (+21 more)

### Community 5 - "MarketSummary"
Cohesion: 0.12
Nodes (7): CachedSnapshot, SYMBOL_MAP, TruncgilProvider, TruncgilProviderConfig, TruncgilResponse, TruncgilRow, MarketSummary

### Community 6 - "types/index.ts"
Cohesion: 0.12
Nodes (14): CachedRates, Rate, TCMBCurrencyRow, TCMBProviderConfig, AssetMeta, AssetRef, AssetType, CorporateActionEvent (+6 more)

### Community 7 - "auth/actions.ts"
Cohesion: 0.05
Nodes (56): CAMPAIGNS, INVESTMENT_FUNDS, main(), PERMISSIONS, prisma, ROLES, seedCampaigns(), seedInvestmentFunds() (+48 more)

### Community 8 - "UnimplementedProviderBase"
Cohesion: 0.10
Nodes (10): ProviderNotConfiguredError, BorsaIstanbulProvider, BorsaIstanbulProviderConfig, CryptoProvider, CryptoProviderConfig, ForeksProvider, ForeksProviderConfig, KAPProvider (+2 more)

### Community 9 - "dependencies"
Cohesion: 0.09
Nodes (23): dependencies, @auth/prisma-adapter, bcryptjs, bullmq, clsx, date-fns, decimal.js, fast-xml-parser (+15 more)

### Community 10 - "ContentForms.tsx"
Cohesion: 0.13
Nodes (18): next, ADMIN_INPUT, ADMIN_TEXTAREA, CampaignValues, CATEGORIES, ASSET_TYPES, CRYPTO_NETWORKS, IPO_STATUSES (+10 more)

### Community 11 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 12 - "package.json"
Cohesion: 0.11
Nodes (18): name, private, version, clsx, date-fns, dotenv, flag-icons, lightweight-charts (+10 more)

### Community 13 - "AssetIcon"
Cohesion: 0.19
Nodes (18): AssetIcon(), AssetIconProps, FLAG_CODES, hashColor(), MONOGRAM_PALETTE, tradingViewLogo(), TV_COUNTRY, AssetRow() (+10 more)

### Community 14 - "ayarlar/page.tsx"
Cohesion: 0.19
Nodes (18): SettingsPage(), getServerSnapshot(), getSnapshot(), setTheme(), subscribe(), Theme, ThemeToggle(), useTheme() (+10 more)

### Community 15 - "feed-actions.ts"
Cohesion: 0.21
Nodes (11): createIpoAction(), ipoSchema, refreshIposAction(), refreshNewsAction(), toggleIpoPublishedAction(), ipoListSchema, IpoSyncResult, mapStatus() (+3 more)

### Community 16 - "profil/page.tsx"
Cohesion: 0.17
Nodes (17): Panel(), ProfilePage(), Stat(), KycDocMeta, KycSlot(), KycUploader(), SIDES, Field() (+9 more)

### Community 17 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, dotenv, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/postcss, tsx (+5 more)

### Community 19 - "cached-provider.ts"
Cohesion: 0.25
Nodes (11): cacheAside(), readCache(), writeCacheForever(), globalForRedis, redis, CacheOptions, providerQueue, withCache() (+3 more)

### Community 20 - "WalletTransaction (source of truth rows)"
Cohesion: 0.20
Nodes (7): postgres service (postgres:17-alpine, port 5434), redis service (redis:7-alpine, port 6380), Wallet.cashBalance (projection field), WalletTransaction (source of truth rows), cached-provider.ts (cache-aside wrapper), MarketDataProvider, trading/engine.ts (order settlement engine)

### Community 21 - "WalletFlow.tsx"
Cohesion: 0.09
Nodes (34): WithdrawPage(), DepositPage(), initialState, ReviewRequestFormProps, BalanceCard(), tryFmt, usdtFmt, CurrencyFlag() (+26 more)

### Community 22 - "registry.ts"
Cohesion: 0.17
Nodes (6): CommodityProvider, YAHOO_COMMODITY, YahooFinanceBistProvider, YahooFinanceProvider, YahooFinanceUsProvider, yahooBist

### Community 23 - "This is NOT the Next.js you know (agent rules block)"
Cohesion: 0.40
Nodes (3): graphify skill reference (.claude/CLAUDE.md), Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js, Ultima platform overview

### Community 24 - "requireAdmin"
Cohesion: 0.13
Nodes (22): bannerSchema, deleteBannerAction(), optionalUrl, saveBannerAction(), assetSchema, bannerSchema, createAssetAction(), createBannerAction() (+14 more)

### Community 25 - "WalletHistory.tsx"
Cohesion: 0.17
Nodes (21): Bubble(), Card(), CardHeader(), CASH_TITLES, CashRow(), Cell(), dayFmt, dayKey() (+13 more)

### Community 26 - "zod"
Cohesion: 0.31
Nodes (7): zod, approveDepositAction(), approveWithdrawalAction(), lockWalletByUserId(), rejectDepositAction(), rejectWithdrawalAction(), reviewRequestSchema

### Community 27 - "engine.ts"
Cohesion: 0.27
Nodes (18): marketValue(), ensureWalletAndPortfolio(), evaluateLimitOrders(), executeMarketOrder(), fillLimitOrder(), LimitOrderInput, lockWallet(), MarketOrderInput (+10 more)

### Community 30 - "WalletView.tsx"
Cohesion: 0.17
Nodes (21): maskTail(), parseFxMetadata(), WalletPage(), EmptyState(), FxDetails, IconBubble(), ListCard(), money (+13 more)

### Community 32 - "manual-simulation.ts"
Cohesion: 0.06
Nodes (45): bullmq, fast-xml-parser, ioredis, server-only, GET(), CHART_PERIODS, ChartPeriod, getAssetHistory() (+37 more)

### Community 33 - "scripts"
Cohesion: 0.15
Nodes (13): scripts, build, db:deploy, db:generate, db:migrate, db:seed, db:studio, dev (+5 more)

### Community 34 - "FundsList.tsx"
Cohesion: 0.22
Nodes (15): FundsPage(), aumText(), count, FundDetail(), FundHoldingRow, FundRow, FundsList(), HoldingsSummary() (+7 more)

### Community 35 - "Link"
Cohesion: 0.24
Nodes (9): HomeBanners(), IOS_STEPS, MobileInstallAction(), PromoSlide, ACTIONS, QuickActions(), BottomSheet(), QuickLink() (+1 more)

### Community 36 - "TermDepositView.tsx"
Cohesion: 0.09
Nodes (39): TermDepositPage(), PageTopBar(), COPY, CurrencyConvertCard(), Direction, initial, money, AccountList() (+31 more)

### Community 37 - "(app)/page.tsx"
Cohesion: 0.16
Nodes (23): recharts, HomePage(), PortfolioPage(), HomeIpoBanner(), PortfolioHero(), ICONS, RecentActivity(), WatchlistCard() (+15 more)

### Community 38 - "[id]/page.tsx"
Cohesion: 0.15
Nodes (19): KYC_TONE, num, qty, SIDE_LABEL, RevealPasswordButton(), adjustSchema, adjustUserBalanceAction(), adminOrderSchema (+11 more)

### Community 39 - "MarketCards.tsx"
Cohesion: 0.18
Nodes (13): CATEGORY_TYPES, HomeCategoryList(), CATEGORY_TABS, CategoryKey, HomeCategoryPanel(), HomeRow, CARD_SYMBOLS, formatCardPrice() (+5 more)

### Community 40 - "lucide-react"
Cohesion: 0.16
Nodes (13): lucide-react, InvitePage(), Stat(), STEPS, TIERS, RewardsPage(), InviteProgram(), copy() (+5 more)

### Community 41 - "TradeSheet.tsx"
Cohesion: 0.16
Nodes (11): ShareInvite(), share(), initialState, TradeSheet(), TradeSheetProps, Button(), ButtonProps, Size (+3 more)

### Community 42 - "@prisma/client"
Cohesion: 0.21
Nodes (12): @prisma/client, AdminDashboardPage(), BalanceStat(), getPlatformBalances(), num, resolveAssetPrices(), worker(), ResolvedPrice (+4 more)

### Community 43 - "AssetDetailPage.tsx"
Cohesion: 0.19
Nodes (13): GoldAssetPage(), BorsaAssetPage(), FxAssetPage(), CryptoAssetPage(), NasdaqAssetPage(), AssetDetailPage(), AssetDetailPageProps, Cell() (+5 more)

### Community 45 - "funds/service.ts"
Cohesion: 0.35
Nodes (10): FundPurchaseState, purchaseFundAction(), redeemFundAction(), MIN_FUND_PURCHASE_TRY, floorUnits(), FundError, lockCash(), purchaseFund() (+2 more)

### Community 46 - "Quote"
Cohesion: 0.26
Nodes (5): BASE_INTERVAL, BinanceProvider, Kline, Ticker24h, Quote

### Community 47 - "cn"
Cohesion: 0.14
Nodes (16): react, PromoCarousel(), ChartKind, PERIODS, PriceChart(), PriceChartProps, readThemeColors(), Badge() (+8 more)

### Community 48 - "NewsList.tsx"
Cohesion: 0.26
Nodes (10): NewsPage(), CATEGORY_TILE, NewsList(), NewsThumbnail(), TABS, getNewsFeed(), NewsItem, relativeTime() (+2 more)

### Community 49 - "client.ts"
Cohesion: 0.23
Nodes (10): STATUS_LABEL, campaignSchema, deleteCampaignAction(), saveCampaignAction(), slugify(), toggleCampaignAction(), AuditAction, WriteAuditLogInput (+2 more)

### Community 50 - "navigation.ts"
Cohesion: 0.06
Nodes (43): nextConfig, withNextIntl, next-intl, GET(), AdminLayout(), AppLayout(), GoldMarketPage(), BistMarketPage() (+35 more)

### Community 51 - "requireUser"
Cohesion: 0.29
Nodes (9): submit(), requireUser(), cancelOrderAction(), limitOrderSchema, placeLimitOrderAction(), placeMarketOrderAction(), cancelOrder(), MarketOrderInput (+1 more)

### Community 52 - "fund-actions.ts"
Cohesion: 0.31
Nodes (6): CATEGORIES, FundValues, deleteFundAction(), fundSchema, optionalNumber, saveFundAction()

### Community 53 - "TradeTerminal.tsx"
Cohesion: 0.11
Nodes (26): TradePage(), AssetPicker(), PickerAsset, Empty(), fmtMoney(), money, pfmt(), PositionCard() (+18 more)

### Community 54 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 55 - "Sidebar.tsx"
Cohesion: 0.48
Nodes (5): computeIsOpen(), getServerSnapshot(), MarketStatusPill(), subscribe(), ITEMS

### Community 56 - "AssetPicker.tsx"
Cohesion: 0.29
Nodes (5): motion, react-dom, AssetPickerProps, FILTERS, BottomSheetProps

### Community 57 - "MarketsExplorer.tsx"
Cohesion: 0.14
Nodes (25): loadRows(), loadStockRows(), MarketsPage(), POPULAR_ORDER, popularRank(), AssetRowData, AssetClass, currentMinute() (+17 more)

### Community 59 - "decimal.ts"
Cohesion: 0.50
Nodes (3): decimal.js, profitLoss(), toDecimal()

### Community 60 - "update.sh"
Cohesion: 0.70
Nodes (4): die(), log(), update.sh script, warn()

### Community 61 - "deploy.sh"
Cohesion: 0.70
Nodes (4): die(), log(), deploy.sh script, warn()

## Ambiguous Edges - Review These
- `Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js` → `This is NOT the Next.js you know (agent rules block)`  [AMBIGUOUS]
  AGENTS.md · relation: conceptually_related_to

## Knowledge Gaps
- **353 isolated node(s):** `eslintConfig`, `withNextIntl`, `nextConfig`, `name`, `version` (+348 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 390 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js` and `This is NOT the Next.js you know (agent rules block)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `cn()` connect `cn` to `Toaster.tsx`, `IpoList.tsx`, `EntityEditors.tsx`, `auth/actions.ts`, `ContentForms.tsx`, `AssetIcon`, `ayarlar/page.tsx`, `profil/page.tsx`, `WalletFlow.tsx`, `WalletHistory.tsx`, `WalletView.tsx`, `FundsList.tsx`, `TermDepositView.tsx`, `(app)/page.tsx`, `MarketCards.tsx`, `lucide-react`, `TradeSheet.tsx`, `AssetDetailPage.tsx`, `NewsList.tsx`, `navigation.ts`, `TradeTerminal.tsx`, `Sidebar.tsx`, `AssetPicker.tsx`, `MarketsExplorer.tsx`?**
  _High betweenness centrality (0.133) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `withNextIntl`, `nextConfig` to the rest of the system?**
  _353 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `EntityEditors.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08202020202020202 - nodes in this community are weakly interconnected._
- **Why does `react` connect `cn` to `Toaster.tsx`, `IpoList.tsx`, `EntityEditors.tsx`, `auth/actions.ts`, `ContentForms.tsx`, `package.json`, `AssetIcon`, `ayarlar/page.tsx`, `profil/page.tsx`, `WalletFlow.tsx`, `WalletHistory.tsx`, `WalletView.tsx`, `FundsList.tsx`, `Link`, `TermDepositView.tsx`, `(app)/page.tsx`, `[id]/page.tsx`, `MarketCards.tsx`, `lucide-react`, `TradeSheet.tsx`, `AssetDetailPage.tsx`, `NewsList.tsx`, `navigation.ts`, `TradeTerminal.tsx`, `Sidebar.tsx`, `AssetPicker.tsx`, `MarketsExplorer.tsx`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Should `writeAuditLog` be split into smaller, more focused modules?**
  _Cohesion score 0.11827956989247312 - nodes in this community are weakly interconnected._
- **Why does `prisma` connect `client.ts` to `IpoList.tsx`, `EntityEditors.tsx`, `writeAuditLog`, `auth/actions.ts`, `ContentForms.tsx`, `feed-actions.ts`, `profil/page.tsx`, `WalletFlow.tsx`, `requireAdmin`, `zod`, `engine.ts`, `WalletView.tsx`, `manual-simulation.ts`, `FundsList.tsx`, `Link`, `TermDepositView.tsx`, `(app)/page.tsx`, `[id]/page.tsx`, `MarketCards.tsx`, `lucide-react`, `@prisma/client`, `AssetDetailPage.tsx`, `funds/service.ts`, `NewsList.tsx`, `navigation.ts`, `requireUser`, `fund-actions.ts`, `TradeTerminal.tsx`, `MarketsExplorer.tsx`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._