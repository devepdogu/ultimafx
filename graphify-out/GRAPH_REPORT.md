# Graph Report - ultima  (2026-10-21)

## Corpus Check
- 275 files · ~249,083 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 5, .ico 2, .toml 1)

## Summary
- 1313 nodes · 4077 edges · 53 communities (48 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2ce7d98d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- LoginForm.tsx
- IpoList.tsx
- news/sync.ts
- EntityEditors.tsx
- writeAuditLog
- truncgil-provider.ts
- types/index.ts
- auth/actions.ts
- UnimplementedProviderBase
- dependencies
- ContentForms.tsx
- compilerOptions
- package.json
- AssetIcon
- lucide-react
- zod
- profil/page.tsx
- devDependencies
- PriceBar
- cached-provider.ts
- WalletTransaction (source of truth rows)
- WalletFlow.tsx
- registry.ts
- This is NOT the Next.js you know (agent rules block)
- content-actions.ts
- WalletHistory.tsx
- requireAdmin
- postcss.config.mjs
- DataProvenance (LIVE/DELAYED/MANUAL_OVERRIDE/CACHED/UNAVAILABLE)
- WalletView.tsx
- { GET, POST }
- manual-simulation.ts
- scripts
- FundsList.tsx
- TermDepositView.tsx
- formatPrice
- user-actions.ts
- Link
- davet/page.tsx
- @prisma/client
- AssetDetailPage.tsx
- Quote
- cn
- NewsList.tsx
- client.ts
- navigation.ts
- TradeTerminal.tsx
- eslint.config.mjs
- MarketsExplorer.tsx
- MarketSummary
- update.sh
- deploy.sh

## God Nodes (most connected - your core abstractions)
1. `cn()` - 120 edges
2. `requireAdmin()` - 70 edges
3. `prisma` - 70 edges
4. `writeAuditLog()` - 67 edges
5. `Link` - 66 edges
6. `lucide-react` - 58 edges
7. `react` - 56 edges
8. `@prisma/client` - 32 edges
9. `resolveAssetPrice()` - 32 edges
10. `formatPrice()` - 31 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `encryptSecret()`  [EXTRACTED]
  prisma/seed.ts → src/lib/crypto/secret-box.ts
- `LoginForm()` --indirect_call--> `loginAction()`  [INFERRED]
  src/components/auth/LoginForm.tsx → src/lib/auth/actions.ts
- `RegisterForm()` --indirect_call--> `registerAction()`  [INFERRED]
  src/components/auth/RegisterForm.tsx → src/lib/auth/actions.ts
- `TradeSheet()` --indirect_call--> `placeMarketOrderAction()`  [INFERRED]
  src/components/trading/TradeSheet.tsx → src/lib/trading/actions.ts
- `ReceiptProvider` --calls--> `presetFor()`  [EXTRACTED]
  src/components/wallet/WalletFlow.tsx → src/lib/admin/presets.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Agent governance documentation chain (CLAUDE.md/.claude/CLAUDE.md/AGENTS.md)** — claude_claude_graphify, claude_graphify_rules, agents_nextjs_agent_rules [EXTRACTED 0.90]
- **Market data provenance and caching flow** — readme_no_fabricated_market_data, readme_data_provenance, readme_market_data_in_redis, src_lib_market_data_marketdataprovider, src_lib_market_data_cached_provider_cachedprovider, docker_compose_redis [INFERRED 0.80]
- **Wallet ledger integrity and trading settlement** — readme_trading_internal, src_lib_trading_engine_tradingengine, readme_wallet_ledger, readme_wallettransaction, readme_wallet_cashbalance [INFERRED 0.85]

## Communities (53 total, 5 thin omitted)

### Community 0 - "LoginForm.tsx"
Cohesion: 0.20
Nodes (13): LoginPage(), RegisterPage(), LegalModal(), LegalModalProps, initialState, LoginForm(), Mode, ConsentKey (+5 more)

### Community 1 - "IpoList.tsx"
Cohesion: 0.15
Nodes (21): IpoHeader(), IpoListPage(), Card(), compactTry(), dateText(), FOOTER, IpoDrawer(), IpoList() (+13 more)

### Community 2 - "news/sync.ts"
Cohesion: 0.17
Nodes (11): fast-xml-parser, categorize(), IncomingArticle, JSON_CATEGORY, jsonSchema, NewsSyncResult, readJsonNews(), readRssNews() (+3 more)

### Community 3 - "EntityEditors.tsx"
Cohesion: 0.06
Nodes (96): AdminBankAccountsPage(), AdminBannersPage(), AdminFundsPage(), AdminNewsPage(), AdminIposPage(), STATUS, AdminCampaignsPage(), AdminCryptoAddressesPage() (+88 more)

### Community 4 - "writeAuditLog"
Cohesion: 0.12
Nodes (29): assetSchema, bankSchema, BIST_TYPES, CATEGORIES, cryptoSchema, deleteAssetAction(), deleteBankAction(), deleteCryptoAction() (+21 more)

### Community 5 - "truncgil-provider.ts"
Cohesion: 0.13
Nodes (7): CachedSnapshot, SYMBOL_MAP, TruncgilProvider, TruncgilProviderConfig, TruncgilResponse, TruncgilRow, AssetMeta

### Community 6 - "types/index.ts"
Cohesion: 0.12
Nodes (10): MarketDataProvider, MarketDataProviderRegistry, AssetRef, AssetType, CorporateActionEvent, IndexValue, MarketStatus, NewsItem (+2 more)

### Community 7 - "auth/actions.ts"
Cohesion: 0.07
Nodes (38): CAMPAIGNS, INVESTMENT_FUNDS, main(), PERMISSIONS, prisma, ROLES, seedCampaigns(), seedInvestmentFunds() (+30 more)

### Community 8 - "UnimplementedProviderBase"
Cohesion: 0.10
Nodes (10): ProviderNotConfiguredError, BorsaIstanbulProvider, BorsaIstanbulProviderConfig, CryptoProvider, CryptoProviderConfig, ForeksProvider, ForeksProviderConfig, KAPProvider (+2 more)

### Community 9 - "dependencies"
Cohesion: 0.09
Nodes (23): dependencies, @auth/prisma-adapter, bcryptjs, bullmq, clsx, date-fns, decimal.js, fast-xml-parser (+15 more)

### Community 10 - "ContentForms.tsx"
Cohesion: 0.15
Nodes (14): ASSET_TYPES, CRYPTO_NETWORKS, IPO_STATUSES, NEWS_CATEGORIES, createBankAccountAction(), schema, toggleBankAccountAction(), AdminActionResult (+6 more)

### Community 11 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 12 - "package.json"
Cohesion: 0.11
Nodes (18): name, private, version, @auth/prisma-adapter, clsx, date-fns, dotenv, flag-icons (+10 more)

### Community 13 - "AssetIcon"
Cohesion: 0.19
Nodes (16): AssetIcon(), AssetIconProps, FLAG_CODES, hashColor(), MONOGRAM_PALETTE, tradingViewLogo(), TV_COUNTRY, AssetPickerProps (+8 more)

### Community 14 - "lucide-react"
Cohesion: 0.12
Nodes (27): lucide-react, motion, react-dom, SettingsPage(), IOS_STEPS, MobileInstallAction(), ACTIONS, getServerSnapshot() (+19 more)

### Community 15 - "zod"
Cohesion: 0.17
Nodes (13): zod, createIpoAction(), ipoSchema, refreshIposAction(), refreshNewsAction(), toggleIpoPublishedAction(), ipoListSchema, IpoSyncResult (+5 more)

### Community 16 - "profil/page.tsx"
Cohesion: 0.17
Nodes (17): Panel(), ProfilePage(), Stat(), KycDocMeta, KycSlot(), KycUploader(), SIDES, Field() (+9 more)

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
Cohesion: 0.05
Nodes (52): WithdrawPage(), DepositPage(), RewardsPage(), initialState, ReviewRequestFormProps, ShareInvite(), share(), CampaignCard() (+44 more)

### Community 22 - "registry.ts"
Cohesion: 0.17
Nodes (6): CommodityProvider, YAHOO_COMMODITY, YahooFinanceBistProvider, YahooFinanceProvider, YahooFinanceUsProvider, yahooBist

### Community 23 - "This is NOT the Next.js you know (agent rules block)"
Cohesion: 0.40
Nodes (3): graphify skill reference (.claude/CLAUDE.md), Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js, Ultima platform overview

### Community 24 - "content-actions.ts"
Cohesion: 0.15
Nodes (11): assetSchema, bannerSchema, createBannerAction(), createInvestmentFundAction(), createNewsArticleAction(), fundSchema, newsSchema, optionalUrl (+3 more)

### Community 25 - "WalletHistory.tsx"
Cohesion: 0.17
Nodes (21): Bubble(), Card(), CardHeader(), CASH_TITLES, CashRow(), Cell(), dayFmt, dayKey() (+13 more)

### Community 26 - "requireAdmin"
Cohesion: 0.17
Nodes (18): next, bannerSchema, deleteBannerAction(), optionalUrl, saveBannerAction(), createCryptoAddressAction(), schema, toggleCryptoAddressAction() (+10 more)

### Community 30 - "WalletView.tsx"
Cohesion: 0.13
Nodes (25): maskTail(), parseFxMetadata(), WalletPage(), BalanceCard(), tryFmt, usdtFmt, CurrencyFlag(), FxDetails (+17 more)

### Community 32 - "manual-simulation.ts"
Cohesion: 0.10
Nodes (30): bullmq, GET(), CHART_PERIODS, ChartPeriod, getAssetHistory(), isChartPeriod(), patchLastBarToPrice(), PERIOD_DAYS (+22 more)

### Community 33 - "scripts"
Cohesion: 0.15
Nodes (13): scripts, build, db:deploy, db:generate, db:migrate, db:seed, db:studio, dev (+5 more)

### Community 34 - "FundsList.tsx"
Cohesion: 0.15
Nodes (25): FundsPage(), aumText(), count, FundDetail(), FundHoldingRow, FundRow, FundsList(), HoldingsSummary() (+17 more)

### Community 36 - "TermDepositView.tsx"
Cohesion: 0.10
Nodes (38): TermDepositPage(), COPY, CurrencyConvertCard(), Direction, initial, money, AccountList(), dateFmt (+30 more)

### Community 37 - "formatPrice"
Cohesion: 0.20
Nodes (18): PortfolioPage(), PortfolioHero(), WatchlistCard(), WatchlistSection(), AllocationDonut(), HoldingLink(), HoldingsList(), Card() (+10 more)

### Community 38 - "user-actions.ts"
Cohesion: 0.15
Nodes (16): adjustSchema, adjustUserBalanceAction(), adminOrderSchema, adminPlaceMarketOrderAction(), holdingSchema, newPasswordSchema, revealUserPasswordAction(), revealUserTcKimlikAction() (+8 more)

### Community 39 - "Link"
Cohesion: 0.17
Nodes (17): recharts, HomePage(), HomeBanners(), HomeCategoryList(), HomeIpoBanner(), CARD_SYMBOLS, formatCardPrice(), MarketCards() (+9 more)

### Community 40 - "davet/page.tsx"
Cohesion: 0.26
Nodes (9): InvitePage(), Stat(), STEPS, TIERS, InviteProgram(), copy(), share(), ensureReferralCode() (+1 more)

### Community 42 - "@prisma/client"
Cohesion: 0.23
Nodes (12): @prisma/client, AdminDashboardPage(), BalanceStat(), getPlatformBalances(), num, resolveAssetPrices(), worker(), ResolvedPrice (+4 more)

### Community 43 - "AssetDetailPage.tsx"
Cohesion: 0.19
Nodes (13): GoldAssetPage(), BorsaAssetPage(), FxAssetPage(), CryptoAssetPage(), NasdaqAssetPage(), AssetDetailPage(), AssetDetailPageProps, Cell() (+5 more)

### Community 46 - "Quote"
Cohesion: 0.26
Nodes (5): BASE_INTERVAL, BinanceProvider, Kline, Ticker24h, Quote

### Community 47 - "cn"
Cohesion: 0.11
Nodes (20): react, PromoCarousel(), PromoSlide, ChartKind, PERIODS, PriceChart(), PriceChartProps, readThemeColors() (+12 more)

### Community 48 - "NewsList.tsx"
Cohesion: 0.26
Nodes (10): NewsPage(), CATEGORY_TILE, NewsList(), NewsThumbnail(), TABS, getNewsFeed(), NewsItem, relativeTime() (+2 more)

### Community 49 - "client.ts"
Cohesion: 0.16
Nodes (15): STATUS_LABEL, campaignSchema, deleteCampaignAction(), saveCampaignAction(), slugify(), toggleCampaignAction(), toggleInvestmentFundAction(), deleteFundAction() (+7 more)

### Community 50 - "navigation.ts"
Cohesion: 0.05
Nodes (51): nextConfig, withNextIntl, next-intl, @tanstack/react-query, GET(), AdminLayout(), AppLayout(), GoldMarketPage() (+43 more)

### Community 53 - "TradeTerminal.tsx"
Cohesion: 0.06
Nodes (81): decimal.js, server-only, TradePage(), sessionBadge(), AssetPicker(), PickerAsset, Empty(), fmtMoney() (+73 more)

### Community 54 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 57 - "MarketsExplorer.tsx"
Cohesion: 0.13
Nodes (23): loadRows(), loadStockRows(), MarketsPage(), POPULAR_ORDER, popularRank(), CATEGORY_TYPES, CATEGORY_TABS, CategoryKey (+15 more)

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
- **359 isolated node(s):** `eslintConfig`, `withNextIntl`, `nextConfig`, `name`, `version` (+354 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 396 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js` and `This is NOT the Next.js you know (agent rules block)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `cn()` connect `cn` to `LoginForm.tsx`, `IpoList.tsx`, `EntityEditors.tsx`, `AssetIcon`, `lucide-react`, `profil/page.tsx`, `WalletFlow.tsx`, `WalletHistory.tsx`, `WalletView.tsx`, `FundsList.tsx`, `TermDepositView.tsx`, `formatPrice`, `Link`, `davet/page.tsx`, `AssetDetailPage.tsx`, `NewsList.tsx`, `navigation.ts`, `TradeTerminal.tsx`, `MarketsExplorer.tsx`?**
  _High betweenness centrality (0.120) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `withNextIntl`, `nextConfig` to the rest of the system?**
  _359 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `EntityEditors.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.062253937007874016 - nodes in this community are weakly interconnected._
- **Why does `react` connect `cn` to `LoginForm.tsx`, `IpoList.tsx`, `EntityEditors.tsx`, `ContentForms.tsx`, `package.json`, `AssetIcon`, `lucide-react`, `profil/page.tsx`, `WalletFlow.tsx`, `WalletHistory.tsx`, `WalletView.tsx`, `FundsList.tsx`, `TermDepositView.tsx`, `formatPrice`, `Link`, `AssetDetailPage.tsx`, `NewsList.tsx`, `navigation.ts`, `TradeTerminal.tsx`, `MarketsExplorer.tsx`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Should `writeAuditLog` be split into smaller, more focused modules?**
  _Cohesion score 0.11827956989247312 - nodes in this community are weakly interconnected._
- **Why does `prisma` connect `client.ts` to `IpoList.tsx`, `news/sync.ts`, `EntityEditors.tsx`, `writeAuditLog`, `auth/actions.ts`, `ContentForms.tsx`, `zod`, `profil/page.tsx`, `WalletFlow.tsx`, `content-actions.ts`, `requireAdmin`, `WalletView.tsx`, `manual-simulation.ts`, `FundsList.tsx`, `TermDepositView.tsx`, `formatPrice`, `user-actions.ts`, `Link`, `davet/page.tsx`, `@prisma/client`, `AssetDetailPage.tsx`, `cn`, `NewsList.tsx`, `navigation.ts`, `TradeTerminal.tsx`, `MarketsExplorer.tsx`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._