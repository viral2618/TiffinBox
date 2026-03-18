"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

/**
 * Hook to require authentication for certain actions
 * Returns a function that can be used to perform actions that require authentication
 * If user is not authenticated, they will be redirected to login with a callback URL
 */
export function useRequireAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  const requireAuth = <T>(callback: () => T): T | undefined => {
    if (status === "loading") {
      // Wait for session to load
      return undefined;
    }
    
    if (status === "authenticated") {
      // User is authenticated, proceed with the action
      return callback();
    } else {
      // User is not authenticated, redirect to login
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return undefined;
    }
  };
  
  return { requireAuth, isAuthenticated: status === "authenticated", isLoading: status === "loading" };
}