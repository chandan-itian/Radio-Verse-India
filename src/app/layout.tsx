import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { GlobalPlayer } from "@/components/player/global-player";
import { PwaInstaller } from "@/components/pwa/pwa-installer";

export const metadata: Metadata = {
  title: "RadioVerse India — India's Radio. One Universe.",
  description:
    "Listen to live verified internet radio stations across India. Vividh Bharati, FM Gold, Radio Mirchi, regional folk, devotional, news, and world broadcasts.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-192.svg",
  },
  openGraph: {
    title: "RadioVerse India — India's Radio. One Universe.",
    description: "Live Indian radio stations in one sleek, fast, and accessible web app.",
    url: "https://radioverse.in",
    siteName: "RadioVerse India",
    locale: "en_IN",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0e14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-theme="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body className="bg-[var(--background)] text-[var(--foreground)] min-h-screen flex antialiased">
        <I18nProvider>
          {/* Desktop Left Sidebar */}
          <Suspense fallback={<aside className="hidden md:block w-64 border-r border-[var(--surface-border)] bg-[var(--surface)]" />}>
            <Sidebar />
          </Suspense>

          {/* Main Area */}
          <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-32 md:pb-24">
            <Suspense fallback={<header className="h-14 border-b border-[var(--surface-border)]" />}>
              <Header />
            </Suspense>
            <PwaInstaller />
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
              {children}
            </main>
            <Suspense fallback={null}>
              <MobileNav />
            </Suspense>
          </div>

          {/* Persistent Singleton Audio Player */}
          <GlobalPlayer />
        </I18nProvider>
      </body>
    </html>
  );
}
