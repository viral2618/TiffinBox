"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFCMToken } from "@/lib/firebase";
import { User, Store } from "lucide-react";

interface FormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  fcmToken: string;
}

export default function UnifiedAuth() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("user-signin");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // User signin form
  const [userSigninData, setUserSigninData] = useState({
    email: "",
    password: "",
  });
  
  // User signup form
  const [userSignupData, setUserSignupData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    phone: "",
    fcmToken: "",
  });
  
  // Owner signin form
  const [ownerSigninData, setOwnerSigninData] = useState({
    email: "",
    password: "",
  });
  
  // Owner signup form
  const [ownerSignupData, setOwnerSignupData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    phone: "",
    fcmToken: "",
  });

  // Get FCM token on component mount
  useEffect(() => {
    const getFCMTokenAsync = async () => {
      try {
        const token = await getFCMToken();
        if (token) {
          setUserSignupData(prev => ({ ...prev, fcmToken: token }));
          setOwnerSignupData(prev => ({ ...prev, fcmToken: token }));
        }
      } catch (error) {
        console.error('Error getting FCM token:', error);
      }
    };
    
    getFCMTokenAsync();
  }, []);

  const handleUserSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: userSigninData.email,
        password: userSigninData.password,
        role: "user"
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userSignupData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      const result = await signIn("credentials", {
        redirect: false,
        email: userSignupData.email,
        password: userSignupData.password,
        role: "user",
      });

      if (result?.error) {
        setError("Failed to sign in after registration");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOwnerSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: ownerSigninData.email,
        password: ownerSigninData.password,
        role: "owner",
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/owner/dashboard");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOwnerSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/owner/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ownerSignupData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      router.push(`/owner/verify-email?email=${encodeURIComponent(ownerSignupData.email)}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4" style={{ background: 'linear-gradient(150deg, #f0fdfa 0%, #ccfbf1 50%, #99f6e4 100%)' }}>
      <Card className="w-full max-w-md shadow-xl border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg">
              <img src="/icons/icon-96x96.svg" alt="TiffinLane" className="w-full h-full" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg,#134e4a,#0d9488)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Welcome to TiffinLane
          </CardTitle>
          <CardDescription style={{ color: '#0f766e' }}>
            Home-cooked meals, just like mom makes
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 pt-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tab Navigation */}
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger 
                value="user-signin" 
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">User</span>
              </TabsTrigger>
              <TabsTrigger 
                value="owner-signin"
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                <Store className="w-4 h-4" />
                <span className="hidden sm:inline">Owner</span>
              </TabsTrigger>
            </TabsList>

            {error && (
              <div className="p-3 mb-4 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
                {error}
              </div>
            )}

            {/* User Sign In */}
            <TabsContent value="user-signin" className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Sign In as User</h3>
        <p className="text-sm text-muted-foreground">Access your account to browse and order homemade food</p>
              </div>
              
              <form onSubmit={handleUserSignin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="user-email" className="text-sm font-medium">Email</label>
                  <Input
                    id="user-email"
                    type="email"
                    value={userSigninData.email}
                    onChange={(e) => setUserSigninData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                    className="rounded-lg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="user-password" className="text-sm font-medium">Password</label>
                  <Input
                    id="user-password"
                    type="password"
                    value={userSigninData.password}
                    onChange={(e) => setUserSigninData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                    className="rounded-lg"
                    required
                  />
                </div>
                <Button type="submit" className="w-full rounded-lg" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setActiveTab("user-signup")}
                    className="text-sm text-primary hover:underline"
                  >
                    Don't have an account? Sign Up
                  </button>
                </div>
              </form>
            </TabsContent>

            {/* User Sign Up */}
            <TabsContent value="user-signup" className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Create User Account</h3>
                <p className="text-sm text-muted-foreground">Join TiffinLane to start ordering homemade food</p>
              </div>
              
              <form onSubmit={handleUserSignup} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="user-signup-name" className="text-sm font-medium">Name</label>
                  <Input
                    id="user-signup-name"
                    type="text"
                    value={userSignupData.name}
                    onChange={(e) => setUserSignupData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                    className="rounded-lg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="user-signup-email" className="text-sm font-medium">Email</label>
                  <Input
                    id="user-signup-email"
                    type="email"
                    value={userSignupData.email}
                    onChange={(e) => setUserSignupData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                    className="rounded-lg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="user-signup-password" className="text-sm font-medium">Password</label>
                  <Input
                    id="user-signup-password"
                    type="password"
                    value={userSignupData.password}
                    onChange={(e) => setUserSignupData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                    className="rounded-lg"
                    minLength={8}
                    required
                  />
                </div>
                <Button type="submit" className="w-full rounded-lg" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setActiveTab("user-signin")}
                    className="text-sm text-primary hover:underline"
                  >
                    Already have an account? Sign In
                  </button>
                </div>
              </form>
            </TabsContent>

            {/* Owner Sign In */}
            <TabsContent value="owner-signin" className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Owner Sign In</h3>
                <p className="text-sm text-muted-foreground">Access your shop management dashboard</p>
              </div>
              
              <form onSubmit={handleOwnerSignin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="owner-email" className="text-sm font-medium">Email</label>
                  <Input
                    id="owner-email"
                    type="email"
                    value={ownerSigninData.email}
                    onChange={(e) => setOwnerSigninData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="owner@example.com"
                    className="rounded-lg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="owner-password" className="text-sm font-medium">Password</label>
                  <Input
                    id="owner-password"
                    type="password"
                    value={ownerSigninData.password}
                    onChange={(e) => setOwnerSigninData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                    className="rounded-lg"
                    required
                  />
                </div>
                <Button type="submit" className="w-full rounded-lg" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
                <div className="flex flex-col gap-2 text-center">
                  <button
                    type="button"
                    onClick={() => setActiveTab("owner-signup")}
                    className="text-sm text-primary hover:underline"
                  >
                    Don't have an owner account? Sign Up
                  </button>
                  <Link href="/owner/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot Password?
                  </Link>
                </div>
              </form>
            </TabsContent>

            {/* Owner Sign Up */}
            <TabsContent value="owner-signup" className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Create Owner Account</h3>
                <p className="text-sm text-muted-foreground">Register your home kitchen on TiffinLane</p>
              </div>
              
              <form onSubmit={handleOwnerSignup} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="owner-signup-name" className="text-sm font-medium">Name</label>
                  <Input
                    id="owner-signup-name"
                    type="text"
                    value={ownerSignupData.name}
                    onChange={(e) => setOwnerSignupData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                    className="rounded-lg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="owner-signup-email" className="text-sm font-medium">Email</label>
                  <Input
                    id="owner-signup-email"
                    type="email"
                    value={ownerSignupData.email}
                    onChange={(e) => setOwnerSignupData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="owner@example.com"
                    className="rounded-lg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="owner-signup-phone" className="text-sm font-medium">Phone (Optional)</label>
                  <Input
                    id="owner-signup-phone"
                    type="tel"
                    value={ownerSignupData.phone}
                    onChange={(e) => setOwnerSignupData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1234567890"
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="owner-signup-password" className="text-sm font-medium">Password</label>
                  <Input
                    id="owner-signup-password"
                    type="password"
                    value={ownerSignupData.password}
                    onChange={(e) => setOwnerSignupData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                    className="rounded-lg"
                    minLength={8}
                    required
                  />
                </div>
                <Button type="submit" className="w-full rounded-lg" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Sign Up as Owner"}
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setActiveTab("owner-signin")}
                    className="text-sm text-primary hover:underline"
                  >
                    Already have an owner account? Sign In
                  </button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}