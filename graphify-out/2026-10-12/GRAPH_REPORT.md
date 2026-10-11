# Graph Report - ultima  (2026-10-07)

## Corpus Check
- 253 files · ~415,107 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 2, .ico 2, .toml 1)

## Summary
- 1196 nodes · 3660 edges · 50 communities (42 shown, 8 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bef97cee`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Link
- IpoList.tsx
- UnconfiguredProvider
- client.ts
- requireAdmin
- truncgil-provider.ts
- types/index.ts
- react
- UnimplementedProviderBase
- dependencies
- TradeSheet.tsx
- compilerOptions
- package.json
- MarketsExplorer.tsx
- ayarlar/page.tsx
- MarketDataProvider
- engine.ts
- devDependencies
- TCMBProvider
- cached-provider.ts
- WalletTransaction (source of truth rows)
- WalletFlow.tsx
- Quote
- This is NOT the Next.js you know (agent rules block)
- @prisma/client
- WalletHistory.tsx
- wallet/actions.ts
- Toaster.tsx
- postcss.config.mjs
- DataProvenance (LIVE/DELAYED/MANUAL_OVERRIDE/CACHED/UNAVAILABLE)
- WalletView.tsx
- { GET, POST }
- get-history.ts
- scripts
- FundsList.tsx
- routing.ts
- TermDepositView.tsx
- TradeTerminal.tsx
- next.config.ts
- MarketCards.tsx
- requireUserForPage
- lucide-react
- HoldingsList.tsx
- cn
- davet/page.tsx
- HomeBanners.tsx
- requireUser
- decimal.ts
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
10. `AssetIcon()` - 27 edges

## Surprising Connections (you probably didn't know these)
- `TradeSheet()` --indirect_call--> `placeMarketOrderAction()`  [INFERRED]
  src/components/trading/TradeSheet.tsx → src/lib/trading/actions.ts
- `UsdTransferForm()` --indirect_call--> `convertCurrencyAction()`  [INFERRED]
  src/components/wallet/UsdTransferForm.tsx → src/lib/wallet/fx-actions.ts
- `WalletFlow()` --indirect_call--> `createDepositRequestAction()`  [INFERRED]
  src/components/wallet/WalletFlow.tsx → src/lib/wallet/actions.ts
- `WalletFlow()` --indirect_call--> `createWithdrawalRequestAction()`  [INFERRED]
  src/components/wallet/WalletFlow.tsx → src/lib/wallet/actions.ts
- `This is NOT the Next.js you know (agent rules block)` --conceptually_related_to--> `Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js`  [AMBIGUOUS]
  AGENTS.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Agent governance documentation chain (CLAUDE.md/.claude/CLAUDE.md/AGENTS.md)** — claude_claude_graphify, claude_graphify_rules, agents_nextjs_agent_rules [EXTRACTED 0.90]
- **Market data provenance and caching flow** — readme_no_fabricated_market_data, readme_data_provenance, readme_market_data_in_redis, src_lib_market_data_marketdataprovider, src_lib_market_data_cached_provider_cachedprovider, docker_compose_redis [INFERRED 0.80]
- **Wallet ledger integrity and trading settlement** — readme_trading_internal, src_lib_trading_engine_tradingengine, readme_wallet_ledger, readme_wallettransaction, readme_wallet_cashbalance [INFERRED 0.85]

## Communities (50 total, 8 thin omitted)

### Community 0 - "Link"
Cohesion: 0.05
Nodes (59): GET(), AdminLayout(), AdminDashboardPage(), AppLayout(), RewardsPage(), GoldMarketPage(), BistMarketPage(), FxMarketPage() (+51 more)

### Community 1 - "IpoList.tsx"
Cohesion: 0.16
Nodes (20): IpoListPage(), Card(), compactTry(), dateText(), FOOTER, IpoDrawer(), IpoList(), IpoRow (+12 more)

### Community 3 - "client.ts"
Cohesion: 0.07
Nodes (88): AdminBankAccountsPage(), AdminBannersPage(), AdminFundsPage(), AdminNewsPage(), AdminIposPage(), STATUS, AdminCampaignsPage(), STATUS_LABEL (+80 more)

### Community 4 - "requireAdmin"
Cohesion: 0.05
Nodes (89): next, zod, createBankAccountAction(), schema, toggleBankAccountAction(), bannerSchema, deleteBannerAction(), optionalUrl (+81 more)

### Community 5 - "truncgil-provider.ts"
Cohesion: 0.14
Nodes (7): CachedSnapshot, SYMBOL_MAP, TruncgilProvider, TruncgilProviderConfig, TruncgilResponse, TruncgilRow, MarketSummary

### Community 6 - "types/index.ts"
Cohesion: 0.13
Nodes (13): CachedRates, Rate, TCMBCurrencyRow, TCMBProviderConfig, AssetMeta, AssetRef, AssetType, CorporateActionEvent (+5 more)

### Community 7 - "react"
Cohesion: 0.06
Nodes (45): CAMPAIGNS, INVESTMENT_FUNDS, main(), PERMISSIONS, prisma, ROLES, seedCampaigns(), seedInvestmentFunds() (+37 more)

### Community 8 - "UnimplementedProviderBase"
Cohesion: 0.10
Nodes (10): ProviderNotConfiguredError, BorsaIstanbulProvider, BorsaIstanbulProviderConfig, CryptoProvider, CryptoProviderConfig, ForeksProvider, ForeksProviderConfig, KAPProvider (+2 more)

### Community 9 - "dependencies"
Cohesion: 0.09
Nodes (23): dependencies, @auth/prisma-adapter, bcryptjs, bullmq, clsx, date-fns, decimal.js, fast-xml-parser (+15 more)

### Community 10 - "TradeSheet.tsx"
Cohesion: 0.14
Nodes (13): ShareInvite(), share(), initialState, TradeSheet(), TradeSheetProps, Button(), ButtonProps, Size (+5 more)

### Community 11 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 12 - "package.json"
Cohesion: 0.10
Nodes (19): name, private, version, clsx, date-fns, dotenv, flag-icons, motion (+11 more)

### Community 13 - "MarketsExplorer.tsx"
Cohesion: 0.14
Nodes (25): loadRows(), loadStockRows(), MarketsPage(), POPULAR_ORDER, popularRank(), AssetRowData, AssetClass, currentMinute() (+17 more)

### Community 14 - "ayarlar/page.tsx"
Cohesion: 0.11
Nodes (30): SettingsPage(), getServerSnapshot(), getSnapshot(), setTheme(), subscribe(), Theme, ThemeToggle(), useTheme() (+22 more)

### Community 16 - "engine.ts"
Cohesion: 0.25
Nodes (18): marketValue(), ensureWalletAndPortfolio(), evaluateLimitOrders(), executeMarketOrder(), fillLimitOrder(), LimitOrderInput, lockWallet(), MarketOrderInput (+10 more)

### Community 17 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, dotenv, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/postcss, tsx (+5 more)

### Community 18 - "TCMBProvider"
Cohesion: 0.21
Nodes (3): TCMBProvider, PriceBar, PriceInterval

### Community 19 - "cached-provider.ts"
Cohesion: 0.23
Nodes (12): ioredis, cacheAside(), readCache(), writeCacheForever(), globalForRedis, redis, CacheOptions, providerQueue (+4 more)

### Community 20 - "WalletTransaction (source of truth rows)"
Cohesion: 0.20
Nodes (7): postgres service (postgres:17-alpine, port 5434), redis service (redis:7-alpine, port 6380), Wallet.cashBalance (projection field), WalletTransaction (source of truth rows), cached-provider.ts (cache-aside wrapper), MarketDataProvider, trading/engine.ts (order settlement engine)

### Community 21 - "WalletFlow.tsx"
Cohesion: 0.13
Nodes (20): BalanceCard(), tryFmt, usdtFmt, CurrencyFlag(), AccountCard(), BankItem, CryptoItem, DetailRow() (+12 more)

### Community 22 - "Quote"
Cohesion: 0.16
Nodes (7): CommodityProvider, YAHOO_COMMODITY, YahooFinanceBistProvider, YahooFinanceProvider, YahooFinanceUsProvider, yahooBist, Quote

### Community 23 - "This is NOT the Next.js you know (agent rules block)"
Cohesion: 0.40
Nodes (3): graphify skill reference (.claude/CLAUDE.md), Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js, Ultima platform overview

### Community 24 - "@prisma/client"
Cohesion: 0.19
Nodes (14): @prisma/client, CATEGORY_TYPES, HomeCategoryList(), CATEGORY_TABS, CategoryKey, HomeCategoryPanel(), HomeRow, resolveAssetPrices() (+6 more)

### Community 25 - "WalletHistory.tsx"
Cohesion: 0.15
Nodes (23): ICONS, RecentActivity(), Bubble(), Card(), CardHeader(), CASH_TITLES, CashRow(), Cell() (+15 more)

### Community 26 - "wallet/actions.ts"
Cohesion: 0.29
Nodes (8): initialState, ReviewRequestFormProps, amountSchema, createDepositRequestAction(), createWithdrawalRequestAction(), methodSchema, newReference(), WalletActionResult

### Community 27 - "Toaster.tsx"
Cohesion: 0.19
Nodes (10): geistMono, LocaleLayout(), metadata, plexSans, ToastApi, ToastCard(), ToastContext, ToastItem (+2 more)

### Community 30 - "WalletView.tsx"
Cohesion: 0.12
Nodes (31): maskTail(), parseFxMetadata(), WalletPage(), money, money2(), PnlOverview(), PositionDetail(), PriceScale() (+23 more)

### Community 32 - "get-history.ts"
Cohesion: 0.17
Nodes (14): bullmq, GET(), CHART_PERIODS, ChartPeriod, getAssetHistory(), isChartPeriod(), PERIOD_DAYS, marketDataRegistry (+6 more)

### Community 33 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, db:generate, db:migrate, db:seed, db:studio, dev, lint (+3 more)

### Community 34 - "FundsList.tsx"
Cohesion: 0.15
Nodes (25): FundsPage(), aumText(), count, FundDetail(), FundHoldingRow, FundRow, FundsList(), HoldingsSummary() (+17 more)

### Community 35 - "routing.ts"
Cohesion: 0.32
Nodes (5): AppLocale, defaultLocale, locales, routing, config

### Community 36 - "TermDepositView.tsx"
Cohesion: 0.10
Nodes (37): TermDepositPage(), COPY, CurrencyConvertCard(), Direction, initial, money, AccountList(), dateFmt (+29 more)

### Community 37 - "TradeTerminal.tsx"
Cohesion: 0.12
Nodes (25): TradePage(), AssetPicker(), AssetPickerProps, FILTERS, PickerAsset, Empty(), fmtMoney(), money (+17 more)

### Community 39 - "MarketCards.tsx"
Cohesion: 0.43
Nodes (5): CARD_SYMBOLS, formatCardPrice(), MarketCards(), Sparkline(), SparklineProps

### Community 40 - "requireUserForPage"
Cohesion: 0.67
Nodes (4): WithdrawPage(), DepositPage(), requireUserForPage(), loadWalletFlowData()

### Community 41 - "lucide-react"
Cohesion: 0.16
Nodes (23): lucide-react, next-intl, recharts, HomePage(), PortfolioPage(), HomeBanners(), HomeIpoBanner(), IOS_STEPS (+15 more)

### Community 42 - "HoldingsList.tsx"
Cohesion: 0.15
Nodes (14): WatchlistSection(), HoldingLink(), HoldingsList(), Badge(), BadgeProps, Tone, TONE_STYLES, DataStatusBadge() (+6 more)

### Community 43 - "cn"
Cohesion: 0.10
Nodes (31): lightweight-charts, @tanstack/react-query, GoldAssetPage(), BorsaAssetPage(), FxAssetPage(), NasdaqAssetPage(), AssetDetailPage(), AssetDetailPageProps (+23 more)

### Community 45 - "davet/page.tsx"
Cohesion: 0.07
Nodes (29): fast-xml-parser, server-only, InvitePage(), Stat(), STEPS, TIERS, NewsPage(), NewsList() (+21 more)

### Community 49 - "requireUser"
Cohesion: 0.26
Nodes (10): cancel(), submit(), requireUser(), cancelOrderAction(), limitOrderSchema, placeLimitOrderAction(), placeMarketOrderAction(), cancelOrder() (+2 more)

### Community 51 - "decimal.ts"
Cohesion: 0.50
Nodes (3): decimal.js, profitLoss(), toDecimal()

### Community 56 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

## Ambiguous Edges - Review These
- `Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js` → `This is NOT the Next.js you know (agent rules block)`  [AMBIGUOUS]
  AGENTS.md · relation: conceptually_related_to

## Knowledge Gaps
- **333 isolated node(s):** `eslintConfig`, `withNextIntl`, `nextConfig`, `name`, `version` (+328 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 368 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js` and `This is NOT the Next.js you know (agent rules block)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `cn()` connect `cn` to `Link`, `IpoList.tsx`, `client.ts`, `react`, `TradeSheet.tsx`, `MarketsExplorer.tsx`, `ayarlar/page.tsx`, `WalletFlow.tsx`, `WalletHistory.tsx`, `Toaster.tsx`, `WalletView.tsx`, `FundsList.tsx`, `TermDepositView.tsx`, `TradeTerminal.tsx`, `MarketCards.tsx`, `lucide-react`, `HoldingsList.tsx`, `davet/page.tsx`, `HomeBanners.tsx`?**
  _High betweenness centrality (0.154) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `withNextIntl`, `nextConfig` to the rest of the system?**
  _333 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Link` be split into smaller, more focused modules?**
  _Cohesion score 0.050200803212851405 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `Link`, `IpoList.tsx`, `client.ts`, `TradeSheet.tsx`, `package.json`, `MarketsExplorer.tsx`, `ayarlar/page.tsx`, `WalletFlow.tsx`, `@prisma/client`, `WalletHistory.tsx`, `wallet/actions.ts`, `Toaster.tsx`, `WalletView.tsx`, `FundsList.tsx`, `TermDepositView.tsx`, `TradeTerminal.tsx`, `MarketCards.tsx`, `lucide-react`, `HoldingsList.tsx`, `cn`, `davet/page.tsx`, `HomeBanners.tsx`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **Should `client.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07240896358543418 - nodes in this community are weakly interconnected._
- **Why does `prisma` connect `client.ts` to `Link`, `IpoList.tsx`, `requireAdmin`, `react`, `MarketsExplorer.tsx`, `ayarlar/page.tsx`, `engine.ts`, `@prisma/client`, `wallet/actions.ts`, `WalletView.tsx`, `get-history.ts`, `FundsList.tsx`, `TermDepositView.tsx`, `TradeTerminal.tsx`, `MarketCards.tsx`, `lucide-react`, `cn`, `davet/page.tsx`, `HomeBanners.tsx`, `requireUser`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._