"use client"

export default function ShopSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full animate-pulse">
      {/* Image Placeholder */}
      <div className="aspect-square bg-gray-200 rounded-t-2xl"></div>
      
      {/* Content Placeholder */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-5 bg-gray-200 rounded-md w-3/4"></div>
        
        {/* Info Row */}
        <div className="flex items-center justify-between pt-1">
          {/* Opening Hours */}
          <div className="space-y-1.5">
            <div className="h-3 bg-gray-200 rounded-md w-16"></div>
            <div className="h-3 bg-gray-200 rounded-md w-24"></div>
          </div>
          
          {/* Distance */}
          <div className="h-3 bg-gray-200 rounded-md w-14"></div>
        </div>
      </div>
    </div>
  )
}