import { requireUserForPage } from "@/lib/auth/rbac";
import { loadWalletFlowData } from "@/lib/wallet/load";
import { WalletFlow } from "@/components/wallet/WalletFlow";

export default async function DepositPage() {
  const user = await requireUserForPage();
  const data = await loadWalletFlowData(user.id);
  return <WalletFlow mode="deposit" {...data} />;
}
