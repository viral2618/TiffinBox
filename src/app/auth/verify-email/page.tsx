import { Suspense } from 'react';
import EmailVerification from '@/components/auth/email-verification';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background animate-pulse" />}>
      <EmailVerification />
    </Suspense>
  );
}