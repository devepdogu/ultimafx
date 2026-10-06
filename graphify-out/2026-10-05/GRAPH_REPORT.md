# Graph Report - ultima  (2026-10-05)

## Corpus Check
- 154 files · ~165,196 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 2, .ico 2, .toml 1)

## Summary
- 700 nodes · 1946 edges · 32 communities (23 shown, 9 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `63dc5680`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cn
- content-actions.ts
- Card
- engine.ts
- market-data-refresh.worker.ts
- truncgil-provider.ts
- types/index.ts
- auth/actions.ts
- UnimplementedProviderBase
- dependencies
- tcmb-provider.ts
- compilerOptions
- package.json
- Quote
- [locale]/layout.tsx
- AssetDetailPage.tsx
- odulller/page.tsx
- MarketDataProvider
- TCMBProvider
- MarketCards.tsx
- WalletTransaction (source of truth rows)
- devDependencies
- registry.ts
- This is NOT the Next.js you know (agent rules block)
- scripts
- UnconfiguredProvider
- eslint.config.mjs
- prisma.config.ts
- postcss.config.mjs
- DataProvenance (LIVE/DELAYED/MANUAL_OVERRIDE/CACHED/UNAVAILABLE)
- { GET, POST }

## God Nodes (most connected - your core abstractions)
1. `Card()` - 50 edges
2. `next-intl` - 43 edges
3. `cn()` - 41 edges
4. `prisma` - 36 edges
5. `Link` - 33 edges
6. `lucide-react` - 28 edges
7. `react` - 28 edges
8. `getCurrentUser()` - 28 edges
9. `UnimplementedProviderBase` - 26 edges
10. `formatPrice()` - 26 edges

## Surprising Connections (you probably didn't know these)
- `TradeSheet()` --indirect_call--> `placeMarketOrderAction()`  [INFERRED]
  src/components/trading/TradeSheet.tsx → src/lib/trading/actions.ts
- `This is NOT the Next.js you know (agent rules block)` --conceptually_related_to--> `Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js`  [AMBIGUOUS]
  AGENTS.md → README.md
- `graphify skill reference (.claude/CLAUDE.md)` --references--> `graphify usage rules (root CLAUDE.md)`  [EXTRACTED]
  .claude/CLAUDE.md → CLAUDE.md
- `WalletPage()` --calls--> `DepositRequestForm()`  [EXTRACTED]
  src/app/[locale]/(app)/cuzdan/page.tsx → src/components/wallet/DepositRequestForm.tsx
- `WalletPage()` --calls--> `WithdrawalRequestForm()`  [EXTRACTED]
  src/app/[locale]/(app)/cuzdan/page.tsx → src/components/wallet/WithdrawalRequestForm.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Agent governance documentation chain (CLAUDE.md/.claude/CLAUDE.md/AGENTS.md)** — claude_claude_graphify, claude_graphify_rules, agents_nextjs_agent_rules [EXTRACTED 0.90]
- **Market data provenance and caching flow** — readme_no_fabricated_market_data, readme_data_provenance, readme_market_data_in_redis, src_lib_market_data_marketdataprovider, src_lib_market_data_cached_provider_cachedprovider, docker_compose_redis [INFERRED 0.80]
- **Wallet ledger integrity and trading settlement** — readme_trading_internal, src_lib_trading_engine_tradingengine, readme_wallet_ledger, readme_wallettransaction, readme_wallet_cashbalance [INFERRED 0.85]

## Communities (32 total, 9 thin omitted)

### Community 0 - "cn"
Cohesion: 0.05
Nodes (54): react, @tanstack/react-query, FundsPage(), AppLayout(), PromoCarousel(), PromoSlide, compactTry, count (+46 more)

### Community 1 - "content-actions.ts"
Cohesion: 0.07
Nodes (52): server-only, zod, AssetCreateForm(), BannerCreateForm(), FormResult(), FundCreateForm(), initial, NewsCreateForm() (+44 more)

### Community 2 - "Card"
Cohesion: 0.09
Nodes (61): lucide-react, next-intl, recharts, AdminBannersPage(), AdminFundsPage(), AdminNewsPage(), AdminDashboardPage(), SECTIONS (+53 more)

### Community 3 - "engine.ts"
Cohesion: 0.10
Nodes (33): decimal.js, motion, @prisma/client, initialState, TradeSheetProps, resolveAssetPrice(), ResolvedPrice, DataProvenance (+25 more)

### Community 4 - "market-data-refresh.worker.ts"
Cohesion: 0.16
Nodes (15): bullmq, ioredis, cacheAside(), readCache(), writeCacheForever(), globalForRedis, redis, withCache() (+7 more)

### Community 5 - "truncgil-provider.ts"
Cohesion: 0.20
Nodes (6): CachedSnapshot, SYMBOL_MAP, TruncgilProviderConfig, TruncgilResponse, TruncgilRow, MarketSummary

### Community 6 - "types/index.ts"
Cohesion: 0.17
Nodes (10): CacheOptions, AssetRef, AssetType, IndexValue, MarketStatus, NewsItem, OrderBook, OrderBookLevel (+2 more)

### Community 7 - "auth/actions.ts"
Cohesion: 0.08
Nodes (31): PERMISSIONS, prisma, ROLES, bcryptjs, next-auth, LoginPage(), RegisterPage(), initialState (+23 more)

### Community 8 - "UnimplementedProviderBase"
Cohesion: 0.11
Nodes (10): ProviderNotConfiguredError, BorsaIstanbulProvider, BorsaIstanbulProviderConfig, CryptoProvider, CryptoProviderConfig, ForeksProvider, ForeksProviderConfig, KAPProvider (+2 more)

### Community 9 - "dependencies"
Cohesion: 0.09
Nodes (23): dependencies, @auth/prisma-adapter, bcryptjs, bullmq, clsx, date-fns, decimal.js, fast-xml-parser (+15 more)

### Community 10 - "tcmb-provider.ts"
Cohesion: 0.22
Nodes (5): CachedRates, Rate, TCMBCurrencyRow, TCMBProviderConfig, AssetMeta

### Community 11 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 12 - "package.json"
Cohesion: 0.11
Nodes (18): name, private, version, @auth/prisma-adapter, clsx, date-fns, fast-xml-parser, flag-icons (+10 more)

### Community 14 - "[locale]/layout.tsx"
Cohesion: 0.18
Nodes (8): geistMono, metadata, plexSans, AppLocale, defaultLocale, locales, routing, config

### Community 15 - "AssetDetailPage.tsx"
Cohesion: 0.12
Nodes (19): nextConfig, withNextIntl, next, GoldAssetPage(), BorsaAssetPage(), FxAssetPage(), NasdaqAssetPage(), AssetDetailPage() (+11 more)

### Community 16 - "odulller/page.tsx"
Cohesion: 0.36
Nodes (6): RewardsPage(), ShareInvite(), share(), ensureReferralCode(), getReferralStats(), randomCode()

### Community 19 - "MarketCards.tsx"
Cohesion: 0.07
Nodes (45): GET(), loadRows(), loadStockRows(), MarketsPage(), POPULAR_ORDER, popularRank(), CATEGORY_TYPES, HomeCategoryList() (+37 more)

### Community 20 - "WalletTransaction (source of truth rows)"
Cohesion: 0.20
Nodes (7): postgres service (postgres:17-alpine, port 5434), redis service (redis:7-alpine, port 6380), Wallet.cashBalance (projection field), WalletTransaction (source of truth rows), cached-provider.ts (cache-aside wrapper), MarketDataProvider, trading/engine.ts (order settlement engine)

### Community 21 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, dotenv, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/postcss, tsx (+5 more)

### Community 22 - "registry.ts"
Cohesion: 0.21
Nodes (5): YahooFinanceBistProvider, YahooFinanceProvider, YahooFinanceUsProvider, marketDataRegistry, yahooBist

### Community 23 - "This is NOT the Next.js you know (agent rules block)"
Cohesion: 0.40
Nodes (3): graphify skill reference (.claude/CLAUDE.md), Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js, Ultima platform overview

### Community 24 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, db:generate, db:migrate, db:seed, db:studio, dev, lint (+3 more)

### Community 26 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

## Ambiguous Edges - Review These
- `Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js` → `This is NOT the Next.js you know (agent rules block)`  [AMBIGUOUS]
  AGENTS.md · relation: conceptually_related_to

## Knowledge Gaps
- **193 isolated node(s):** `eslintConfig`, `withNextIntl`, `nextConfig`, `name`, `version` (+188 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 225 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Stack: Next.js 16, React 19, Prisma, PostgreSQL, Redis, BullMQ, next-intl, Auth.js` and `This is NOT the Next.js you know (agent rules block)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `next-intl` connect `Card` to `cn`, `content-actions.ts`, `engine.ts`, `package.json`, `[locale]/layout.tsx`, `AssetDetailPage.tsx`, `MarketCards.tsx`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `withNextIntl`, `nextConfig` to the rest of the system?**
  _193 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.05258033106134372 - nodes in this community are weakly interconnected._
- **Why does `react` connect `cn` to `content-actions.ts`, `Card`, `engine.ts`, `auth/actions.ts`, `package.json`, `AssetDetailPage.tsx`, `odulller/page.tsx`, `MarketCards.tsx`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Should `content-actions.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06971153846153846 - nodes in this community are weakly interconnected._
- **Why does `prisma` connect `Card` to `cn`, `content-actions.ts`, `engine.ts`, `market-data-refresh.worker.ts`, `auth/actions.ts`, `AssetDetailPage.tsx`, `odulller/page.tsx`, `MarketCards.tsx`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._