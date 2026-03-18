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
      <div className="w-full bg-[#ccfbf1] rounded-full h-2">
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

export default function UserAuthTabs() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("signin");
  const [fcmToken, setFcmToken] = useState<string | null>(null);
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

  // Get FCM token on component mount
  useEffect(() => {
    const getFCMTokenAsync = async () => {
      try {
        const token = await getFCMToken();
        if (token) {
          setFcmToken(token);
        }
      } catch (error) {
        console.error('Error getting FCM token:', error);
      }
    };
    
    getFCMTokenAsync();
  }, []);

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Check if user exists and is verified
      const userCheckResponse = await fetch('/api/user/get-by-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signInData.email }),
      });
      
      if (userCheckResponse.ok) {
        const userData = await userCheckResponse.json();
        if (userData.userId && !userData.emailVerified) {
          router.push(`/auth/verify-otp?email=${encodeURIComponent(signInData.email)}&userId=${userData.userId}`);
          return;
        }
      }

      const updateFcmToken = async () => {
        if (fcmToken) {
          try {
            await fetch('/api/user/update-fcm-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fcmToken }),
            });
          } catch (error) {
            console.error('Error updating FCM token:', error);
          }
        }
      };
      
      const result = await signIn("credentials", {
        redirect: false,
        email: signInData.email,
        password: signInData.password,
        role: "user"
      });

      if (result?.error) {
        if (result.error.includes("verify your email")) {
          const userResponse = await fetch('/api/user/get-by-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: signInData.email }),
          });
          const userData = await userResponse.json();
          if (userData.userId) {
            router.push(`/auth/verify-otp?email=${encodeURIComponent(signInData.email)}&userId=${userData.userId}`);
            return;
          }
          setError(result.error);
        } else {
          setError("Invalid email or password");
        }
      } else {
        await updateFcmToken();
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...signUpData,
          fcmToken: fcmToken || "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors with details
        if (data.details) {
          const errorMessages = [];
          if (data.details.name) errorMessages.push(`Name: ${data.details.name.join(', ')}`);
          if (data.details.email) errorMessages.push(`Email: ${data.details.email.join(', ')}`);
          if (data.details.password) errorMessages.push(`Password: ${data.details.password.join(', ')}`);
          throw new Error(errorMessages.join('. '));
        }
        throw new Error(data.error || "Something went wrong");
      }

      // Redirect to OTP verification if needed
      if (data.redirectToOtp) {
        router.push(`/auth/verify-otp?email=${encodeURIComponent(data.email)}&userId=${data.userId}`);
        return;
      }

      // Redirect to login tab after successful signup
      setActiveTab("signin");
      setSignInData({ email: signUpData.email, password: "" });
      setSignUpData({ name: "", email: "", password: "" });
      setError("");
      
      // Show success message
      setError("");
      if (data.message.includes("check your email")) {
        alert(data.message);
      } else {
        alert("Account created successfully! Please check your email to verify your account.");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-2 sm:p-4" style={{ backgroundColor: '#f0fdfa' }}>
      <Card className="w-full max-w-sm sm:max-w-md">
        <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
          <CardTitle className="text-lg sm:text-xl">Welcome to TiffinLane</CardTitle>
          <CardDescription className="text-sm">
            Sign in to your account or create a new one
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
                  <label htmlFor="signin-email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={signInData.email}
                    onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="signin-password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="signin-password"
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
                <div className="text-center">
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot your password?
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
                  <label htmlFor="signup-name" className="text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={signUpData.name}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="signup-email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="signup-password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Create a strong password (minimum 8 characters required)"
                    required
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
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="text-xs sm:text-sm text-center mt-4 pt-4 border-t">
            Are you a shop owner?{" "}
            <Link href="/owner/auth" className="text-primary hover:underline">
              Owner Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}