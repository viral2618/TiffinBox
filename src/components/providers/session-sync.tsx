"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useAppDispatch } from "@/redux/store";
import { setUser, logout } from "@/redux/features/authSlice";

export function SessionSync() {
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Update Redux auth state when session is authenticated
      dispatch(setUser({
        name: session.user.name || undefined,
        email: session.user.email || undefined,
      }));
    } else if (status === "unauthenticated") {
      // Clear Redux auth state when session is unauthenticated
      dispatch(logout());
    }
  }, [session, status, dispatch]);

  return null; // This component doesn't render anything
}