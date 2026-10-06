import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";

export default async function FxMarketPage() {
  const locale = await getLocale();
  redirect({ href: "/piyasalar", locale });
}
