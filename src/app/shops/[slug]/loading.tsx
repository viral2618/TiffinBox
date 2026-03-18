import { Skeleton } from "@/components/ui/skeleton";

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Shop Details */}
      <div className="relative">
        {/* Banner Image Skeleton */}
        <div className="relative h-[40vh] min-h-[300px] w-full">
          <Skeleton className="h-full w-full" />
        </div>
        
        {/* Shop Info Cards Skeleton */}
        <div className="container mx-auto px-4 -mt-6 relative z-20">
          <div className="bg-card shadow-lg rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Location & Contact */}
              <div className="space-y-4">
                <Skeleton className="h-7 w-48" />
                <div className="space-y-3">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              </div>
              
              {/* Opening Hours */}
              <div className="space-y-4">
                <Skeleton className="h-7 w-48" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
              
              {/* Featured Dishes */}
              <div className="space-y-4">
                <Skeleton className="h-7 w-48" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-32 rounded-full" />
                  <Skeleton className="h-6 w-28 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Menu Section */}
      <div className="container mx-auto py-12 px-4">
        <div className="space-y-8">
          {/* Header and Search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-full md:w-96 rounded-full" />
          </div>
          
          {/* Category Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2 overflow-x-auto w-full">
              <Skeleton className="h-10 w-24 rounded-full flex-shrink-0" />
              <Skeleton className="h-10 w-28 rounded-full flex-shrink-0" />
              <Skeleton className="h-10 w-32 rounded-full flex-shrink-0" />
              <Skeleton className="h-10 w-24 rounded-full flex-shrink-0" />
            </div>
            <Skeleton className="h-10 w-24 flex-shrink-0" />
          </div>
          
          {/* Dish Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden shadow-sm">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-3/5" />
                    <Skeleton className="h-6 w-1/5" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                  <div className="flex justify-center pt-2">
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}