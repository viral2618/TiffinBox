import Image from "next/image"
import { Phone, Navigation, Star } from "lucide-react"
import HeartIcon from "@/components/ui/heart-icon"
import { useState } from "react"
import { useFavorites } from "@/hooks/use-favorites"

interface Shop {
  id: string
  name: string
  address: string
  imageUrls?: string[]
  distance?: number
  rating?: number
  reviewCount?: number
  contactPhone?: string
  isFavorite?: boolean
}

interface ShopCardProps {
  shop: Shop
  onClick?: () => void
  hideDistance?: boolean
}

export default function ShopCard({ shop, onClick, hideDistance = false }: ShopCardProps) {
  const { loading, toggleShopFavorite } = useFavorites()
  const [isFavorite, setIsFavorite] = useState(shop.isFavorite || false)
  
  // Ensure imageUrls is always an array
  const imageUrls = shop.imageUrls || []

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (shop.contactPhone) {
      window.open(`tel:${shop.contactPhone}`, '_self')
    }
  }

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation()
    const encodedAddress = encodeURIComponent(shop.address)
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank')
  }

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    const newStatus = await toggleShopFavorite(shop.id, isFavorite)
    if (newStatus !== isFavorite) {
      setIsFavorite(newStatus)
    }
  }

  return (
    <div
      onClick={onClick}
      className="shop-card rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer transform hover:-translate-y-1 active:translate-y-0 active:shadow-md"
      style={{ 
        backgroundColor: '#ffffff', 
        border: '2px solid rgba(252, 124, 124, 0.2)',
        color: '#451a03'
      }}
    >
      {/* Shop Image */}
      <div className="aspect-[4/3] relative overflow-hidden rounded-t-2xl">
        {imageUrls.length > 0 ? (
          <Image
            src={imageUrls[0]}
            alt={shop.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fef7ed 100%)' }}
          >
            <span className="text-3xl font-bold" style={{ color: '#fc7c7c' }}>
              {shop.name.charAt(0)}
            </span>
          </div>
        )}
        
        {/* Favorite Heart Icon */}
        <button
          onClick={handleFavorite}
          disabled={loading}
          className="absolute top-3 right-3 ml-4 w-9 h-9 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all duration-200 disabled:opacity-50 hover:scale-110 active:scale-95"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
        >
          <HeartIcon 
            className={`w-4 h-4 transition-colors ${
              isFavorite 
                ? 'text-primary' 
                : 'text-muted-foreground hover:text-primary'
            }`}
            filled={isFavorite}
          />
        </button>
      </div>

      {/* Shop Info */}
      <div className="p-5">
        <h3 className="text-xl font-bold leading-tight mb-2" style={{ color: '#451a03' }}>
          {shop.name}
        </h3>
        
        <p className="text-sm mb-2 line-clamp-1" style={{ color: '#92400e' }}>
          {shop.address}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          {shop.distance !== undefined && !hideDistance ? (
            <span className="text-sm" style={{ color: '#92400e' }}>
              {shop.distance.toFixed(1)} km away
            </span>
          ) : (
            <span></span>
          )}
          
          {shop.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium" style={{ color: '#451a03' }}>
                {Math.round(shop.rating * 10) / 10}
              </span>
              {shop.reviewCount && (
                <span className="text-sm" style={{ color: '#92400e' }}>
                  ({shop.reviewCount})
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2">
          {shop.contactPhone && (
            <button
              onClick={handleCall}
              className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium"
              style={{ 
                backgroundColor: '#fef7ed', 
                color: '#fc7c7c',
                border: '2px solid rgba(252, 124, 124, 0.3)'
              }}
            >
              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Call</span>
            </button>
          )}
          <button
            onClick={handleDirections}
            className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium shadow-md hover:shadow-lg"
            style={{ 
              background: 'linear-gradient(135deg, #fc7c7c 0%, #f97316 100%)', 
              color: 'white'
            }}
          >
            <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Directions</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export type { Shop }