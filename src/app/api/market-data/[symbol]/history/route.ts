import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getAssetHistory, isChartPeriod } from "@/lib/market-data/get-history";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const periodParam = request.nextUrl.searchParams.get("period") ?? "1m";
  if (!isChartPeriod(periodParam)) {
    return NextResponse.json({ error: "INVALID_PERIOD" }, { status: 400 });
  }

  const asset = await prisma.asset.findUnique({ where: { symbol: symbol.toUpperCase() } });
  if (!asset) {
    return NextResponse.json({ error: "ASSET_NOT_FOUND" }, { status: 404 });
  }

  const bars = await getAssetHistory(asset, periodParam);
  return NextResponse.json({ bars });
}
