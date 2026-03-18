"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Heart, BellIcon, Clock, MapPin } from "lucide-react"
import Image from "next/image"
import DishCard from "@/components/dishes/DishCard"
import { useLocation } from "@/hooks/use-location"

interface Dish {
  id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  discountPercentage?: number
  imageUrls: string[]
  description?: string
  isSpecialToday: boolean
  createdAt: string
  isVeg: boolean
  shop: {
    id: string
    name: string
    slug: string
    address: string
    distance?: number
    logoUrl?: string
    rating?: number
    reviewCount?: number
    coordinates?: {
      lat: number
      lng: number
    }
  }
  category?: {
    name: string
  }
  isFavorite: boolean
  isReminder: boolean
  timings: {
    preparedAt: { hour: number; minute: number }
    servedFrom: { hour: number; minute: number }
    servedUntil: { hour: number; minute: number }
  }[]
}

type TabType = "Just now bake / Just ready" | "Sales near you"

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const DISHES_LIMIT = 8

export default function FreshDelightsSection() {
  const [activeTab, setActiveTab] = useState<TabType>("Just now bake / Just ready")
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const { isEnabled: isLocationEnabled } = useLocation()

  const tabs: TabType[] = ["Just now bake / Just ready", "Sales near you"]

  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.warn("Location access denied:", error)
        },
        { timeout: 10000, enableHighAccuracy: false }
      )
    }
  }, [])

  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }, [])

  const fetchDishes = useCallback(async (tab: TabType) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        limit: DISHES_LIMIT.toString(),
        page: "1"
      })

      const response = await fetch(`/api/dishes?${params.toString()}`, {
        headers: {
          'Cache-Control': `max-age=${CACHE_DURATION / 1000}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      let processedDishes = data.dishes || []
      
      if (tab === "Sales near you") {
        processedDishes = processedDishes.map((dish: Dish) => {
          const discountPercentage = Math.floor(Math.random() * 41) + 10
          const originalPrice = Math.round(dish.price / (1 - discountPercentage / 100))
          
          let distance = undefined
          if (userLocation) {
            const shopLat = dish.shop.coordinates?.lat || (userLocation.lat + (Math.random() - 0.5) * 0.1)
            const shopLng = dish.shop.coordinates?.lng || (userLocation.lng + (Math.random() - 0.5) * 0.1)
            
            distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              shopLat,
              shopLng
            )
          }
          
          return {
            ...dish,
            originalPrice: originalPrice,
            discountPercentage: discountPercentage,
            shop: {
              ...dish.shop,
              distance: distance
            }
          }
        })
      }
      
      setDishes(processedDishes)
    } catch (error) {
      console.error("Error fetching dishes:", error)
      setError("Failed to load fresh delights")
      setDishes([])
    } finally {
      setLoading(false)
    }
  }, [userLocation, calculateDistance])

  useEffect(() => {
    getUserLocation()
  }, [])

  useEffect(() => {
    fetchDishes(activeTab)
  }, [activeTab, fetchDishes])

  const getFilteredDishes = () => {
    if (dishes.length === 0) return []
    
    if (activeTab === "Just now bake / Just ready") {
      return dishes
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 4)
    }
    
    if (activeTab === "Sales near you") {
      if (userLocation) {
        return dishes
          .filter(dish => dish.shop.distance !== undefined)
          .sort((a, b) => (a.shop.distance || 0) - (b.shop.distance || 0))
          .slice(0, 4)
      } else {
        return dishes
          .filter(dish => dish.discountPercentage !== undefined)
          .sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0))
          .slice(0, 4)
      }
    }
    
    return dishes.slice(0, 4)
  }

  const LoadingSkeleton = () => (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <div className="h-12 bg-gray-200 rounded-md w-64 mx-auto mb-8 animate-pulse"></div>
          <div className="flex justify-center mb-8">
            <div className="flex space-x-8">
              {tabs.map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 rounded-md w-32 animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="aspect-square bg-gray-200 animate-pulse"></div>
              <div className="p-4 text-center">
                <div className="h-4 bg-gray-200 rounded-md mb-2 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded-md w-16 mx-auto animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => fetchDishes(activeTab)}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    )
  }

  const filteredDishes = getFilteredDishes()

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Featured Dishes
          </h2>
          
          <div className="flex justify-center mb-8">
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-sm md:text-lg font-medium pb-2 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? "text-red-500 border-red-500"
                      : "text-gray-600 border-transparent hover:text-gray-800"
                  }`}
                  aria-pressed={activeTab === tab}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredDishes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              {activeTab === "Just now bake / Just ready" 
                ? "No fresh items available right now" 
                : "No dishes found in your area"}
            </p>
            <button 
              onClick={() => fetchDishes(activeTab)}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Refresh
            </button>
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {filteredDishes.map((dish) => (
              <DishCard
                key={dish.id}
                dish={{
                  id: dish.id,
                  name: dish.name,
                  slug: dish.slug || dish.id,
                  description: dish.description,
                  imageUrls: dish.imageUrls || [],
                  price: dish.price,
                  originalPrice: dish.originalPrice,
                  discountPercentage: dish.discountPercentage,
                  isVeg: dish.isVeg || false,
                  shop: {
                    id: dish.shop.id,
                    name: dish.shop.name,
                    slug: dish.shop.slug || dish.shop.id,
                    logoUrl: dish.shop.logoUrl,
                    distance: (activeTab === "Sales near you" && !isLocationEnabled) ? undefined : dish.shop.distance
                  },
                  isFavorite: dish.isFavorite,
                  isReminder: dish.isReminder,
                  timings: dish.timings || [],
                  avgRating: 0,
                  reviews: []
                }}
              />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}