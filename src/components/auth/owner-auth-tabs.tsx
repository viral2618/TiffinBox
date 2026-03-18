"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Password Strength Component
function PasswordStrength({ password }: { password: string }) {
  const getStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(password);
  const getColor = () => {
    if (strength <= 2) return '#dc2626'; // red
    if (strength <= 3) return '#f59e0b'; // yellow
    return '#10b981'; // green
  };

  const getLabel = () => {
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span>Password strength:</span>
        <span style={{ color: getColor() }}>{getLabel()}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="h-2 rounded-full transition-all duration-300"
          style={{ 
            width: `${(strength / 5) * 100}%`,
            backgroundColor: getColor()
          }}
        />
      </div>
    </div>
  );
}

export default function OwnerAuthTabs() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("signin");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Sign In Form State
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });

  // Sign Up Form State
  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: signInData.email,
        password: signInData.password,
        role: "owner",
      });

      if (result?.error) {
        if (result.error.includes("verify your email")) {
          const ownerResponse = await fetch('/api/owner/get-by-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: signInData.email }),
          });
          const ownerData = await ownerResponse.json();
          if (ownerData.ownerId) {
            router.push(`/owner/verify-email?email=${encodeURIComponent(signInData.email)}&ownerId=${ownerData.ownerId}`);
            return;
          }
          setError(result.error);
        } else {
          setError("Invalid email or password");
        }
      } else {
        router.push("/owner/dashboard");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/owner/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signUpData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      if (data.redirectToOtp) {
        router.push(`/owner/verify-email?email=${encodeURIComponent(data.email)}&ownerId=${data.userId}`);
        return;
      }

      // Show success message
      setError("");
      if (data.message.includes("check your email")) {
        alert(data.message);
      } else {
        alert("Account created successfully! Please check your email to verify your account.");
      }
      
      // Switch to sign in tab
      setActiveTab("signin");
      setSignInData({ email: signUpData.email, password: "" });
      setSignUpData({ name: "", email: "", password: "" });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-2 sm:p-4">
      <Card className="w-full max-w-sm sm:max-w-md">
        <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
          <CardTitle className="text-lg sm:text-xl">Owner Portal</CardTitle>
          <CardDescription className="text-sm">
            Access your shop management dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup">
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4 mt-6">
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-100 text-red-600 text-sm rounded">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <label htmlFor="owner-signin-email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="owner-signin-email"
                    type="email"
                    value={signInData.email}
                    onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="owner-signin-password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="owner-signin-password"
                    type="password"
                    value={signInData.password}
                    onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter your secure password (minimum 8 characters)"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
                <div className="text-sm text-center">
                  <Link href="/owner/forgot-password" className="text-primary hover:underline">
                    Forgot Password?
                  </Link>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4 mt-6">
              <form onSubmit={handleSignUpSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-100 text-red-600 text-sm rounded">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <label htmlFor="owner-signup-name" className="text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="owner-signup-name"
                    type="text"
                    value={signUpData.name}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="owner-signup-email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="owner-signup-email"
                    type="email"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="owner-signup-password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="owner-signup-password"
                    type="password"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Create a strong password (minimum 8 characters required)"
                    required
                    minLength={8}
                  />
                  {signUpData.password && (
                    <PasswordStrength password={signUpData.password} />
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Sign Up as Owner"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="text-xs sm:text-sm text-center mt-4 pt-4 border-t">
            Are you a customer?{" "}
            <Link href="/auth" className="text-primary hover:underline">
              Customer Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}