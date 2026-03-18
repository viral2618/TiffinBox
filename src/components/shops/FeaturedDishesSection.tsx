"use client"

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import DishCard from '@/components/dishes/DishCard'

interface Dish {
  id: string
  name: string
  slug: string
  description?: string
  imageUrls: string[]
  price: number
  isVeg: boolean
  isFavorite: boolean
}

interface Shop {
  id: string
  name: string
  slug: string
  logoUrl?: string
}

interface FeaturedDishesSectionProps {
  dishes: Dish[]
  shop: Shop
  loading?: boolean
}

export default function FeaturedDishesSection({ dishes, shop, loading }: FeaturedDishesSectionProps) {
  const [showFeatured, setShowFeatured] = useState(false)
  
  const featuredDishes = dishes.slice(0, 6)
  
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium border-b pb-2">Featured Dishes</h3>
          <div className="h-6 w-20 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-6 w-24 bg-gray-200 animate-pulse rounded-full" />
          ))}
        </div>
      </div>
    )
  }
  
  if (featuredDishes.length === 0) {
    return null
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium border-b pb-2">Featured Dishes</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFeatured(!showFeatured)}
          className="flex items-center gap-1 text-primary"
        >
          {showFeatured ? (
            <>
              Hide <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              View All <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
      
      {!showFeatured ? (
        <div className="flex flex-wrap gap-2">
          {featuredDishes.slice(0, 4).map((dish) => (
            <Badge key={dish.id} variant="secondary" className="px-3 py-1">
              {dish.name}
            </Badge>
          ))}
          {featuredDishes.length > 4 && (
            <Badge variant="outline" className="px-3 py-1">
              +{featuredDishes.length - 4} more
            </Badge>
          )}
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              {featuredDishes.map((dish) => (
                <motion.div
                  key={dish.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <DishCard 
                    dish={{
                      id: dish.id,
                      name: dish.name,
                      slug: dish.slug,
                      description: dish.description,
                      imageUrls: dish.imageUrls,
                      price: dish.price,
                      originalPrice: undefined,
                      discountPercentage: undefined,
                      isVeg: dish.isVeg,
                      shop: {
                        id: shop.id,
                        name: shop.name,
                        slug: shop.slug,
                        logoUrl: shop.logoUrl,
                        distance: undefined
                      },
                      isFavorite: dish.isFavorite,
                      isReminder: false,
                      timings: [],
                      avgRating: 0,
                      reviews: []
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}