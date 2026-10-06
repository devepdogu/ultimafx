import { requireUserForPage } from "@/lib/auth/rbac";
import { loadWalletFlowData } from "@/lib/wallet/load";
import { WalletFlow } from "@/components/wallet/WalletFlow";

export default async function WithdrawPage() {
  const user = await requireUserForPage();
  const data = await loadWalletFlowData(user.id);
  return <WalletFlow mode="withdraw" {...data} />;
}
