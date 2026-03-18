"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

export default function OwnerVerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email) {
      setError("Email is required. Please go back and try again.");
      return;
    }
    
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit verification code");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // This is a placeholder - you'll need to create this API endpoint
      const response = await fetch("/api/owner/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to verify email");
      }
      
      setSuccess(true);
      toast.success("Email verified successfully!");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (success) {
    return (
      <div className="text-center">
        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-600 mb-4">
          Your email has been verified successfully! You can now log in to your account.
        </div>
        <Button asChild className="w-full">
          <a href="/owner/login">Go to Login</a>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleVerify} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email || ""}
          disabled
          className="w-full bg-muted"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="otp">Verification Code</Label>
        </div>
        <Input
          id="otp"
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
          required
          placeholder="123456"
          className="w-full"
          maxLength={6}
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Verifying..." : "Verify Email"}
      </Button>
    </form>
  );
}