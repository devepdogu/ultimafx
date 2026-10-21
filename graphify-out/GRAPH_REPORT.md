# Graph Report - ultima  (2026-10-22)

## Corpus Check
- 283 files · ~253,141 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 5, .ico 2, .toml 1)

## Summary
- 1346 nodes · 4249 edges · 57 communities (52 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e6d6e061`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- LoginForm.tsx
- IpoList.tsx
- feed-actions.ts
- pozisyonlar/page.tsx
- writeAuditLog
- truncgil-provider.ts
- types/index.ts
- auth.ts
- UnimplementedProviderBase
- dependencies
- engine.ts
- compilerOptions
- package.json
- AssetIcon
- profil/page.tsx
- zod
- seed.ts
- devDependencies
- PriceBar
- cached-provider.ts
- WalletTransaction (source of truth rows)
- WalletFlow.tsx
- registry.ts
- This is NOT the Next.js you know (agent rules block)
- requireAdmin
- WalletHistory.tsx
- client.ts
- leverage-engine.ts
- postcss.config.mjs
- DataProvenance (LIVE/DELAYED/MANUAL_OVERRIDE/CACHED/UNAVAILABLE)
- WalletView.tsx
- { GET, POST }
- manual-simulation.ts
- scripts
- FundsList.tsx
- server-only
- getCurrentUser
- Link
- [id]/page.tsx
- HomeCategoryList.tsx
- session.ts
- auth/actions.ts
- @prisma/client
- AssetDetailPage.tsx
- DataStatusBadge.tsx
- Quote
- cn
- NewsList.tsx
- campaign-actions.ts
- navigation.ts
- decimal.ts
- TradeTerminal.tsx
- MarketsExplorer.tsx
- MarketSummary
- update.sh
- deploy.sh

## God Nodes (most connected - your core abstractions)
1. `cn()` - 120 edges
2. `requireAdmin()` - 76 edges
3. `prisma` - 76 edges
4. `writeAuditLog()` - 73 edges
5. `Link` - 70 edges
6. `lucide-react` - 59 edges
7. `react` - 56 edges
8. `@prisma/client` - 35 edges
9. `AdminField()` - 33 edges
10. `AdminActionForm()` - 33 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `encryptSecret()`  [EXTRACTED]
  prisma/seed.ts → src/lib/crypto/secret-box.ts
- `RegisterForm()` --indirect_call--> `registerAction()`  [INFERRED]
  src/components/auth/RegisterForm.tsx → src/lib/auth/actions.ts
- `TradeSheet()` --indirect_call--> `placeMarketOrderAction()`  [INFERRED]
  src/components/trading/TradeSheet.tsx → src/lib/trading/actions.ts
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

## Communities (57 total, 5 thin omitted)

### Community 0 - "LoginForm.tsx"
Cohesion: 0.19
Nodes (14): LoginPage(), RegisterPage(), LegalModal(), LegalModalProps, initialState, LoginForm(), Mode, ConsentKey (+6 more)

### Community 1 - "IpoList.tsx"
Cohesion: 0.15
Nodes (21): IpoHeader(), IpoListPage(), Card(), compactTry(), dateText(), FOOTER, IpoDrawer(), IpoList() (+13 more)

### Community 2 - "feed-actions.ts"
Cohesion: 0.10
Nodes (22): fast-xml-parser, createIpoAction(), ipoSchema, refreshIposAction(), refreshNewsAction(), toggleIpoPublishedAction(), ipoListSchema, IpoSyncResult (+14 more)

### Community 3 - "pozisyonlar/page.tsx"
Cohesion: 0.06
Nodes (106): AdminBankAccountsPage(), AdminBannersPage(), AdminFundsPage(), AdminNewsPage(), AdminIposPage(), STATUS, AdminLeverageConfigPage(), ORDER (+98 more)

### Community 4 - "writeAuditLog"
Cohesion: 0.12
Nodes (29): assetSchema, bankSchema, BIST_TYPES, CATEGORIES, cryptoSchema, deleteAssetAction(), deleteBankAction(), deleteCryptoAction() (+21 more)

### Community 5 - "truncgil-provider.ts"
Cohesion: 0.13
Nodes (7): CachedSnapshot, SYMBOL_MAP, TruncgilProvider, TruncgilProviderConfig, TruncgilResponse, TruncgilRow, AssetMeta

### Community 6 - "types/index.ts"
Cohesion: 0.12
Nodes (10): MarketDataProvider, MarketDataProviderRegistry, AssetRef, AssetType, CorporateActionEvent, IndexValue, MarketStatus, NewsItem (+2 more)

### Community 7 - "auth.ts"
Cohesion: 0.13
Nodes (13): @auth/prisma-adapter, next-auth, auth, handlers, LoginInput, loginSchema, RegisterInput, registerSchema (+5 more)

### Community 8 - "UnimplementedProviderBase"
Cohesion: 0.10
Nodes (10): ProviderNotConfiguredError, BorsaIstanbulProvider, BorsaIstanbulProviderConfig, CryptoProvider, CryptoProviderConfig, ForeksProvider, ForeksProviderConfig, KAPProvider (+2 more)

### Community 9 - "dependencies"
Cohesion: 0.09
Nodes (23): dependencies, @auth/prisma-adapter, bcryptjs, bullmq, clsx, date-fns, decimal.js, fast-xml-parser (+15 more)

### Community 10 - "engine.ts"
Cohesion: 0.25
Nodes (21): marketValue(), ensureWalletAndPortfolio(), evaluateLimitOrders(), executeMarketOrder(), fillLimitOrder(), LimitOrderInput, lockWallet(), MarketOrderInput (+13 more)

### Community 11 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 12 - "package.json"
Cohesion: 0.09
Nodes (20): eslintConfig, name, private, version, clsx, date-fns, dotenv, eslint (+12 more)

### Community 13 - "AssetIcon"
Cohesion: 0.16
Nodes (21): AssetIcon(), AssetIconProps, FLAG_CODES, hashColor(), MONOGRAM_PALETTE, tradingViewLogo(), TV_COUNTRY, AssetRow() (+13 more)

### Community 14 - "profil/page.tsx"
Cohesion: 0.07
Nodes (45): SettingsPage(), Panel(), ProfilePage(), Stat(), getServerSnapshot(), getSnapshot(), setTheme(), subscribe() (+37 more)

### Community 15 - "zod"
Cohesion: 0.31
Nodes (7): zod, approveDepositAction(), approveWithdrawalAction(), lockWalletByUserId(), rejectDepositAction(), rejectWithdrawalAction(), reviewRequestSchema

### Community 16 - "seed.ts"
Cohesion: 0.20
Nodes (11): CAMPAIGNS, INVESTMENT_FUNDS, main(), PERMISSIONS, prisma, ROLES, seedCampaigns(), seedInvestmentFunds() (+3 more)

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
Cohesion: 0.06
Nodes (44): WithdrawPage(), DepositPage(), initialState, ReviewRequestFormProps, ShareInvite(), share(), TradeSheet(), Button() (+36 more)

### Community 22 - "registry.ts"
Cohesion: 0.17
Nodes (6): CommodityProvider, YAHOO_COMMODITY, YahooFinanceBistProvider, YahooFinanceProvider, YahooFinanceUsProvider, yahooBist

### Community 23 - "This is NOT the Next.js you know (agent rules block)"
Cohesion: 0.40
Nodes (3): graphify skill reference (.claude/CLAUDE.md), Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js, Ultima platform overview

### Community 24 - "requireAdmin"
Cohesion: 0.13
Nodes (20): createBankAccountAction(), schema, toggleBankAccountAction(), assetSchema, bannerSchema, createAssetAction(), createBannerAction(), createInvestmentFundAction() (+12 more)

### Community 25 - "WalletHistory.tsx"
Cohesion: 0.17
Nodes (21): Bubble(), Card(), CardHeader(), CASH_TITLES, CashRow(), Cell(), dayFmt, dayKey() (+13 more)

### Community 26 - "client.ts"
Cohesion: 0.09
Nodes (30): next, bannerSchema, deleteBannerAction(), optionalUrl, saveBannerAction(), AdminActionResult, createCryptoAddressAction(), schema (+22 more)

### Community 27 - "leverage-engine.ts"
Cohesion: 0.26
Nodes (10): editSchema, PositionAlreadyClosedError(), PositionNotFoundError(), MAX_LEVERAGE, closeLeveragedPosition(), computePnl(), evaluateLeveragedPositions(), notional() (+2 more)

### Community 30 - "WalletView.tsx"
Cohesion: 0.18
Nodes (18): BottomSheet(), EmptyState(), EmptyStateProps, UsdTransferForm(), IconBubble(), ListCard(), money, OrderList() (+10 more)

### Community 32 - "manual-simulation.ts"
Cohesion: 0.10
Nodes (30): bullmq, GET(), CHART_PERIODS, ChartPeriod, getAssetHistory(), isChartPeriod(), patchLastBarToPrice(), PERIOD_DAYS (+22 more)

### Community 33 - "scripts"
Cohesion: 0.15
Nodes (13): scripts, build, db:deploy, db:generate, db:migrate, db:seed, db:studio, dev (+5 more)

### Community 34 - "FundsList.tsx"
Cohesion: 0.15
Nodes (25): FundsPage(), aumText(), count, FundDetail(), FundHoldingRow, FundRow, FundsList(), HoldingsSummary() (+17 more)

### Community 35 - "server-only"
Cohesion: 0.22
Nodes (9): server-only, TradePage(), TerminalLeveragedPosition, TerminalOrder, TerminalPosition, adminEditLeveragedPositionAction(), FALLBACK, getLeverageConfig() (+1 more)

### Community 36 - "getCurrentUser"
Cohesion: 0.09
Nodes (44): GET(), maskTail(), parseFxMetadata(), WalletPage(), TermDepositPage(), COPY, CurrencyConvertCard(), Direction (+36 more)

### Community 37 - "Link"
Cohesion: 0.15
Nodes (27): HomePage(), PortfolioPage(), HomeBanners(), HomeIpoBanner(), MobileInstallAction(), PortfolioHero(), ACTIONS, QuickActions() (+19 more)

### Community 38 - "[id]/page.tsx"
Cohesion: 0.11
Nodes (25): KYC_TONE, num, qty, SIDE_LABEL, RevealSecretButton(), RevealSecretResult, adminCloseLeveragedPositionAction(), adjustSchema (+17 more)

### Community 39 - "HomeCategoryList.tsx"
Cohesion: 0.21
Nodes (12): AdminDashboardPage(), BalanceStat(), getPlatformBalances(), num, CATEGORY_TYPES, HomeCategoryList(), CATEGORY_TABS, CategoryKey (+4 more)

### Community 40 - "session.ts"
Cohesion: 0.27
Nodes (10): sessionBadge(), BIST_SESSION, hasSession(), hhmm(), isAssetSessionOpen(), NYSE_SESSION, offsetMinutes(), Session (+2 more)

### Community 41 - "auth/actions.ts"
Cohesion: 0.40
Nodes (8): logoutAction(), registerAction(), signIn, signOut, hashTcKimlik(), isValidTcKimlik(), normalizePhone(), findUserByIdentifier()

### Community 42 - "@prisma/client"
Cohesion: 0.26
Nodes (12): @prisma/client, loadRows(), loadStockRows(), MarketsPage(), POPULAR_ORDER, popularRank(), resolveAssetPrice(), ResolvedPrice (+4 more)

### Community 43 - "AssetDetailPage.tsx"
Cohesion: 0.18
Nodes (13): GoldAssetPage(), BorsaAssetPage(), FxAssetPage(), CryptoAssetPage(), NasdaqAssetPage(), AssetDetailPage(), AssetDetailPageProps, Cell() (+5 more)

### Community 45 - "DataStatusBadge.tsx"
Cohesion: 0.29
Nodes (5): Badge(), BadgeProps, Tone, TONE_STYLES, TONE

### Community 46 - "Quote"
Cohesion: 0.26
Nodes (5): BASE_INTERVAL, BinanceProvider, Kline, Ticker24h, Quote

### Community 47 - "cn"
Cohesion: 0.08
Nodes (34): lucide-react, motion, react, react-dom, InvitePage(), Stat(), STEPS, TIERS (+26 more)

### Community 48 - "NewsList.tsx"
Cohesion: 0.26
Nodes (10): NewsPage(), CATEGORY_TILE, NewsList(), NewsThumbnail(), TABS, getNewsFeed(), NewsItem, relativeTime() (+2 more)

### Community 49 - "campaign-actions.ts"
Cohesion: 0.22
Nodes (7): campaignSchema, deleteCampaignAction(), saveCampaignAction(), slugify(), toggleCampaignAction(), ensureReferralCode(), randomCode()

### Community 50 - "navigation.ts"
Cohesion: 0.05
Nodes (54): nextConfig, withNextIntl, next-intl, @tanstack/react-query, AdminLayout(), AppLayout(), GoldMarketPage(), BistMarketPage() (+46 more)

### Community 51 - "decimal.ts"
Cohesion: 0.50
Nodes (3): decimal.js, profitLoss(), toDecimal()

### Community 53 - "TradeTerminal.tsx"
Cohesion: 0.12
Nodes (29): PickerAsset, Empty(), fmtMoney(), money, pfmt(), priceFmt, SummaryRow(), TabButton() (+21 more)

### Community 57 - "MarketsExplorer.tsx"
Cohesion: 0.15
Nodes (18): recharts, CARD_SYMBOLS, formatCardPrice(), MarketCards(), AssetRowData, AssetClass, currentMinute(), MarketsExplorer() (+10 more)

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
- **372 isolated node(s):** `eslintConfig`, `withNextIntl`, `nextConfig`, `name`, `version` (+367 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 410 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js` and `This is NOT the Next.js you know (agent rules block)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `cn()` connect `cn` to `LoginForm.tsx`, `IpoList.tsx`, `FundsList.tsx`, `pozisyonlar/page.tsx`, `getCurrentUser`, `Link`, `AssetDetailPage.tsx`, `AssetIcon`, `profil/page.tsx`, `DataStatusBadge.tsx`, `NewsList.tsx`, `navigation.ts`, `WalletFlow.tsx`, `TradeTerminal.tsx`, `WalletHistory.tsx`, `MarketsExplorer.tsx`, `WalletView.tsx`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `withNextIntl`, `nextConfig` to the rest of the system?**
  _372 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `feed-actions.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10052910052910052 - nodes in this community are weakly interconnected._
- **Why does `prisma` connect `client.ts` to `IpoList.tsx`, `feed-actions.ts`, `pozisyonlar/page.tsx`, `writeAuditLog`, `auth.ts`, `engine.ts`, `profil/page.tsx`, `zod`, `WalletFlow.tsx`, `requireAdmin`, `leverage-engine.ts`, `manual-simulation.ts`, `FundsList.tsx`, `server-only`, `getCurrentUser`, `Link`, `[id]/page.tsx`, `HomeCategoryList.tsx`, `auth/actions.ts`, `@prisma/client`, `AssetDetailPage.tsx`, `cn`, `NewsList.tsx`, `campaign-actions.ts`, `navigation.ts`, `TradeTerminal.tsx`, `MarketsExplorer.tsx`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Should `pozisyonlar/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.058890030832476875 - nodes in this community are weakly interconnected._
- **Why does `react` connect `cn` to `LoginForm.tsx`, `IpoList.tsx`, `pozisyonlar/page.tsx`, `package.json`, `AssetIcon`, `profil/page.tsx`, `WalletFlow.tsx`, `WalletHistory.tsx`, `WalletView.tsx`, `FundsList.tsx`, `getCurrentUser`, `Link`, `[id]/page.tsx`, `HomeCategoryList.tsx`, `DataStatusBadge.tsx`, `NewsList.tsx`, `navigation.ts`, `TradeTerminal.tsx`, `MarketsExplorer.tsx`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._