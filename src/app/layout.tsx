import type { Metadata } from "next";
import Link from "next/link";
import { Cormorant_Garamond, Geist_Mono, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { BelvedereLogoLockup } from "@/components/home/BelvedereLogoLockup";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Belvedere Risk Management",
  description: "Family Governance Risk Assessment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${manrope.variable} ${geistMono.variable} ${cormorant.variable} bg-background text-foreground antialiased`}
      >
        <Providers>
          <div className="relative isolate min-h-screen">
            <Link
              href="/"
              className="pointer-events-auto fixed right-6 top-6 z-50 flex justify-end text-foreground md:right-8 md:top-8 lg:right-10 lg:top-10"
              aria-label="Belvedere home"
            >
              <BelvedereLogoLockup className="h-auto w-full max-w-[200px] md:max-w-[240px] lg:max-w-[280px]" />
            </Link>
            <div className="min-h-screen pr-0 sm:pr-[220px] md:pr-[260px] lg:pr-[300px]">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
