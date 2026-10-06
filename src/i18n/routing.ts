import { defineRouting } from "next-intl/routing";

export const locales = ["tr", "en"] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "tr";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
});
