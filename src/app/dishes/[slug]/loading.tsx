"use client"

export default function DishDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back button and address skeleton */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-2">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-32"></div>
          <div className="h-5 bg-gray-200 rounded animate-pulse w-48"></div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side - Main Image Skeleton */}
          <div className="lg:w-1/2">
            <div className="relative aspect-square rounded-lg overflow-hidden border bg-gray-200 animate-pulse">
              {/* Status Badge Skeleton */}
              <div className="absolute top-4 left-4">
                <div className="bg-white rounded-full px-3 py-1 flex items-center gap-2 shadow-md">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded animate-pulse w-24"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Side - Thumbnails and Product Info Skeleton */}
          <div className="lg:w-1/2 flex flex-col lg:flex-row gap-6">
            {/* Thumbnails Skeleton */}
            <div className="flex lg:flex-col gap-3 lg:w-24">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="w-20 h-20 lg:w-24 lg:h-24 rounded-lg bg-gray-200 animate-pulse"></div>
              ))}
            </div>
            
            {/* Product Information Skeleton */}
            <div className="flex-1 space-y-4">
              {/* Title */}
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              
              {/* Price */}
              <div className="flex items-center gap-3">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-24"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
              </div>
              
              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              </div>
              
              {/* Description */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
              
              {/* Badges */}
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
                <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
              </div>
              
              {/* Schedule */}
              <div className="space-y-3">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
                <div className="flex gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-8 bg-gray-200 rounded-full animate-pulse w-20"></div>
                  ))}
                </div>
              </div>
              
              {/* Shop Details */}
              <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* Reviews Section Skeleton */}
        <div className="mt-12 space-y-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-16 mt-1"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* You May Also Like Section Skeleton */}
        <div className="mt-12 space-y-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-40"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border overflow-hidden">
                <div className="aspect-square bg-gray-200 animate-pulse"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}