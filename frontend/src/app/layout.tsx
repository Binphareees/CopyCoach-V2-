import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import AnalyticsProvider from "@/components/providers/AnalyticsProvider";
import SentryErrorBoundary from "@/components/providers/SentryErrorBoundary";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { getServerLocale } from "@/i18n/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "CopyCoach AI - Copywriting Coach & Generator",
  description: "AI-powered copywriting assistant and coaching application",
  icons: {
    icon: "/favicon.svg",
    apple: "/images/logo-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { lng, dir } = await getServerLocale();

  return (
    <html
      lang={lng}
      dir={dir}
      className={`${geistSans.variable} ${geistMono.variable} ${notoArabic.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <ThemeProvider>
            <AnalyticsProvider>
              <SentryErrorBoundary>{children}</SentryErrorBoundary>
            </AnalyticsProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
