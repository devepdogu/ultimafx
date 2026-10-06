import "server-only";
import { prisma } from "@/lib/prisma/client";
import { resolveAssetPrice } from "@/lib/market-data/resolve-price";
import { BANK_PRESETS, CRYPTO_NETWORK_PRESETS, presetFor } from "@/lib/admin/presets";

/** Shared data for the deposit and withdrawal wizards. Only active accounts/addresses are returned. */
export async function loadWalletFlowData(userId: string) {
  const [wallet, banks, cryptos, usdAsset] = await Promise.all([
    prisma.wallet.findUnique({ where: { userId } }),
    prisma.bankAccount.findMany({ where: { status: "ACTIVE", currency: "TRY" }, orderBy: { createdAt: "desc" } }),
    prisma.cryptoAddress.findMany({ where: { isActive: true }, orderBy: [{ position: "asc" }, { createdAt: "asc" }] }),
    prisma.asset.findUnique({ where: { symbol: "USDTRY" } }),
  ]);
  const usd = usdAsset ? await resolveAssetPrice(usdAsset) : null;
  return {
    cashBalance: wallet ? Number(wallet.cashBalance) : 0,
    usdBalance: wallet ? Number(wallet.usdBalance) : 0,
    banks: banks.map((b) => {
      const preset = presetFor(BANK_PRESETS, b.bankName);
      return { id: b.id, bankName: preset.label, branch: b.branch, iban: b.iban, accountHolder: b.accountHolder, instructions: b.instructions, logoUrl: b.logoUrl ?? preset.logoUrl ?? null, color: preset.color };
    }),
    cryptos: cryptos.map((c) => {
      const preset = presetFor(CRYPTO_NETWORK_PRESETS, c.network);
      return { id: c.id, asset: c.asset, network: c.network, address: c.address, label: c.label, logoUrl: c.logoUrl ?? preset.logoUrl ?? null, color: preset.color };
    }),
    usdTry: usd?.price ?? null,
  };
}
