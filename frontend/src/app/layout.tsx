import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AnalyticsProvider from "@/components/providers/AnalyticsProvider";
import SentryErrorBoundary from "@/components/providers/SentryErrorBoundary";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CopyCoach AI - Copywriting Coach & Generator",
  description: "AI-powered copywriting assistant and coaching application",
  icons: {
    icon: "/favicon.svg",
    apple: "/images/logo-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AnalyticsProvider>
            <SentryErrorBoundary>{children}</SentryErrorBoundary>
          </AnalyticsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
