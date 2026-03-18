import { Suspense } from 'react';
import ResetPassword from '@/components/auth/reset-password';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background animate-pulse" />}>
      <ResetPassword />
    </Suspense>
  );
}