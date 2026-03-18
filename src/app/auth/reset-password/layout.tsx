import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | User | When Fresh",
  description: "Reset your password for your When Fresh user account.",
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-card p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-primary mb-2">Reset Password</h1>
        <p className="text-muted-foreground mb-4">
          Enter your new password below.
        </p>
        {children}
      </div>
    </div>
  );
}