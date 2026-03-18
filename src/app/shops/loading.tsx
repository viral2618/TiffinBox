import ShopSkeleton from "@/components/shops/ShopSkeleton"

export default function Loading() {
  return (
    <div className="container mx-auto py-24 px-4">
      <div className="flex flex-col space-y-8">
        {/* Header skeleton */}
        <div className="text-center max-w-3xl mx-auto mb-4">
          <div className="h-10 bg-gray-200 rounded-lg mb-3 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        
        {/* Search bar skeleton */}
        <div className="max-w-3xl mx-auto w-full">
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        
        {/* Mobile controls skeleton */}
        <div className="flex items-center justify-center gap-4 lg:hidden">
          <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8 mt-5">
          {/* Sidebar skeleton - desktop only */}
          <div className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24">
              <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
          
          {/* Shop grid skeleton */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <ShopSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}