import { AssetDetailPage } from "@/components/market/AssetDetailPage";

export default async function CryptoAssetPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  return <AssetDetailPage symbol={symbol} assetTypes={["CRYPTO"]} />;
}
