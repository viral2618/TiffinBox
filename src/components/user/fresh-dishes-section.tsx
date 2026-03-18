"use client"

import { useEffect, useState } from "react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import SectionTitle from "./section-title"
import ViewMoreButton from "./view-more-button"
import DishCard from "@/components/dishes/DishCard"

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
  }
  isFavorite: boolean
  isReminder: boolean
  avgRating: number
  reviews: { rating: number }[]
  timings: {
    preparedAt: { hour: number; minute: number }
    servedFrom: { hour: number; minute: number }
    servedUntil: { hour: number; minute: number }
  }[]
}

export default function FreshDishesSection() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNearbyDishes = async () => {
      try {
        const getUserLocation = (): Promise<GeolocationPosition | null> => {
          return new Promise((resolve) => {
            if (!navigator.geolocation) {
              resolve(null)
              return
            }
            
            navigator.geolocation.getCurrentPosition(
              (position) => resolve(position),
              () => resolve(null),
              { timeout: 5000 }
            )
          })
        }
        
        const userPosition = await getUserLocation()
        
        let url = "/api/dishes?limit=8"
        if (userPosition) {
          url += `&lat=${userPosition.coords.latitude}&lng=${userPosition.coords.longitude}&radius=10`
        }
        
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          setDishes(data.dishes || [])
        }
      } catch (error) {
        console.error("Error fetching dishes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNearbyDishes()
  }, [])

  if (loading) {
    return (
      <section className="py-4 bg-background relative z-10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div className="mb-8">
              <div className="h-8 bg-gray-200 rounded-md w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded-md w-72"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Always show section, even if no dishes
  // if (dishes.length === 0) {
  //   return null
  // }

  return (
    <section className="py-4 bg-background relative z-10">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <SectionTitle 
            title="Fresh Home Meals Near Me" 
            subtitle="Discover freshly prepared homemade dishes from local cooks nearby" 
          />
          <div className="mt-4 md:mt-0">
            <ViewMoreButton href="/dishes" text="View All Dishes" />
          </div>
        </div>

        <Carousel
          className="w-full"
          opts={{
            loop: dishes.length > 1,
            align: "start",
            slidesToScroll: 1,
            containScroll: "trimSnaps",
          }}
        >
          <CarouselContent className="-ml-4">
            {dishes.length > 0 ? (
              dishes.map((dish) => (
                <CarouselItem 
                  key={dish.id} 
                  className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                >
                  <DishCard dish={dish} />
                </CarouselItem>
              ))
            ) : (
              <div className="pl-4 w-full text-center py-12">
                <p className="text-muted-foreground">No dishes available at the moment. Check back soon!</p>
              </div>
            )}
          </CarouselContent>
          {dishes.length > 1 && (
            <div className="flex items-center justify-end mt-4 gap-2">
              <CarouselPrevious className="static transform-none mx-0 bg-background hover:bg-background/90" />
              <CarouselNext className="static transform-none mx-0 bg-background hover:bg-background/90" />
            </div>
          )}
        </Carousel>
      </div>
    </section>
  )
}
