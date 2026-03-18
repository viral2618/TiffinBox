import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Owner Login | When Fresh",
  description: "Sign in to your When Fresh owner account.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}