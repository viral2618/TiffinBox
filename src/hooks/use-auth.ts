"use client";

import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { useEffect } from "react";
import { useAppDispatch } from "@/redux/store";
import { setUser, logout } from "@/redux/features/authSlice";

export const useAuth = () => {
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      dispatch(setUser({
        name: session.user.name || undefined,
        email: session.user.email || undefined,
      }));
    } else if (status === "unauthenticated") {
      dispatch(logout());
    }
  }, [session, status, dispatch]);

  const signOut = async () => {
    // Delete device token before logout
    try {
      const token = localStorage.getItem('fcmToken');
      if (token) {
        await fetch('/api/device-token', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        localStorage.removeItem('fcmToken');
      }
    } catch (error) {
      console.error('Failed to delete device token:', error);
    }
    
    dispatch(logout());
    nextAuthSignOut();
  };

  return {
    session,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    signOut,
  };
};