"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="container max-w-md mx-auto py-24 px-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 shadow-md text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-16 w-16 text-destructive" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">
            We encountered an error while loading your profile. Please try again.
          </p>
          <Button 
            onClick={reset}
            className="w-full"
          >
            Try again
          </Button>
        </div>
      </div>
    </div>
  )
}