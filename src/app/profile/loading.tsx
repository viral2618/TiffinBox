import { Skeleton } from "@/components/ui/skeleton"

export default function ProfileLoading() {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="container max-w-6xl mx-auto py-24 px-4 relative overflow-hidden">
        {/* Page Header Skeleton */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <Skeleton className="h-10 w-64 mx-auto mb-3" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        
        {/* Main Content Skeleton */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Skeleton */}
          <div className="lg:w-1/4">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm">
              <div className="flex flex-col items-center">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-8 w-40 mt-4" />
                <Skeleton className="h-4 w-32 mt-2" />
              </div>
              <div className="mt-6 space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
              <Skeleton className="h-10 w-full mt-6" />
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="lg:w-3/4">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm">
              <Skeleton className="h-8 w-48 mb-6" />
              <div className="grid grid-cols-3 gap-2 mb-8">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}