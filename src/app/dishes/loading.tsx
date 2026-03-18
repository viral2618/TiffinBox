"use client"

import { motion } from "framer-motion";
import { Cookie, Cake, Croissant, ChefHat, Dessert } from "lucide-react";

export default function DishesLoading() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-gray-50/50">
      <div className="container mx-auto py-24 px-4 relative overflow-hidden">
        <Cookie className="absolute top-20 -left-10 h-24 w-24 text-primary/5 transform rotate-12 -z-10" />
        <Cake className="absolute top-1/2 -right-12 h-32 w-32 text-primary/5 transform -rotate-12 -z-10" />
        <Croissant className="absolute bottom-10 left-1/4 h-20 w-20 text-primary/5 transform rotate-45 -z-10" />
        <ChefHat className="absolute bottom-20 right-1/4 h-28 w-28 text-primary/5 transform -rotate-45 -z-10" />
        <Dessert className="absolute top-1/3 right-10 h-20 w-20 text-primary/5 transform rotate-12 -z-10" />

        <div className="flex flex-col space-y-8">
          {/* Header Skeleton */}
          <div className="text-center max-w-3xl mx-auto mb-4">
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse mb-3"></div>
            <div className="h-6 bg-gray-200 rounded-lg animate-pulse max-w-md mx-auto"></div>
          </div>

          {/* Search Skeleton */}
          <div className="max-w-3xl mx-auto w-full">
            <div className="h-12 bg-gray-200 rounded-full animate-pulse"></div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 mt-5">
            {/* Filters Skeleton */}
            <div className="w-full lg:w-80 shrink-0">
              <div className="p-6 rounded-lg shadow-lg bg-white">
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="space-y-2 ml-4">
                        {[...Array(3)].map((_, j) => (
                          <div key={j} className="h-3 bg-gray-100 rounded animate-pulse"></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dishes Grid Skeleton */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-24"></div>
              </div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8"
              >
                {[...Array(6)].map((_, i) => (
                  <motion.div key={i} variants={itemVariants}>
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="aspect-square bg-gray-200 animate-pulse"></div>
                      <div className="p-4 text-center space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-20 mx-auto"></div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}