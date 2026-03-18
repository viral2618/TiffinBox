import BugsinkTest from '@/components/bugsink-test';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bugsink Test',
  description: 'Test page for Bugsink error tracking functionality',
};

export default function TestBugsinkPage() {
  return (
    <div className="container mx-auto py-8">
      <BugsinkTest />
    </div>
  );
}