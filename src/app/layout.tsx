import type { Metadata } from "next";
import { Geist_Mono, Manrope } from "next/font/google";
import localFont from "next/font/local";
import { headers } from "next/headers";
import "./globals.css";
import { Providers } from "@/components/providers";
import { FacebookPixel } from "@/components/marketing/FacebookPixel";
import { auth } from "@/lib/auth";
import { buildOrganizationJsonLd, buildSocialMetadata, DEFAULT_PUBLIC_DESCRIPTION, getSeoSiteOrigin } from "@/lib/seo/site";
import { getThemeInlineScript } from "@/lib/theme/theme-inline-script";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Host Cormorant locally — next/font/google + Turbopack currently fails the
 * Vercel build when fonts.gstatic returns 404 for baked Cormorant woff2 hashes.
 */
const cormorant = localFont({
  variable: "--font-cormorant",
  display: "swap",
  src: [
    {
      path: "../fonts/cormorant-garamond/CormorantGaramond-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/cormorant-garamond/CormorantGaramond-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/cormorant-garamond/CormorantGaramond-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/cormorant-garamond/CormorantGaramond-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  metadataBase: getSeoSiteOrigin(),
  title: {
    default: "AKILI Risk Intelligence",
    template: "%s | AKILI Risk Intelligence",
  },
  description: DEFAULT_PUBLIC_DESCRIPTION,
  ...buildSocialMetadata({
    title: "AKILI Risk Intelligence",
    description: DEFAULT_PUBLIC_DESCRIPTION,
  }),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const isBrandedTenant = headersList.get("x-branded-mode") === "true";
  const forceTenantLight = headersList.get("x-tenant-force-light") === "true";
  const session = await auth();

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      data-tenant-force-light={forceTenantLight ? "true" : undefined}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: getThemeInlineScript(),
          }}
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#0564b6" />
        <meta name="msapplication-TileColor" content="#0564b6" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildOrganizationJsonLd()),
          }}
        />
      </head>
      <body
        className={`${manrope.variable} ${geistMono.variable} ${cormorant.variable} bg-background text-foreground antialiased`}
        data-branded-mode={isBrandedTenant ? "true" : undefined}
        suppressHydrationWarning
      >
        <Providers session={session}>
          <div className="relative isolate min-h-screen">{children}</div>
        </Providers>
        <FacebookPixel />
      </body>
    </html>
  );
}
