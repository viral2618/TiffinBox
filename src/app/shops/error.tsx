"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto py-24 px-4">
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="bg-red-50 p-4 rounded-full mb-6">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        
        <h2 className="text-2xl font-semibold mb-2">Something went wrong!</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          We encountered an error while loading the bakeries. Please try again or contact support if the problem persists.
        </p>
        
        <div className="flex gap-4">
          <Button onClick={reset} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            Go home
          </Button>
        </div>
        
        {process.env.NODE_ENV === "development" && (
          <details className="mt-8 p-4 bg-gray-100 rounded-lg text-left max-w-2xl">
            <summary className="cursor-pointer font-medium">Error details (dev only)</summary>
            <pre className="mt-2 text-sm text-red-600 whitespace-pre-wrap">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}