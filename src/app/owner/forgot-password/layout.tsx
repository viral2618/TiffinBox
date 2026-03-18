import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Owner | When Fresh",
  description: "Reset your password for your When Fresh owner account.",
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}