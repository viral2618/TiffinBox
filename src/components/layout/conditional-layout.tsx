"use client";

import { usePathname } from "next/navigation";
import BetaBanner from "@/components/BetaBanner";
import Footer from "@/components/Footer";
import BottomNavbar from "@/components/user/bottom-navbar";
import PWAProvider from "@/components/pwa/pwa-provider";
import CardProvider from "@/components/cards/card-provider";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/auth') || 
                     pathname.startsWith('/owner/auth') || 
                     pathname.startsWith('/owner/login') || 
                     pathname.startsWith('/owner/signup') || 
                     pathname.startsWith('/owner/verify-email') || 
                     pathname.startsWith('/owner/forgot-password') || 
                     pathname.startsWith('/owner/reset-password');

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <BetaBanner />
      <main className="min-h-screen pb-32" style={{ backgroundColor: '#fef7ed', color: '#451a03', paddingTop: '0' }}>
        {children}
      </main>
      <Footer />
      <BottomNavbar />
      <PWAProvider />
      <CardProvider />
    </>
  );
}
