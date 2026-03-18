"use client"

import Link from "next/link"
import { Heart, MapPin, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { useState } from "react"
import Image from "next/image"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { toggleFavoriteShop } from "@/redux/features/favoritesSlice"
import { useRequireAuth } from "@/hooks/use-require-auth"

interface ShopCardProps {
  shop: {
    id: string
    name: string
    slug: string
    description?: string
    address: string
    bannerImage?: string
    logoUrl?: string
    imageUrls?: string[]
    distance?: number
    isFavorite: boolean
    shopTags: {
      tag: {
        id: string
        name: string
      }
    }[]
  }
}

export default function ShopCard({ shop }: ShopCardProps) {
  const [imageError, setImageError] = useState<Record<string, boolean>>({})
  
  const dispatch = useAppDispatch()
  const { loading } = useAppSelector(state => state.favorites)
  const { requireAuth } = useRequireAuth()
  
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Use requireAuth to handle authentication check and redirect if needed
    requireAuth(() => {
      // Add a small delay to improve user experience
      // This makes the heart animation feel more responsive
      setTimeout(() => {
        dispatch(toggleFavoriteShop({ shopId: shop.id, currentFavoriteStatus: shop.isFavorite }))
      }, 100)
    })
  }

  // Truncate description to 80 characters
  const truncatedDescription = shop.description 
    ? shop.description.length > 80 
      ? `${shop.description.substring(0, 80)}...` 
      : shop.description
    : ""
    
  // Handle image error
  const handleImageError = (key: string) => {
    setImageError(prev => ({ ...prev, [key]: true }))
  }

  return (
    <motion.div 
      whileHover={{ y: -5 }} 
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group"
    >
      {/* Image Carousel */}
      <div className="relative overflow-hidden rounded-3xl">
        <Carousel className="w-full h-full">
          <CarouselContent>
            {shop.imageUrls && shop.imageUrls.length > 0 ? (
              shop.imageUrls.map((imageUrl, i) => (
                <CarouselItem key={i} className="h-full">
                  <div className="relative h-full w-full overflow-hidden">
                    {imageError[`image-${i}`] ? (
                      <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">{shop.name.charAt(0)}</span>
                      </div>
                    ) : (
                      <Image
                        src={imageUrl}
                        height={500}
                        width={500}
                        alt={`${shop.name} - image ${i+1}`}
                        className="object-cover w-full h-72 transition-transform duration-500 group-hover:scale-110"
                        onError={() => handleImageError(`image-${i}`)}
                      />
                    )}
                    {/* Dark overlay backdrop */}
                    <div className="absolute inset-0 bg-black/30" />
                  </div>
                </CarouselItem>
              ))
            ) : shop.bannerImage ? (
              <CarouselItem className="h-full">
                <div className="relative h-full w-full overflow-hidden">
                  {imageError['banner'] ? (
                    <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">{shop.name.charAt(0)}</span>
                    </div>
                  ) : (
                    <Image
                      src={shop.bannerImage}
                      height={500}
                      width={500}
                      alt={shop.name}
                      className="object-cover w-full h-72 transition-transform duration-500 group-hover:scale-110"
                      onError={() => handleImageError('banner')}
                    />
                  )}
                  {/* Dark overlay backdrop */}
                  <div className="absolute inset-0 bg-black/30" />
                </div>
              </CarouselItem>
            ) : (
              <CarouselItem className="h-full">
                <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{shop.name.charAt(0)}</span>
                </div>
              </CarouselItem>
            )}
          </CarouselContent>
          
          {/* Only show navigation if there are multiple images */}
          {shop.imageUrls && shop.imageUrls.length > 1 && (
            <>
              <CarouselPrevious className="left-2 bg-white/80 hover:bg-white" />
              <CarouselNext className="right-2 bg-white/80 hover:bg-white" />
            </>
          )}
        </Carousel>

        {/* Logo - top left corner */}
        <div className="absolute top-3 left-3 h-16 w-16 rounded-full border-3 border-white overflow-hidden bg-white shadow-lg z-20">
          {shop.logoUrl && !imageError['logo'] ? (
            <Image
              src={shop.logoUrl}
              width={64}
              height={64}
              alt={`${shop.name} logo`}
              className="object-cover w-full h-full"
              onError={() => handleImageError('logo')}
            />
          ) : (
            <div className="w-full h-full bg-white flex items-center justify-center">
              <span className="text-base font-bold text-primary">{shop.name.charAt(0)}</span>
            </div>
          )}
        </div>

        {/* Favorite button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleToggleFavorite}
          disabled={loading}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white transition-all duration-200 shadow-lg z-30"
          aria-label={shop.isFavorite ? "Remove from favorites" : "Add to favorites"}
          title={shop.isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={`h-4 w-4 transition-all ${shop.isFavorite ? "fill-red-500 text-red-500" : "text-gray-500 hover:text-red-500"} ${loading ? "animate-pulse" : ""}`}
          />
        </motion.button>

        {/* Distance badge */}
        {shop.distance !== undefined && (
          <div className="absolute bottom-3 right-3 bg-primary text-primary-foreground shadow-md px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 z-50">
            <MapPin className="h-3 w-3" />
            {shop.distance < 1 ? `${Math.round(shop.distance * 1000)}m` : `${shop.distance.toFixed(1)}km`}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-1 pt-4">
        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors text-center">
          {shop.name}
        </h3>
        
        {truncatedDescription && (
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2 text-center">
            {truncatedDescription}
          </p>
        )}
        
        <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span className="line-clamp-1">{shop.address}</span>
        </div>
        
        {/* Tags */}
        {shop.shopTags && shop.shopTags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1 mt-3">
            {shop.shopTags.slice(0, 2).map(({ tag }) => (
              <span key={tag.id} className="text-xs px-2 py-0.5 bg-muted rounded-full">
                {tag.name}
              </span>
            ))}
            {shop.shopTags.length > 2 && (
              <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                +{shop.shopTags.length - 2}
              </span>
            )}
          </div>
        )}
        
        {/* View Details Button */}
        <div className="mt-4 flex justify-center">
          <Link href={`/shops/${shop.slug}`}>
            <Button 
              variant="outline" 
              className="rounded-full px-4 py-1 h-auto text-sm border-primary text-primary hover:bg-primary/10"
            >
              View Details
              <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}