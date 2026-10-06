import { getTranslations } from "next-intl/server";
import { requireUserForPage } from "@/lib/auth/rbac";
import { Card } from "@/components/ui/Card";

export default async function ProfilePage() {
  const t = await getTranslations("nav");
  const user = await requireUserForPage();

  return (
    <div className=" px-4 py-6">
      <h1 className="mb-6 text-xl font-bold">{t("profile")}</h1>
      <Card>
        <p className="text-sm">{user.name ?? user.email}</p>
        <p className="text-sm text-muted">{user.email}</p>
      </Card>
    </div>
  );
}
