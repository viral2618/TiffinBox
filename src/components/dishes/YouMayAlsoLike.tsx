"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import DishCard from './DishCard'

interface Dish {
  id: string
  name: string
  slug: string
  description?: string
  imageUrls?: string[]
  price: number
  originalPrice?: number
  discountPercentage?: number
  isVeg: boolean
  isOutOfStock: boolean
  isMarketingEnabled: boolean
  shop: {
    id: string
    name: string
    slug: string
    logoUrl?: string
    distance?: number
    rating?: number
    reviewCount?: number
  }
  isFavorite: boolean
  isReminder: boolean
  timings: {
    preparedAt: { hour: number; minute: number }
    servedFrom: { hour: number; minute: number }
    servedUntil: { hour: number; minute: number }
  }[]
  avgRating: number
  reviews: any[]
}

interface YouMayAlsoLikeProps {
  currentDishId: string
  categoryId?: string
  shopId?: string
}

export default function YouMayAlsoLike({ currentDishId, categoryId, shopId }: YouMayAlsoLikeProps) {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [animationKey, setAnimationKey] = useState(0)

  useEffect(() => {
    const fetchRelatedDishes = async () => {
      try {
        const params = new URLSearchParams({
          exclude: currentDishId,
          limit: '4'
        })
        
        if (categoryId) params.append('categoryId', categoryId)
        if (shopId) params.append('shopId', shopId)

        const response = await fetch(`/api/dishes/related?${params}`)
        if (response.ok) {
          const data = await response.json()
          setDishes(data.dishes || [])
        }
      } catch (error) {
        console.error('Error fetching related dishes:', error)
      } finally {
        setLoading(false)
        setAnimationKey(prev => prev + 1)
      }
    }

    fetchRelatedDishes()
  }, [currentDishId, categoryId, shopId])

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">You may also like</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex-shrink-0 w-64 lg:w-auto bg-gray-200 rounded-lg animate-pulse">
              <div className="aspect-square bg-gray-300 rounded-t-lg"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-6 bg-gray-300 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (dishes.length === 0) {
    return null
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">You may also like</h2>
      <motion.div 
        key={animationKey}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        className="flex gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible"
      >
        {dishes.map((dish) => (
          <motion.div 
            key={dish.id} 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            className="flex-shrink-0 w-64 lg:w-auto"
          >
            <DishCard dish={dish} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}