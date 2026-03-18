'use client';

import { useEffect } from 'react';
import { initBugsink } from '@/lib/bugsink';
import { ErrorBoundary } from '@sentry/nextjs';

function BugsinkFallback({ error, resetError }: { error: unknown; resetError: () => void }) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  console.log('🐛 Bugsink: Error boundary triggered', errorMessage);
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-red-600">Something went wrong</h2>
        <p className="text-gray-600">An error occurred and has been reported.</p>
        <button
          onClick={() => {
            console.log('🐛 Bugsink: User clicked reset error button');
            resetError();
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export function BugsinkProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    console.log('🐛 BugsinkProvider: Initializing error tracking on client side');
    initBugsink();
  }, []);

  return (
    <ErrorBoundary fallback={BugsinkFallback}>
      {children}
    </ErrorBoundary>
  );
}