import { AssetDetailPage } from "@/components/market/AssetDetailPage";

export default async function GoldAssetPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  return <AssetDetailPage symbol={symbol} assetTypes={["COMMODITY"]} />;
}
