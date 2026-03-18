"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Star, Clock } from 'lucide-react'
import { useLocation } from '@/hooks/use-location'
import Image from 'next/image'

interface NearbyShop {
  id: string
  name: string
  slug: string
  description?: string
  logoUrl?: string
  bannerImage?: string
  distance?: number
  rating?: number
  reviewCount?: number
  isOpen?: boolean
}

export default function NearbyShopsSection() {
  const [shops, setShops] = useState<NearbyShop[]>([])
  const [loading, setLoading] = useState(true)
  const { location } = useLocation()
  const router = useRouter()

  useEffect(() => {
    fetchNearbyShops()
  }, [location])

  const fetchNearbyShops = async () => {
    try {
      const params = new URLSearchParams()
      if (location) {
        params.set('lat', location.lat.toString())
        params.set('lng', location.lng.toString())
        params.set('radius', '10')
      }
      params.set('limit', '4')

      const response = await fetch(`/api/shops?${params.toString()}`)
      const data = await response.json()
      setShops(data.shops || [])
    } catch (error) {
      console.error('Failed to fetch nearby shops:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleShopClick = (shop: NearbyShop) => {
    router.push(`/shops/${shop.slug}`)
  }

  if (loading) {
    return (
      <section className="py-8 px-4 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#451a03' }}>
          Nearby Shops
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (shops.length === 0) {
    return (
      <section className="py-8 px-4 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#451a03' }}>
          Nearby Shops
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-500">No shops found in your area</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 px-4 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#451a03' }}>
        Nearby Shops
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {shops.map((shop) => (
          <div
            key={shop.id}
            onClick={() => handleShopClick(shop)}
            className="cursor-pointer group rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300"
            style={{ backgroundColor: '#fef3e2', border: '1px solid rgba(69, 26, 3, 0.1)' }}
          >
            <div className="relative aspect-video overflow-hidden">
              {shop.bannerImage || shop.logoUrl ? (
                <Image
                  src={shop.bannerImage || shop.logoUrl!}
                  alt={shop.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #fef3e2 0%, #f3e8d3 100%)' }}
                >
                  <span className="text-4xl font-bold" style={{ color: '#fc7c7c' }}>
                    {shop.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-semibold mb-2" style={{ color: '#451a03' }}>
                {shop.name}
              </h3>
              
              {shop.description && (
                <p className="text-sm mb-3 line-clamp-2" style={{ color: '#92400e' }}>
                  {shop.description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs" style={{ color: '#92400e' }}>
                {shop.distance && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{shop.distance.toFixed(1)}km away</span>
                  </div>
                )}
                
                {shop.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{shop.rating.toFixed(1)}</span>
                    {shop.reviewCount && (
                      <span>({shop.reviewCount})</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}