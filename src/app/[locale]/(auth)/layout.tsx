import { getSiteSettings, DEFAULT_SITE_NAME } from "@/lib/site/settings";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const site = await getSiteSettings();
  const logo = site.logoUrl ?? "/brand/ultima-logo.png";

  return (
    <div className="flex min-h-dvh justify-center bg-[#0B0E11]">
      <div className="w-full max-w-[390px] px-6 pb-8 pt-[48px] text-[#BECBDD]">
        <div className="mb-6 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- admin-provided or fixed local brand asset */}
          <img
            src={logo}
            alt={site.siteName}
            width={204}
            height={48}
            className="h-[48px] w-[204px] object-contain"
            style={site.logoUrl ? undefined : { filter: "brightness(0) invert(1)" }}
          />
        </div>
        {site.siteName !== DEFAULT_SITE_NAME && (
          <div className="mb-6 text-center text-[15px] font-bold text-white">{site.siteName}</div>
        )}
        {children}
      </div>
    </div>
  );
}
