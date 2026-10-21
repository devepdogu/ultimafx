import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/rbac";
import { resolveAssetPrice } from "@/lib/market-data/resolve-price";
import type { PickerAsset } from "@/components/trading/AssetPicker";
import { TradeTerminal, type TerminalLeveragedPosition, type TerminalOrder, type TerminalPosition } from "@/components/trading/TradeTerminal";

const DEFAULT_SYMBOL = "THYAO";

export default async function TradePage({
  searchParams,
}: {
  searchParams: Promise<{ symbol?: string; side?: string }>;
}) {
  const { symbol, side } = await searchParams;
  const initialSide = side?.toUpperCase() === "SELL" ? "SELL" : "BUY";
  const user = await getCurrentUser();

  const pickerRows = await prisma.asset.findMany({
    where: { isActive: true, visibility: "PUBLIC" },
    select: { id: true, symbol: true, name: true, type: true, logoUrl: true, currency: true, decimalPrecision: true, tradingEnabled: true },
    orderBy: { symbol: "asc" },
  });
  const requested = symbol?.trim().toUpperCase();
  const target =
    pickerRows.find((r) => r.symbol === requested) ??
    pickerRows.find((r) => r.symbol === DEFAULT_SYMBOL) ??
    pickerRows[0];

  if (!target) {
    return <p className="px-4 py-8 text-center text-sm text-muted">İşlem yapılabilecek varlık bulunmuyor.</p>;
  }

  const asset = await prisma.asset.findUniqueOrThrow({ where: { id: target.id } });
  const resolved = await resolveAssetPrice(asset);

  let cashBalance = 0;
  let usdBalance = 0;
  let heldQuantity = 0;
  let positions: TerminalPosition[] = [];
  let orders: TerminalOrder[] = [];
  let leveragedPositions: TerminalLeveragedPosition[] = [];

  if (user) {
    const [wallet, portfolio, userOrders, openLeveraged] = await Promise.all([
      prisma.wallet.findUnique({ where: { userId: user.id } }),
      prisma.portfolio.findUnique({
        where: { userId: user.id },
        include: { holdings: { include: { asset: true } } },
      }),
      prisma.order.findMany({
        where: { userId: user.id },
        include: { asset: true },
        orderBy: { placedAt: "desc" },
        take: 50,
      }),
      prisma.leveragedPosition.findMany({
        where: { userId: user.id, status: "OPEN" },
        include: { asset: true },
        orderBy: { openedAt: "desc" },
      }),
    ]);
    cashBalance = wallet ? Number(wallet.cashBalance) : 0;
    usdBalance = wallet ? Number(wallet.usdBalance) : 0;
    const holdings = (portfolio?.holdings ?? []).filter((h) => Number(h.quantity) > 0);
    heldQuantity = Number(holdings.find((h) => h.assetId === asset.id)?.quantity ?? 0);

    positions = await Promise.all(
      holdings.map(async (h) => {
        const price = h.assetId === asset.id ? resolved.price : (await resolveAssetPrice(h.asset)).price;
        const qty = Number(h.quantity);
        return {
          id: h.id,
          assetId: h.assetId,
          symbol: h.asset.symbol,
          type: h.asset.type,
          logoUrl: h.asset.logoUrl,
          currency: h.asset.currency,
          quantity: qty,
          averageCost: Number(h.averageCost),
          currentPrice: price,
          marketValue: price != null ? price * qty : null,
        };
      })
    );

    orders = userOrders.map((o) => ({
      id: o.id,
      symbol: o.asset.symbol,
      side: o.side,
      type: o.type,
      quantity: Number(o.quantity),
      limitPrice: o.limitPrice != null ? Number(o.limitPrice) : null,
      status: o.status,
    }));

    leveragedPositions = await Promise.all(
      openLeveraged.map(async (p) => {
        const currentPrice = p.assetId === asset.id ? resolved.price : (await resolveAssetPrice(p.asset)).price;
        const entryPrice = Number(p.entryPrice);
        const quantity = Number(p.quantity);
        const contractSize = Number(p.contractSize);
        const pnl =
          currentPrice != null
            ? (p.side === "BUY" ? currentPrice - entryPrice : entryPrice - currentPrice) * quantity * contractSize
            : null;
        return {
          id: p.id,
          assetId: p.assetId,
          symbol: p.asset.symbol,
          type: p.asset.type,
          logoUrl: p.asset.logoUrl,
          currency: p.currency,
          side: p.side,
          quantity,
          entryPrice,
          leverage: p.leverage,
          margin: Number(p.margin),
          currentPrice,
          pnl,
        };
      })
    );
  }

  const pickerAssets: PickerAsset[] = pickerRows.map((r) => ({
    symbol: r.symbol,
    name: r.name,
    type: r.type,
    logoUrl: r.logoUrl,
  }));

  return (
    <TradeTerminal
      initialSide={initialSide}
      asset={{
        id: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        type: asset.type,
        currency: asset.currency,
        logoUrl: asset.logoUrl,
        decimalPrecision: asset.decimalPrecision,
        tradingEnabled: asset.tradingEnabled,
      }}
      price={resolved.price}
      bid={resolved.bid}
      ask={resolved.ask}
      changePercent={resolved.changePercent}
      // Each asset trades from the balance in its own currency: USD assets use the USD balance.
      cashBalance={asset.currency === "USD" ? usdBalance : cashBalance}
      balanceCurrency={asset.currency === "USD" ? "USD" : "TRY"}
      heldQuantity={heldQuantity}
      positions={positions}
      leveragedPositions={leveragedPositions}
      orders={orders}
      loggedIn={!!user}
      pickerAssets={pickerAssets}
    />
  );
}
