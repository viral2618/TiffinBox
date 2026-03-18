"use client";

import { useAuth } from "@/hooks/use-auth";
import { useAppSelector } from "@/redux/store";
import { signOut } from "next-auth/react";
import { Button } from "./ui/button";
import Link from "next/link";

export function AuthStatus() {
  const { isAuthenticated, isLoading } = useAuth();
  const user = useAppSelector((state) => state.auth.user);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded-lg">
      <h2 className="text-xl font-bold">Authentication Status</h2>
      
      {isAuthenticated ? (
        <div className="flex flex-col items-center gap-2">
          <p>Logged in as: {user?.name || "User"}</p>
          <p>Email: {user?.email || "No email"}</p>
          <Button onClick={() => signOut()}>Sign Out</Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <p>Not logged in</p>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}