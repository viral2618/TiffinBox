import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email | Owner | When Fresh",
  description: "Verify your email address for your When Fresh owner account.",
};

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-card p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-primary mb-2">Verify Your Email (Owner)</h1>
        <p className="text-muted-foreground mb-4">
          Enter the verification code sent to your email.
        </p>
        {children}
      </div>
    </div>
  );
}