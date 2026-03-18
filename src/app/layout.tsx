import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/providers/providers";
import BottomNavbar from "@/components/user/bottom-navbar";
import PWAProvider from "@/components/pwa/pwa-provider";
import CardProvider from "@/components/cards/card-provider";
import { RealtimeProvider } from "@/components/notifications/realtime-provider";
import FirebaseMessagingInit from "@/components/notifications/firebase-messaging-init";
import { FCMInitializer } from "@/components/fcm-init";
import Footer from "@/components/Footer";
import { initializeRealtimeServices } from "@/lib/init-socket";
import PerformanceTracker from "@/components/performance/performance-tracker";
import BetaBanner from "@/components/BetaBanner";

import ScrollToTop from "@/components/scroll-to-top";

// Initialize real-time services
if (typeof window === 'undefined') {
  initializeRealtimeServices();
}

// Optimized font loading with display swap
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: "WhenFresh",
    template: "%s | WhenFresh"
  },
  description: "Find fresh food near you",
  keywords: ["fresh food", "local food", "restaurants", "delivery", "food finder"],
  authors: [{ name: "WhenFresh Team" }],
  creator: "WhenFresh",
  publisher: "WhenFresh",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WhenFresh",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "WhenFresh",
    title: "WhenFresh",
    description: "Find fresh food near you",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "WhenFresh",
    description: "Find fresh food near you",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical resources */}
        <link rel="preload" href="/icons/icon-192x192.svg" as="image" type="image/svg+xml" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* PWA and mobile optimization */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="WhenFresh" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#fc7c7c" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#fc7c7c" />
        
        {/* Performance hints */}
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
      </head>
      <body
        className={`${geistSans.variable} antialiased min-h-screen`}
        style={{ backgroundColor: '#fef7ed', color: '#451a03' }}
      >
        <PerformanceTracker routeName="root">
          <Providers>
            <RealtimeProvider>
              <ScrollToTop />
              <FCMInitializer />
              <FirebaseMessagingInit />
              <BetaBanner />
              <main className="min-h-screen pb-32" style={{ backgroundColor: '#fef7ed', color: '#451a03', paddingTop: '0' }}>
                {children}
              </main>
              <Footer />
              <BottomNavbar />
              <PWAProvider />
              <CardProvider />
            </RealtimeProvider>
          </Providers>
        </PerformanceTracker>
      </body>
    </html>
  );
}
