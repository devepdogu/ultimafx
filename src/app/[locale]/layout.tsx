import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ToastProvider } from "@/components/ui/Toaster";
import "../globals.css";

// `next/font/google`'s loader for these two fonts fails Next 16's Turbopack
// production build ("next/font/google queries have exactly one entry") while
// working fine under `next dev` — a build/dev discrepancy in this Next
// version, not something in this app's config. Loading them as a plain
// Google Fonts stylesheet instead sidesteps it entirely and still resolves
// to the same CSS variables globals.css expects.
const FONT_VARS = {
  "--font-plex-sans": "'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif",
  "--font-geist-mono": "'Geist Mono', ui-monospace, 'SFMono-Regular', monospace",
} as React.CSSProperties;

export const metadata: Metadata = {
  title: "Ultima FX",
  description:
    "Borsa İstanbul, ABD piyasaları, emtia ve döviz varlıklarını tek platformda keşfedin. Fiyatları, grafikleri ve portföyünüzü takip edin.",
  icons: {
    apple: "/brand/ultima-mark-512.png",
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      className="h-full antialiased"
      style={FONT_VARS}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- this rule is about a
            single Pages-Router page; this is the App Router's root layout for every route. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Geist+Mono&display=swap"
        />
        <script
          // Runs before paint to avoid a light/dark flash on load. Reads the
          // same localStorage key ThemeToggle writes to.
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('ultima-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextIntlClientProvider><ToastProvider>{children}</ToastProvider></NextIntlClientProvider>
      </body>
    </html>
  );
}
