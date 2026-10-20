# Graph Report - ultima  (2026-10-21)

## Corpus Check
- 266 files · ~243,641 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 5, .ico 2, .toml 1)

## Summary
- 1264 nodes · 3850 edges · 61 communities (55 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f1c2e1d4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Toaster.tsx
- IpoList.tsx
- MarketSummary
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
- lucide-react
- next.config.ts
- account-actions.ts
- devDependencies
- PriceBar
- cached-provider.ts
- WalletTransaction (source of truth rows)
- WalletFlow.tsx
- registry.ts
- This is NOT the Next.js you know (agent rules block)
- requireAdmin
- cn
- admin-actions.ts
- news/sync.ts
- postcss.config.mjs
- DataProvenance (LIVE/DELAYED/MANUAL_OVERRIDE/CACHED/UNAVAILABLE)
- WalletView.tsx
- { GET, POST }
- resolve-price.ts
- scripts
- FundsList.tsx
- Link
- TermDepositView.tsx
- formatPrice
- user-actions.ts
- engine.ts
- LoginForm.tsx
- rbac.ts
- trading/actions.ts
- AssetDetailPage.tsx
- HomeCategoryList.tsx
- Quote
- decimal.ts
- feed.ts
- campaign-actions.ts
- navigation.ts
- PositionSheets.tsx
- (app)/layout.tsx
- TradeTerminal.tsx
- AdminShell.tsx
- Sidebar.tsx
- types.d.ts
- MarketsExplorer.tsx
- Header.tsx
- odulller/page.tsx
- deploy.sh

## God Nodes (most connected - your core abstractions)
1. `cn()` - 118 edges
2. `prisma` - 67 edges
3. `Link` - 65 edges
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

## Communities (61 total, 6 thin omitted)

### Community 0 - "Toaster.tsx"
Cohesion: 0.16
Nodes (13): AuthLayout(), FONT_VARS, LocaleLayout(), metadata, ToastApi, ToastCard(), ToastContext, ToastItem (+5 more)

### Community 1 - "IpoList.tsx"
Cohesion: 0.16
Nodes (19): Card(), compactTry(), dateText(), FOOTER, IpoDrawer(), IpoList(), IpoRow, IpoStatus (+11 more)

### Community 3 - "ContentForms.tsx"
Cohesion: 0.07
Nodes (92): AdminBankAccountsPage(), AdminBannersPage(), AdminFundsPage(), AdminNewsPage(), AdminIposPage(), STATUS, AdminCampaignsPage(), STATUS_LABEL (+84 more)

### Community 4 - "writeAuditLog"
Cohesion: 0.11
Nodes (30): assetSchema, bankSchema, BIST_TYPES, CATEGORIES, cryptoSchema, deleteAssetAction(), deleteBankAction(), deleteCryptoAction() (+22 more)

### Community 5 - "truncgil-provider.ts"
Cohesion: 0.13
Nodes (7): CachedSnapshot, SYMBOL_MAP, TruncgilProvider, TruncgilProviderConfig, TruncgilResponse, TruncgilRow, AssetMeta

### Community 6 - "types/index.ts"
Cohesion: 0.12
Nodes (10): MarketDataProvider, MarketDataProviderRegistry, AssetRef, AssetType, CorporateActionEvent, IndexValue, MarketStatus, NewsItem (+2 more)

### Community 7 - "auth/actions.ts"
Cohesion: 0.20
Nodes (15): @auth/prisma-adapter, loginAction(), logoutAction(), registerAction(), handlers, signIn, signOut, hashTcKimlik() (+7 more)

### Community 8 - "UnimplementedProviderBase"
Cohesion: 0.10
Nodes (10): ProviderNotConfiguredError, BorsaIstanbulProvider, BorsaIstanbulProviderConfig, CryptoProvider, CryptoProviderConfig, ForeksProvider, ForeksProviderConfig, KAPProvider (+2 more)

### Community 9 - "dependencies"
Cohesion: 0.09
Nodes (23): dependencies, @auth/prisma-adapter, bcryptjs, bullmq, clsx, date-fns, decimal.js, fast-xml-parser (+15 more)

### Community 10 - "client.ts"
Cohesion: 0.09
Nodes (31): next, zod, createBankAccountAction(), schema, toggleBankAccountAction(), AdminActionResult, createCryptoAddressAction(), schema (+23 more)

### Community 11 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 12 - "package.json"
Cohesion: 0.10
Nodes (19): eslintConfig, name, private, version, clsx, date-fns, dotenv, eslint (+11 more)

### Community 13 - "AssetIcon"
Cohesion: 0.17
Nodes (16): CARD_SYMBOLS, formatCardPrice(), MarketCards(), AssetIcon(), AssetIconProps, FLAG_CODES, hashColor(), MONOGRAM_PALETTE (+8 more)

### Community 14 - "lucide-react"
Cohesion: 0.06
Nodes (57): lightweight-charts, lucide-react, motion, react, react-dom, @tanstack/react-query, SettingsPage(), Panel() (+49 more)

### Community 16 - "account-actions.ts"
Cohesion: 0.13
Nodes (19): CAMPAIGNS, INVESTMENT_FUNDS, main(), PERMISSIONS, prisma, ROLES, seedCampaigns(), seedInvestmentFunds() (+11 more)

### Community 17 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, dotenv, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/postcss, tsx (+5 more)

### Community 18 - "PriceBar"
Cohesion: 0.18
Nodes (7): CachedRates, Rate, TCMBCurrencyRow, TCMBProvider, TCMBProviderConfig, PriceBar, PriceInterval

### Community 19 - "cached-provider.ts"
Cohesion: 0.23
Nodes (12): ioredis, cacheAside(), readCache(), writeCacheForever(), globalForRedis, redis, CacheOptions, providerQueue (+4 more)

### Community 20 - "WalletTransaction (source of truth rows)"
Cohesion: 0.20
Nodes (7): postgres service (postgres:17-alpine, port 5434), redis service (redis:7-alpine, port 6380), Wallet.cashBalance (projection field), WalletTransaction (source of truth rows), cached-provider.ts (cache-aside wrapper), MarketDataProvider, trading/engine.ts (order settlement engine)

### Community 21 - "WalletFlow.tsx"
Cohesion: 0.08
Nodes (36): initialState, ReviewRequestFormProps, ShareInvite(), share(), Button(), ButtonProps, Size, SIZE_STYLES (+28 more)

### Community 22 - "registry.ts"
Cohesion: 0.17
Nodes (6): CommodityProvider, YAHOO_COMMODITY, YahooFinanceBistProvider, YahooFinanceProvider, YahooFinanceUsProvider, yahooBist

### Community 23 - "This is NOT the Next.js you know (agent rules block)"
Cohesion: 0.40
Nodes (3): graphify skill reference (.claude/CLAUDE.md), Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js, Ultima platform overview

### Community 24 - "requireAdmin"
Cohesion: 0.15
Nodes (18): bannerSchema, deleteBannerAction(), optionalUrl, saveBannerAction(), assetSchema, bannerSchema, createAssetAction(), createBannerAction() (+10 more)

### Community 25 - "cn"
Cohesion: 0.11
Nodes (28): PromoSlide, Badge(), BadgeProps, Tone, TONE_STYLES, TabOption, TabsProps, Bubble() (+20 more)

### Community 26 - "admin-actions.ts"
Cohesion: 0.36
Nodes (6): approveDepositAction(), approveWithdrawalAction(), lockWalletByUserId(), rejectDepositAction(), rejectWithdrawalAction(), reviewRequestSchema

### Community 27 - "news/sync.ts"
Cohesion: 0.15
Nodes (12): fast-xml-parser, refreshNewsAction(), categorize(), IncomingArticle, JSON_CATEGORY, jsonSchema, NewsSyncResult, readJsonNews() (+4 more)

### Community 30 - "WalletView.tsx"
Cohesion: 0.11
Nodes (28): maskTail(), parseFxMetadata(), WalletPage(), BalanceCard(), tryFmt, usdtFmt, CurrencyFlag(), Direction (+20 more)

### Community 32 - "resolve-price.ts"
Cohesion: 0.07
Nodes (41): bullmq, server-only, GET(), InvitePage(), Stat(), STEPS, TIERS, InviteProgram() (+33 more)

### Community 33 - "scripts"
Cohesion: 0.15
Nodes (13): scripts, build, db:deploy, db:generate, db:migrate, db:seed, db:studio, dev (+5 more)

### Community 34 - "FundsList.tsx"
Cohesion: 0.15
Nodes (25): FundsPage(), aumText(), count, FundDetail(), FundHoldingRow, FundRow, FundsList(), HoldingsSummary() (+17 more)

### Community 35 - "Link"
Cohesion: 0.28
Nodes (8): AdminDashboardPage(), HomePage(), HomeBanners(), HomeIpoBanner(), PromoCarousel(), ACTIONS, QuickActions(), Link

### Community 36 - "TermDepositView.tsx"
Cohesion: 0.11
Nodes (34): TermDepositPage(), COPY, CurrencyConvertCard(), Direction, initial, money, AccountList(), dateFmt (+26 more)

### Community 37 - "formatPrice"
Cohesion: 0.13
Nodes (26): @prisma/client, recharts, PortfolioPage(), PortfolioHero(), ICONS, RecentActivity(), WatchlistCard(), WatchlistSection() (+18 more)

### Community 38 - "user-actions.ts"
Cohesion: 0.18
Nodes (13): RevealPasswordButton(), adjustSchema, adjustUserBalanceAction(), holdingSchema, newPasswordSchema, revealUserPasswordAction(), reviewKycAction(), round2() (+5 more)

### Community 39 - "engine.ts"
Cohesion: 0.26
Nodes (19): resolveAssetPrice(), marketValue(), ensureWalletAndPortfolio(), evaluateLimitOrders(), executeMarketOrder(), fillLimitOrder(), LimitOrderInput, lockWallet() (+11 more)

### Community 40 - "LoginForm.tsx"
Cohesion: 0.20
Nodes (13): LoginPage(), RegisterPage(), LegalModal(), LegalModalProps, initialState, LoginForm(), Mode, ConsentKey (+5 more)

### Community 41 - "rbac.ts"
Cohesion: 0.27
Nodes (10): GET(), AdminLayout(), WithdrawPage(), DepositPage(), IpoListPage(), auth, ADMIN_ROLES, getCurrentUser() (+2 more)

### Community 42 - "trading/actions.ts"
Cohesion: 0.15
Nodes (14): initialState, TradeSheet(), TradeSheetProps, cancel(), submit(), useToast(), cancelOrderAction(), limitOrderSchema (+6 more)

### Community 43 - "AssetDetailPage.tsx"
Cohesion: 0.19
Nodes (13): GoldAssetPage(), BorsaAssetPage(), FxAssetPage(), CryptoAssetPage(), NasdaqAssetPage(), AssetDetailPage(), AssetDetailPageProps, Cell() (+5 more)

### Community 45 - "HomeCategoryList.tsx"
Cohesion: 0.24
Nodes (10): CATEGORY_TYPES, HomeCategoryList(), CATEGORY_TABS, CategoryKey, HomeCategoryPanel(), HomeRow, BASE_PATHS, getAssetBasePath() (+2 more)

### Community 46 - "Quote"
Cohesion: 0.26
Nodes (5): BASE_INTERVAL, BinanceProvider, Kline, Ticker24h, Quote

### Community 47 - "decimal.ts"
Cohesion: 0.50
Nodes (3): decimal.js, profitLoss(), toDecimal()

### Community 48 - "feed.ts"
Cohesion: 0.31
Nodes (8): NewsPage(), NewsList(), TABS, getNewsFeed(), NewsItem, relativeTime(), rtf, TAB_FOR_CATEGORY

### Community 49 - "campaign-actions.ts"
Cohesion: 0.40
Nodes (5): campaignSchema, deleteCampaignAction(), saveCampaignAction(), slugify(), toggleCampaignAction()

### Community 50 - "navigation.ts"
Cohesion: 0.21
Nodes (11): next-intl, GoldMarketPage(), BistMarketPage(), FxMarketPage(), getPathname, redirect, AppLocale, defaultLocale (+3 more)

### Community 51 - "PositionSheets.tsx"
Cohesion: 0.38
Nodes (9): money, money2(), PnlOverview(), PositionDetail(), PriceScale(), Stat(), toTry(), WalletAssetRow (+1 more)

### Community 52 - "(app)/layout.tsx"
Cohesion: 0.39
Nodes (5): AppLayout(), AutoRefresh(), BottomNav(), ITEMS, QueryProvider()

### Community 53 - "TradeTerminal.tsx"
Cohesion: 0.12
Nodes (24): TradePage(), AssetPicker(), AssetPickerProps, FILTERS, PickerAsset, Empty(), fmtMoney(), money (+16 more)

### Community 54 - "AdminShell.tsx"
Cohesion: 0.39
Nodes (7): AdminShell(), ALL_ITEMS, isActive(), NAV, NavGroup, NavItem, usePathname

### Community 55 - "Sidebar.tsx"
Cohesion: 0.43
Nodes (6): computeIsOpen(), getServerSnapshot(), MarketStatusPill(), subscribe(), ITEMS, Sidebar()

### Community 56 - "types.d.ts"
Cohesion: 0.29
Nodes (6): next-auth, JWT, next-auth, next-auth/jwt, Session, User

### Community 57 - "MarketsExplorer.tsx"
Cohesion: 0.14
Nodes (25): loadRows(), loadStockRows(), MarketsPage(), POPULAR_ORDER, popularRank(), AssetRowData, AssetClass, currentMinute() (+17 more)

### Community 58 - "Header.tsx"
Cohesion: 0.43
Nodes (5): AppHeader(), CUSTOM_HEADER_PATHS, Header(), HeaderNotification, HeaderProps

### Community 59 - "odulller/page.tsx"
Cohesion: 0.60
Nodes (3): RewardsPage(), CampaignCard(), ICONS

### Community 61 - "deploy.sh"
Cohesion: 0.70
Nodes (4): die(), log(), deploy.sh script, warn()

## Ambiguous Edges - Review These
- `Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js` → `This is NOT the Next.js you know (agent rules block)`  [AMBIGUOUS]
  AGENTS.md · relation: conceptually_related_to

## Knowledge Gaps
- **349 isolated node(s):** `eslintConfig`, `withNextIntl`, `nextConfig`, `name`, `version` (+344 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 386 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js` and `This is NOT the Next.js you know (agent rules block)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `cn()` connect `cn` to `Toaster.tsx`, `IpoList.tsx`, `ContentForms.tsx`, `AssetIcon`, `lucide-react`, `WalletFlow.tsx`, `WalletView.tsx`, `resolve-price.ts`, `FundsList.tsx`, `Link`, `TermDepositView.tsx`, `formatPrice`, `LoginForm.tsx`, `trading/actions.ts`, `AssetDetailPage.tsx`, `feed.ts`, `PositionSheets.tsx`, `TradeTerminal.tsx`, `AdminShell.tsx`, `Sidebar.tsx`, `MarketsExplorer.tsx`, `odulller/page.tsx`?**
  _High betweenness centrality (0.132) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `withNextIntl`, `nextConfig` to the rest of the system?**
  _349 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ContentForms.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06582743246787306 - nodes in this community are weakly interconnected._
- **Why does `react` connect `lucide-react` to `Toaster.tsx`, `IpoList.tsx`, `ContentForms.tsx`, `package.json`, `AssetIcon`, `WalletFlow.tsx`, `cn`, `WalletView.tsx`, `resolve-price.ts`, `FundsList.tsx`, `TermDepositView.tsx`, `formatPrice`, `user-actions.ts`, `LoginForm.tsx`, `trading/actions.ts`, `AssetDetailPage.tsx`, `HomeCategoryList.tsx`, `feed.ts`, `(app)/layout.tsx`, `TradeTerminal.tsx`, `AdminShell.tsx`, `Sidebar.tsx`, `MarketsExplorer.tsx`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Should `writeAuditLog` be split into smaller, more focused modules?**
  _Cohesion score 0.11290322580645161 - nodes in this community are weakly interconnected._
- **Why does `prisma` connect `client.ts` to `Toaster.tsx`, `ContentForms.tsx`, `writeAuditLog`, `auth/actions.ts`, `AssetIcon`, `lucide-react`, `account-actions.ts`, `WalletFlow.tsx`, `requireAdmin`, `admin-actions.ts`, `news/sync.ts`, `WalletView.tsx`, `resolve-price.ts`, `FundsList.tsx`, `Link`, `TermDepositView.tsx`, `formatPrice`, `user-actions.ts`, `engine.ts`, `rbac.ts`, `trading/actions.ts`, `AssetDetailPage.tsx`, `HomeCategoryList.tsx`, `feed.ts`, `campaign-actions.ts`, `(app)/layout.tsx`, `TradeTerminal.tsx`, `MarketsExplorer.tsx`, `odulller/page.tsx`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._