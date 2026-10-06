import { AssetDetailPage } from "@/components/market/AssetDetailPage";

export default async function NasdaqAssetPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  return <AssetDetailPage symbol={symbol} assetTypes={["US_STOCK"]} />;
}
