import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Authentication - WhenFresh',
  description: 'Sign in or create an account to access WhenFresh',
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}