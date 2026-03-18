"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { MapPin, Clock, Zap, Leaf, Bell, Eye } from "lucide-react"
import HeartIcon from "@/components/ui/heart-icon"
import { useState, useEffect } from "react"
import Image from "next/image"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { toggleFavoriteDish } from "@/redux/features/favoritesSlice"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { useFavorites } from "@/hooks/use-favorites"
import { ReminderDrawer } from "./ReminderDrawer"
import { QuickViewModal } from "./QuickViewModal"
import { useCurrency } from "@/hooks/use-currency"

interface DishCardProps {
  dish: {
    id: string
    name: string
    slug: string
    description?: string
    imageUrls?: string[]
    price: number
    currency?: string
    originalPrice?: number
    discountPercentage?: number
    isVeg: boolean
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
        preparedAt: { hour: number; minute: number };
        servedFrom: { hour: number; minute: number };
        servedUntil: { hour: number; minute: number };
    }[];
  }
}

export default function DishCard({ dish }: DishCardProps) {
  const [imageError, setImageError] = useState<Record<string, boolean>>({})
  const [status, setStatus] = useState<string | null>(null)
  const [isReminderSet, setIsReminderSet] = useState(dish.isReminder || false)
  const [isReminderDrawerOpen, setIsReminderDrawerOpen] = useState(false)
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  const [isFavorite, setIsFavorite] = useState(dish.isFavorite)
  
  const dispatch = useAppDispatch()
  const { loading } = useAppSelector(state => state.favorites)
  const { requireAuth } = useRequireAuth()
  const { toggleDishFavorite } = useFavorites()
  const { convertPrice, formatPrice } = useCurrency()
  const router = useRouter()

  useEffect(() => {
    // Fetch preparation slot status
    const fetchPreparationStatus = async () => {
      try {
        const response = await fetch(`/api/owner/dishes/${dish.id}/preparation-slot`);
        if (response.ok) {
          const data = await response.json();
          if (data.slot) {
            if (data.slot.status === 'SOLD_OUT') {
              const servingTime = new Date(data.slot.servingStartsAt);
              setStatus(`Sold Out (Last: ${servingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`);
            } else if (data.status === 'PREPARING') {
              const now = new Date();
              const servingTime = new Date(data.slot.servingStartsAt);
              const minutesLeft = Math.ceil((servingTime.getTime() - now.getTime()) / 60000);
              setStatus(`Preparing (${minutesLeft} mins)`);
            } else if (data.status === 'SERVING') {
              setStatus('Serving Now');
            }
          } else {
            setStatus(null);
          }
        }
      } catch (error) {
        console.error('Error fetching preparation status:', error);
      }
    };

    fetchPreparationStatus();
    // Poll every 30 seconds
    const interval = setInterval(fetchPreparationStatus, 30000);
    return () => clearInterval(interval);
  }, [dish.id]);
  
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const newStatus = await toggleDishFavorite(dish.id, isFavorite)
    if (newStatus !== isFavorite) {
      setIsFavorite(newStatus)
    }
  }

  const handleImageError = (key: string) => {
    setImageError(prev => ({ ...prev, [key]: true }))
  }

  const handleSetReminder = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    requireAuth(() => {
      setIsReminderDrawerOpen(true)
    })
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsQuickViewOpen(true)
  }

  const handleCardClick = () => {
    router.push(`/dishes/${dish.slug}`)
  }

  const dishCurrency = (dish.currency || 'INR') as any
  const convertedPrice = convertPrice(dish.price, dishCurrency)
  const convertedOriginalPrice = dish.originalPrice ? convertPrice(dish.originalPrice, dishCurrency) : null

  return (
    <div onClick={handleCardClick} className="rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer card-hover" style={{ backgroundColor: '#ffffff', border: '1.5px solid #99f6e4', boxShadow: '0 2px 12px rgba(13,148,136,0.07)' }}>
      {/* Dish Image */}
      <div className="aspect-square relative overflow-hidden">
        {dish.imageUrls && dish.imageUrls.length > 0 ? (
          <Image
            src={dish.imageUrls[0]}
            alt={dish.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            onError={() => handleImageError('image-0')}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)' }}>
            <span className="text-4xl font-bold text-center" style={{ color: '#0d9488' }}>
              {dish.name.charAt(0)}
            </span>
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
          <div className="flex space-x-2 sm:space-x-3">
            <button 
              onClick={handleSetReminder}
              disabled={isReminderSet}
              className="w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110"
              style={{ backgroundColor: '#0d9488', color: 'white' }}
              title="Set Reminder"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button 
              onClick={handleToggleFavorite}
              disabled={loading}
              className="w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110"
              style={{ backgroundColor: isFavorite ? '#dc2626' : '#0d9488', color: 'white' }}
              title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            >
              <HeartIcon className="w-4 h-4 sm:w-5 sm:h-5" filled={isFavorite} />
            </button>
            <button 
              onClick={handleQuickView}
              className="w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110"
              style={{ backgroundColor: '#0d9488', color: 'white' }}
              title="Quick View"
            >
              <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
        
        {/* Veg/Non-veg indicator */}
        <div className="absolute top-3 left-3 z-20">
          <div className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center bg-white ${dish.isVeg ? 'border-green-600' : 'border-red-600'}`}>
            <div className={`w-2 h-2 ${dish.isVeg ? 'bg-green-600 rounded-full' : 'bg-red-600 rounded-sm'}`}></div>
          </div>
        </div>

        {dish.discountPercentage && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-bold z-20">
            {dish.discountPercentage}% OFF
          </div>
        )}

        {status && (
          <div className={`absolute top-12 left-3 text-white px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 z-10 ${
            status.includes('Sold Out') ? 'bg-red-500' :
            status.includes('Preparing') ? 'bg-yellow-500' : 'bg-green-500'
          }`}>
            <Clock className={`h-3 w-3 ${status.includes('Preparing') ? 'animate-spin' : ''}`} />
            {status}
          </div>
        )}
        


        {dish.shop.distance !== undefined && (
          <div className={`absolute ${dish.discountPercentage ? 'top-12' : 'top-3'} right-3 bg-primary text-primary-foreground shadow-md px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 z-10`}>
            <MapPin className="h-3 w-3" />
            {dish.shop.distance < 1 ? `${Math.round(dish.shop.distance * 1000)}m` : `${dish.shop.distance.toFixed(1)}km`}
          </div>
        )}
      </div>

      {/* Dish Info */}
      <div className="block p-4 transition-colors">
        <div className="text-center mb-3">
          <h3 className="font-semibold mb-1 text-lg" style={{ color: '#134e4a' }}>
            {dish.name}
          </h3>
          {dish.description && (
            <p className="text-sm line-clamp-2 mb-2" style={{ color: '#0f766e' }}>
              {dish.description}
            </p>
          )}
        </div>
        
        {/* Shop Info */}
        <div className="flex items-center justify-center mb-3 space-x-2">
          {dish.shop.logoUrl ? (
            <Image src={dish.shop.logoUrl} alt={dish.shop.name} width={20} height={20} className="rounded-full" />
          ) : (
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0d9488' }}>
              <span className="text-xs font-bold text-white">{dish.shop.name.charAt(0)}</span>
            </div>
          )}
          <span className="text-sm font-medium" style={{ color: '#451a03' }}>{dish.shop.name}</span>
          {dish.avgRating > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-yellow-500">★</span>
              <span className="text-xs" style={{ color: '#0f766e' }}>{dish.avgRating.toFixed(1)}</span>
              {dish.reviews.length > 0 && (
                <span className="text-xs" style={{ color: '#0f766e' }}>({dish.reviews.length})</span>
              )}
            </div>
          )}
        </div>
        
        {/* Price */}
        <div className="text-center">
          {convertedOriginalPrice && dish.discountPercentage ? (
            <div className="flex items-center justify-center space-x-2">
              <p className="text-sm line-through" style={{ color: '#0f766e' }}>
                {formatPrice(convertedOriginalPrice)}
              </p>
              <p className="text-xl font-bold" style={{ color: '#0d9488' }}>
                {formatPrice(convertedPrice)}
              </p>
            </div>
          ) : (
            <p className="text-xl font-bold" style={{ color: '#134e4a' }}>
              {formatPrice(convertedPrice)}
            </p>
          )}
        </div>
      </div>
      
      <ReminderDrawer 
        isOpen={isReminderDrawerOpen}
        onOpenChange={setIsReminderDrawerOpen}
        dish={{
          id: dish.id,
          name: dish.name,
          status: status,
          timings: dish.timings
        }}
        onReminderSet={() => setIsReminderSet(true)}
      />
      
      <QuickViewModal 
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        dish={{
          id: dish.id,
          name: dish.name,
          slug: dish.slug,
          description: dish.description,
          imageUrls: dish.imageUrls,
          price: dish.price,
          originalPrice: dish.originalPrice,
          discountPercentage: dish.discountPercentage,
          timings: dish.timings,
          shop: {
            name: dish.shop.name,
            logoUrl: dish.shop.logoUrl,
            distance: dish.shop.distance
          }
        }}
      />
    </div>
  )
}