"use client"

export default function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center animate-pulse">
      <div className="w-full aspect-square rounded-full bg-gray-200 mb-3 max-w-[200px]"></div>
      <div className="h-4 bg-gray-200 rounded-md w-16 mt-2"></div>
    </div>
  )
}