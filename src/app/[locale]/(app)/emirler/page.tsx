import { getTranslations } from "next-intl/server";
import { requireUserForPage } from "@/lib/auth/rbac";
import { Card } from "@/components/ui/Card";

export default async function OrdersPage() {
  const t = await getTranslations("nav");
  await requireUserForPage();

  return (
    <div className=" px-4 py-6">
      <h1 className="mb-6 text-xl font-bold">{t("orders")}</h1>
      <Card>
        <p className="text-sm text-muted">Henüz emir bulunmuyor.</p>
      </Card>
    </div>
  );
}
