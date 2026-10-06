import { prisma } from "@/lib/prisma/client";

export const DEFAULT_SITE_NAME = "Ultima FX";

export interface SiteSettingsView {
  siteName: string;
  logoUrl: string | null;
}

/** Single-row site branding. Created on first read so the app always has a value. */
export async function getSiteSettings(): Promise<SiteSettingsView> {
  const row = await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", siteName: DEFAULT_SITE_NAME },
  });
  return { siteName: row.siteName, logoUrl: row.logoUrl };
}
