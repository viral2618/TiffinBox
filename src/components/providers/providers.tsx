"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";
import { AuthProvider } from "./auth-provider";
import { ReduxProvider } from "./redux-provider";
import { BugsinkProvider } from "./bugsink-provider";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import Navbar from "../user/navbar";
import { usePathname } from "next/navigation";
import { FCMInitializer } from "../fcm-init";
import { Toaster } from "../ui/sonner";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const pathname = usePathname();

  const showNavbar = !pathname?.startsWith("/owner/");

  return (
    <BugsinkProvider>
      <ReduxProvider>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            forcedTheme="light"
            disableTransitionOnChange
          >
            <CurrencyProvider>
              <FCMInitializer />
              <Toaster richColors position="top-center" />
              {showNavbar && <Navbar />}
              {children}
            </CurrencyProvider>
          </ThemeProvider>
        </AuthProvider>
      </ReduxProvider>
    </BugsinkProvider>
  );
}
