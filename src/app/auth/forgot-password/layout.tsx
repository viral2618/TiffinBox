import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | User | When Fresh",
  description: "Reset your password for your When Fresh user account.",
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}