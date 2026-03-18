"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { SessionSync } from "./session-sync";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
      <SessionSync />
      {children}
    </SessionProvider>
  );
}