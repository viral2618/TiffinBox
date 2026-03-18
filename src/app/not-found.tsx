import { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Page Not Found - TiffinLane',
  description: 'The page you are looking for could not be found.',
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(150deg,#fffbf5 0%,#fef3e2 50%,#fde8c8 100%)' }}>
      <div className="text-center">
        <div className="text-8xl mb-4">🍱</div>
        <h1 className="text-7xl font-bold mb-4" style={{ background: 'linear-gradient(135deg,#f97316,#ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>404</h1>
        <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1c0a00' }}>Page Not Found</h2>
        <p className="mb-8" style={{ color: '#78350f' }}>
          Looks like this page went missing — just like food at a hostel!
        </p>
        <Button asChild style={{ background: 'linear-gradient(135deg,#f97316,#ef4444)', color: 'white', border: 'none', borderRadius: '9999px', padding: '0.75rem 2rem' }}>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}