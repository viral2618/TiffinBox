"use client"

export default function ShopSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Image placeholder */}
      <div className="relative overflow-hidden rounded-2xl aspect-[4/3] bg-gray-200">
        {/* Distance badge placeholder */}
        <div className="absolute bottom-3 right-3 h-5 w-16 rounded-full bg-gray-300"></div>
        
        {/* Favorite button placeholder */}
        <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-gray-300"></div>
      </div>
      
      {/* Logo placeholder - centered */}
      <div className="relative flex justify-center">
        <div className="absolute -top-6 h-12 w-12 rounded-full border-2 border-white bg-gray-300"></div>
      </div>
      
      {/* Content */}
      <div className="pt-8 px-1">
        {/* Title placeholder */}
        <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
        
        {/* Description placeholder */}
        <div className="h-4 bg-gray-200 rounded w-full mx-auto mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-3"></div>
        
        {/* Address placeholder */}
        <div className="flex items-center justify-center gap-1">
          <div className="h-3 w-3 bg-gray-300 rounded-full flex-shrink-0"></div>
          <div className="h-3 bg-gray-200 rounded w-4/5"></div>
        </div>
        
        {/* Tags placeholder */}
        <div className="flex justify-center gap-1 mt-3">
          <div className="h-5 bg-gray-200 rounded-full w-16"></div>
          <div className="h-5 bg-gray-200 rounded-full w-20"></div>
        </div>
        
        {/* Button placeholder */}
        <div className="mt-4 flex justify-center">
          <div className="h-8 bg-gray-200 rounded-full w-32"></div>
        </div>
      </div>
    </div>
  )
}