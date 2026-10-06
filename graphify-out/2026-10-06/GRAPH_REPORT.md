# Graph Report - ultima  (2026-10-06)

## Corpus Check
- 243 files · ~353,210 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 2, .ico 2, .toml 1)

## Summary
- 1133 nodes · 3360 edges · 52 communities (47 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bef97cee`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- react
- IpoList.tsx
- UnconfiguredProvider
- ContentForms.tsx
- client.ts
- truncgil-provider.ts
- types/index.ts
- auth/actions.ts
- UnimplementedProviderBase
- dependencies
- requireUserForPage
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
- cn
- Quote
- This is NOT the Next.js you know (agent rules block)
- LoginForm.tsx
- WalletHistory.tsx
- navigation.ts
- Toaster.tsx
- postcss.config.mjs
- DataProvenance (LIVE/DELAYED/MANUAL_OVERRIDE/CACHED/UNAVAILABLE)
- WalletView.tsx
- { GET, POST }
- market-data-refresh.worker.ts
- scripts
- FundsList.tsx
- resolveAssetPrice
- TermDepositView.tsx
- TradeTerminal.tsx
- wallet/actions.ts
- AssetIcon
- profil/page.tsx
- (app)/page.tsx
- PositionSheets.tsx
- AssetDetailPage.tsx
- HomeBanners.tsx
- davet/page.tsx
- cn.ts
- Link
- server-only
- TradeSheet.tsx
- Header.tsx
- decimal.ts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 113 edges
2. `prisma` - 66 edges
3. `Link` - 63 edges
4. `lucide-react` - 53 edges
5. `react` - 53 edges
6. `requireAdmin()` - 47 edges
7. `writeAuditLog()` - 44 edges
8. `formatPrice()` - 31 edges
9. `@prisma/client` - 28 edges
10. `AssetIcon()` - 27 edges

## Surprising Connections (you probably didn't know these)
- `LoginForm()` --indirect_call--> `loginAction()`  [INFERRED]
  src/components/auth/LoginForm.tsx → src/lib/auth/actions.ts
- `RegisterForm()` --indirect_call--> `registerAction()`  [INFERRED]
  src/components/auth/RegisterForm.tsx → src/lib/auth/actions.ts
- `TradeSheet()` --indirect_call--> `placeMarketOrderAction()`  [INFERRED]
  src/components/trading/TradeSheet.tsx → src/lib/trading/actions.ts
- `WalletFlow()` --indirect_call--> `createDepositRequestAction()`  [INFERRED]
  src/components/wallet/WalletFlow.tsx → src/lib/wallet/actions.ts
- `WalletFlow()` --indirect_call--> `createWithdrawalRequestAction()`  [INFERRED]
  src/components/wallet/WalletFlow.tsx → src/lib/wallet/actions.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Agent governance documentation chain (CLAUDE.md/.claude/CLAUDE.md/AGENTS.md)** — claude_claude_graphify, claude_graphify_rules, agents_nextjs_agent_rules [EXTRACTED 0.90]
- **Market data provenance and caching flow** — readme_no_fabricated_market_data, readme_data_provenance, readme_market_data_in_redis, src_lib_market_data_marketdataprovider, src_lib_market_data_cached_provider_cachedprovider, docker_compose_redis [INFERRED 0.80]
- **Wallet ledger integrity and trading settlement** — readme_trading_internal, src_lib_trading_engine_tradingengine, readme_wallet_ledger, readme_wallettransaction, readme_wallet_cashbalance [INFERRED 0.85]

## Communities (52 total, 5 thin omitted)

### Community 0 - "react"
Cohesion: 0.21
Nodes (13): react, AppLayout(), AutoRefresh(), BottomNav(), ITEMS, computeIsOpen(), getServerSnapshot(), MarketStatusPill() (+5 more)

### Community 1 - "IpoList.tsx"
Cohesion: 0.16
Nodes (19): Card(), compactTry(), dateText(), FOOTER, IpoDrawer(), IpoList(), IpoRow, IpoStatus (+11 more)

### Community 3 - "ContentForms.tsx"
Cohesion: 0.09
Nodes (58): AdminBankAccountsPage(), AdminBannersPage(), AdminFundsPage(), AdminNewsPage(), AdminIposPage(), STATUS, AdminCampaignsPage(), AdminCryptoAddressesPage() (+50 more)

### Community 4 - "client.ts"
Cohesion: 0.05
Nodes (83): fast-xml-parser, next, zod, STATUS_LABEL, AuthLayout(), createBankAccountAction(), schema, toggleBankAccountAction() (+75 more)

### Community 5 - "truncgil-provider.ts"
Cohesion: 0.14
Nodes (7): CachedSnapshot, SYMBOL_MAP, TruncgilProvider, TruncgilProviderConfig, TruncgilResponse, TruncgilRow, MarketSummary

### Community 6 - "types/index.ts"
Cohesion: 0.13
Nodes (13): CachedRates, Rate, TCMBCurrencyRow, TCMBProviderConfig, AssetMeta, AssetRef, AssetType, CorporateActionEvent (+5 more)

### Community 7 - "auth/actions.ts"
Cohesion: 0.09
Nodes (31): CAMPAIGNS, INVESTMENT_FUNDS, main(), PERMISSIONS, prisma, ROLES, seedCampaigns(), seedInvestmentFunds() (+23 more)

### Community 8 - "UnimplementedProviderBase"
Cohesion: 0.10
Nodes (10): ProviderNotConfiguredError, BorsaIstanbulProvider, BorsaIstanbulProviderConfig, CryptoProvider, CryptoProviderConfig, ForeksProvider, ForeksProviderConfig, KAPProvider (+2 more)

### Community 9 - "dependencies"
Cohesion: 0.09
Nodes (23): dependencies, @auth/prisma-adapter, bcryptjs, bullmq, clsx, date-fns, decimal.js, fast-xml-parser (+15 more)

### Community 10 - "requireUserForPage"
Cohesion: 0.32
Nodes (7): WithdrawPage(), DepositPage(), RewardsPage(), CampaignCard(), ICONS, requireUserForPage(), loadWalletFlowData()

### Community 11 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 12 - "package.json"
Cohesion: 0.09
Nodes (21): eslintConfig, name, private, version, clsx, date-fns, dotenv, eslint (+13 more)

### Community 13 - "MarketsExplorer.tsx"
Cohesion: 0.17
Nodes (20): AssetRowData, AssetClass, currentMinute(), MarketsExplorer(), sessionBadge(), MarketsExplorerProps, SortKey, StockRowData (+12 more)

### Community 14 - "ayarlar/page.tsx"
Cohesion: 0.09
Nodes (33): motion, react-dom, SettingsPage(), getServerSnapshot(), getSnapshot(), setTheme(), subscribe(), Theme (+25 more)

### Community 16 - "engine.ts"
Cohesion: 0.27
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

### Community 21 - "cn"
Cohesion: 0.18
Nodes (16): AccountCard(), BankItem, CryptoItem, DetailRow(), Empty(), Field(), initial, Method (+8 more)

### Community 22 - "Quote"
Cohesion: 0.16
Nodes (7): CommodityProvider, YAHOO_COMMODITY, YahooFinanceBistProvider, YahooFinanceProvider, YahooFinanceUsProvider, yahooBist, Quote

### Community 23 - "This is NOT the Next.js you know (agent rules block)"
Cohesion: 0.40
Nodes (3): graphify skill reference (.claude/CLAUDE.md), Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js, Ultima platform overview

### Community 24 - "LoginForm.tsx"
Cohesion: 0.20
Nodes (13): LoginPage(), RegisterPage(), LegalModal(), LegalModalProps, initialState, LoginForm(), Mode, ConsentKey (+5 more)

### Community 25 - "WalletHistory.tsx"
Cohesion: 0.19
Nodes (19): Bubble(), Card(), CardHeader(), CASH_TITLES, CashRow(), Cell(), dayFmt, dayKey() (+11 more)

### Community 26 - "navigation.ts"
Cohesion: 0.21
Nodes (11): AdminLayout(), GoldMarketPage(), BistMarketPage(), FxMarketPage(), AdminShell(), isActive(), NAV, NavGroup (+3 more)

### Community 27 - "Toaster.tsx"
Cohesion: 0.29
Nodes (7): LocaleLayout(), ToastApi, ToastCard(), ToastContext, ToastItem, ToastKind, ToastProvider()

### Community 30 - "WalletView.tsx"
Cohesion: 0.12
Nodes (26): maskTail(), parseFxMetadata(), WalletPage(), BalanceCard(), tryFmt, usdtFmt, CurrencyFlag(), FxDetails (+18 more)

### Community 32 - "market-data-refresh.worker.ts"
Cohesion: 0.36
Nodes (7): bullmq, queueConnection, MARKET_DATA_REFRESH_QUEUE, marketDataQueue, scheduleMarketDataRefresh(), refreshFxQuotes(), worker

### Community 33 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, db:generate, db:migrate, db:seed, db:studio, dev, lint (+3 more)

### Community 34 - "FundsList.tsx"
Cohesion: 0.15
Nodes (26): FundsPage(), aumText(), count, FundDetail(), FundHoldingRow, FundRow, FundsList(), HoldingsSummary() (+18 more)

### Community 35 - "resolveAssetPrice"
Cohesion: 0.27
Nodes (11): GET(), TradePage(), loadRows(), loadStockRows(), MarketsPage(), POPULAR_ORDER, popularRank(), TerminalOrder (+3 more)

### Community 36 - "TermDepositView.tsx"
Cohesion: 0.10
Nodes (39): TermDepositPage(), PageTopBar(), COPY, CurrencyConvertCard(), Direction, initial, money, AccountList() (+31 more)

### Community 37 - "TradeTerminal.tsx"
Cohesion: 0.14
Nodes (24): Empty(), fmtMoney(), money, pfmt(), PositionCard(), priceFmt, SummaryRow(), TabButton() (+16 more)

### Community 38 - "wallet/actions.ts"
Cohesion: 0.29
Nodes (8): initialState, ReviewRequestFormProps, amountSchema, createDepositRequestAction(), createWithdrawalRequestAction(), methodSchema, newReference(), WalletActionResult

### Community 39 - "AssetIcon"
Cohesion: 0.12
Nodes (18): AssetIcon(), AssetIconProps, FLAG_CODES, hashColor(), MONOGRAM_PALETTE, tradingViewLogo(), TV_COUNTRY, AssetRow() (+10 more)

### Community 40 - "profil/page.tsx"
Cohesion: 0.17
Nodes (17): Panel(), ProfilePage(), Stat(), KycDocMeta, KycSlot(), KycUploader(), SIDES, Field() (+9 more)

### Community 41 - "(app)/page.tsx"
Cohesion: 0.06
Nodes (63): nextConfig, withNextIntl, next-intl, @prisma/client, recharts, GET(), HomePage(), PortfolioPage() (+55 more)

### Community 42 - "PositionSheets.tsx"
Cohesion: 0.54
Nodes (7): money, money2(), PnlOverview(), PositionDetail(), PriceScale(), Stat(), toTry()

### Community 43 - "AssetDetailPage.tsx"
Cohesion: 0.20
Nodes (12): GoldAssetPage(), BorsaAssetPage(), FxAssetPage(), NasdaqAssetPage(), AssetDetailPage(), AssetDetailPageProps, Cell(), compact (+4 more)

### Community 44 - "HomeBanners.tsx"
Cohesion: 0.43
Nodes (3): HomeBanners(), PromoCarousel(), PromoSlide

### Community 45 - "davet/page.tsx"
Cohesion: 0.22
Nodes (9): InvitePage(), Stat(), STEPS, TIERS, InviteProgram(), copy(), share(), ensureReferralCode() (+1 more)

### Community 46 - "cn.ts"
Cohesion: 0.14
Nodes (12): ChartKind, PERIODS, PriceChart(), PriceChartProps, readThemeColors(), Badge(), BadgeProps, Tone (+4 more)

### Community 47 - "Link"
Cohesion: 0.24
Nodes (9): lucide-react, AdminDashboardPage(), IpoListPage(), HomeIpoBanner(), IOS_STEPS, MobileInstallAction(), ACTIONS, QuickActions() (+1 more)

### Community 48 - "server-only"
Cohesion: 0.27
Nodes (9): server-only, NewsPage(), NewsList(), TABS, getNewsFeed(), NewsItem, relativeTime(), rtf (+1 more)

### Community 49 - "TradeSheet.tsx"
Cohesion: 0.15
Nodes (12): ShareInvite(), share(), initialState, TradeSheet(), TradeSheetProps, Button(), ButtonProps, Size (+4 more)

### Community 50 - "Header.tsx"
Cohesion: 0.43
Nodes (5): AppHeader(), CUSTOM_HEADER_PATHS, Header(), HeaderNotification, HeaderProps

### Community 51 - "decimal.ts"
Cohesion: 0.50
Nodes (3): decimal.js, profitLoss(), toDecimal()

## Ambiguous Edges - Review These
- `Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js` → `This is NOT the Next.js you know (agent rules block)`  [AMBIGUOUS]
  AGENTS.md · relation: conceptually_related_to

## Knowledge Gaps
- **310 isolated node(s):** `eslintConfig`, `withNextIntl`, `nextConfig`, `name`, `version` (+305 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 343 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js` and `This is NOT the Next.js you know (agent rules block)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `cn()` connect `cn` to `react`, `IpoList.tsx`, `ContentForms.tsx`, `requireUserForPage`, `MarketsExplorer.tsx`, `ayarlar/page.tsx`, `LoginForm.tsx`, `WalletHistory.tsx`, `navigation.ts`, `Toaster.tsx`, `WalletView.tsx`, `FundsList.tsx`, `TermDepositView.tsx`, `TradeTerminal.tsx`, `AssetIcon`, `profil/page.tsx`, `(app)/page.tsx`, `PositionSheets.tsx`, `AssetDetailPage.tsx`, `HomeBanners.tsx`, `davet/page.tsx`, `cn.ts`, `server-only`, `TradeSheet.tsx`?**
  _High betweenness centrality (0.139) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `withNextIntl`, `nextConfig` to the rest of the system?**
  _310 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ContentForms.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09074074074074075 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `IpoList.tsx`, `ContentForms.tsx`, `client.ts`, `package.json`, `MarketsExplorer.tsx`, `ayarlar/page.tsx`, `cn`, `LoginForm.tsx`, `WalletHistory.tsx`, `navigation.ts`, `Toaster.tsx`, `WalletView.tsx`, `FundsList.tsx`, `TermDepositView.tsx`, `TradeTerminal.tsx`, `wallet/actions.ts`, `AssetIcon`, `profil/page.tsx`, `(app)/page.tsx`, `AssetDetailPage.tsx`, `HomeBanners.tsx`, `davet/page.tsx`, `cn.ts`, `Link`, `server-only`, `TradeSheet.tsx`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Should `client.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05187656380316931 - nodes in this community are weakly interconnected._
- **Why does `prisma` connect `client.ts` to `react`, `ContentForms.tsx`, `auth/actions.ts`, `requireUserForPage`, `ayarlar/page.tsx`, `engine.ts`, `WalletView.tsx`, `market-data-refresh.worker.ts`, `FundsList.tsx`, `resolveAssetPrice`, `TermDepositView.tsx`, `TradeTerminal.tsx`, `wallet/actions.ts`, `profil/page.tsx`, `(app)/page.tsx`, `AssetDetailPage.tsx`, `HomeBanners.tsx`, `davet/page.tsx`, `Link`, `server-only`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._