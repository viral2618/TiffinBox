"use client"

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function DishesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dishes page error:', error);
  }, [error]);

  return (
    <div className="bg-gray-50/50 min-h-screen">
      <div className="container mx-auto py-24 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h1>
          
          <p className="text-gray-600 mb-6">
            We encountered an error while loading the dishes. Please try again.
          </p>
          
          <div className="space-y-3">
            <Button onClick={reset} className="w-full flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Go to homepage
            </Button>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Error details (development only)
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto text-red-600">
                {error.message}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}