"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel"
import SectionTitle from "./section-title"
import ViewMoreButton from "./view-more-button"
import CategorySkeleton from "./category-skeleton"
import CategoryCard from "@/components/cards/category-card"
import type { Category } from "@/lib/categories"

interface LocalCategory extends Category {
  slug: string
  bgColor?: string
}

export default function CategoriesSection() {
  const [categories, setCategories] = useState<LocalCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null)

  // Default categories with colors matching the design
  const defaultCategories: LocalCategory[] = [
    {
      id: "1",
      name: "Specials",
      slug: "specials",
      imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200&q=80",
      bgColor: "bg-green-200"
    },
    {
      id: "2",
      name: "Doughnuts",
      slug: "doughnuts",
      imageUrl: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200&q=80",
      bgColor: "bg-pink-200"
    },
    {
      id: "3",
      name: "Cookies",
      slug: "cookies",
      imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=200&q=80",
      bgColor: "bg-yellow-200"
    },
    {
      id: "4",
      name: "Cakes",
      slug: "cakes",
      imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&q=80",
      bgColor: "bg-cyan-200"
    },
    {
      id: "5",
      name: "Breads",
      slug: "breads",
      imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&q=80",
      bgColor: "bg-orange-200"
    }
  ]

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        if (response.ok) {
          const data = await response.json()
          setCategories(data.categories || defaultCategories)
        } else {
          setCategories(defaultCategories)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
        setCategories(defaultCategories)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Auto scroll every 4 seconds
  useEffect(() => {
    if (!carouselApi || categories.length === 0) return

    const interval = setInterval(() => {
      if (carouselApi.canScrollNext()) {
        carouselApi.scrollNext()
      } else {
        carouselApi.scrollTo(0)
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [carouselApi, categories])

  // Update selected index on slide change
  const onSelect = useCallback(() => {
    if (!carouselApi) return
    setSelectedIndex(carouselApi.selectedScrollSnap())
  }, [carouselApi])

  useEffect(() => {
    if (!carouselApi) return
    carouselApi.on("select", onSelect)
    carouselApi.on("reInit", onSelect)
    onSelect()
    return () => {
      carouselApi.off("select", onSelect)
      carouselApi.off("reInit", onSelect)
    }
  }, [carouselApi, onSelect])

  // Calculate how many items to show based on screen size
  const getItemsPerView = () => {
    // These values will be used by the carousel options
    return {
      xs: 2.2,  // Mobile phones
      sm: 3.2,  // Larger phones
      md: 4.2,  // Tablets
      lg: 5.2,  // Desktops
      xl: 5.2,  // Large desktops
    }
  }

  if (loading) {
    return (
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Section Header with View More Button */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div className="mb-8">
              <div className="h-8 bg-gray-200 rounded-md w-48"></div>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="h-10 bg-gray-200 rounded-md w-40"></div>
            </div>
          </div>
          
          {/* Categories Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header with View More Button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <SectionTitle title="CATEGORIES" />
          <div className="mt-4 md:mt-0">
            <ViewMoreButton href="/categories" text="View All Categories" />
          </div>
        </div>

        {/* Categories Carousel for all screen sizes */}
        <Carousel
          className="w-full"
          setApi={setCarouselApi}
          opts={{
            loop: true,
            align: "start",
            slidesToScroll: 1,
            containScroll: "trimSnaps",
          }}
        >
          <CarouselContent className="-ml-4">
            {categories.map((category) => (
              <CarouselItem 
                key={category.id} 
                className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
              >
                <CategoryCard
                  category={category}
                  isHomePage={true}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex items-center justify-end mt-4 gap-2">
            <CarouselPrevious className="static transform-none mx-0 bg-background hover:bg-background/90" />
            <CarouselNext className="static transform-none mx-0 bg-background hover:bg-background/90" />
          </div>
        </Carousel>

        {/* Pagination Indicators */}
        <div className="flex justify-center mt-6 gap-1.5">
          {categories.map((_, i) => (
            <button
              key={i}
              onClick={() => carouselApi?.scrollTo(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === selectedIndex ? 'bg-primary w-4' : 'bg-gray-300'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
