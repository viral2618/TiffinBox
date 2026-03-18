import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Owner Signup | When Fresh",
  description: "Create your When Fresh owner account.",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}