"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { OwnerSidebar } from "@/components/owner-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const protectedRoutes = ["/owner/dashboard", "/owner/dashboard/notifications", "/owner/dashboard/my-dishes", "/owner/dashboard/add-dish", "/owner/dashboard/edit-dish", "/owner/dashboard/my-shops", "/owner/dashboard/my-shops/create", "/owner/dashboard/settings"];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    
    if (status === "unauthenticated" && isProtectedRoute) {
      router.push("/owner/auth");
      return;
    }
    
    if (status === "authenticated" && session?.user.role === "owner") {
      if (!session.user.isOnboarded && pathname !== "/owner/onboarding") {
        router.push("/owner/onboarding");
      } else if (session.user.isOnboarded && pathname === "/owner/onboarding") {
        router.push("/owner/dashboard");
      }
    }
  }, [session, status, router, pathname]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  // Auth pages without sidebar
  const authPages = ["/owner/login", "/owner/signup", "/owner/forgot-password", "/owner/reset-password", "/owner/verify-email", "/owner/auth"];
  if (authPages.includes(pathname)) {
    return <>{children}</>;
  }

  // Protected routes - require authentication and owner role
  const protectedRoutes = ["/owner/dashboard", "/owner/dashboard/notifications", "/owner/dashboard/my-dishes", "/owner/dashboard/add-dish", "/owner/dashboard/edit-dish", "/owner/dashboard/my-shops", "/owner/dashboard/my-shops/create", "/owner/dashboard/settings"];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute && (status !== "authenticated" || session?.user.role !== "owner")) {
    return null;
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <OwnerSidebar variant="inset" />
      <SidebarInset className="flex flex-col min-h-screen">
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2 p-2 md:p-6">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}