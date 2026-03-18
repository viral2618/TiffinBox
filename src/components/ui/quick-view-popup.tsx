"use client"

import React, { ReactNode, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { X, Star, MapPin, Clock, ChefHat } from 'lucide-react'
import { formatPrice, formatTime } from '@/lib/utils'
import CurrencyConverter from '@/components/CurrencyConverter'

interface QuickViewPopupProps {
  isOpen: boolean
  onClose: () => void
  item: {
    id: string
    name: string
    description?: string
    imageUrls?: string[]
    price: number
    originalPrice?: number
    discountPercentage?: number
    timings?: Array<{
      preparedAt: { hour: number; minute: number }
      servedFrom: { hour: number; minute: number }
      servedUntil: { hour: number; minute: number }
    }>
    shop?: {
      name: string
      logoUrl?: string
      distance?: number
      rating?: number
      reviewCount?: number
    }
  }
  actions?: ReactNode
  showShopInfo?: boolean
}

export function QuickViewPopup({ isOpen, onClose, item, actions, showShopInfo = false }: QuickViewPopupProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!isOpen || !mounted) return null

  const shopData = item.shop ? {
    ...item.shop,
    distance: item.shop.distance ?? 1.2,
    rating: item.shop.rating ?? 4.5,
    reviewCount: item.shop.reviewCount ?? 128
  } : null

  const priceData = {
    ...item,
    originalPrice: item.originalPrice ?? (item.price * 1.25)
  }

  const calculatedDiscount = priceData.originalPrice && priceData.originalPrice > item.price 
    ? Math.round(((priceData.originalPrice - item.price) / priceData.originalPrice) * 100)
    : item.discountPercentage || 0

  const formatDistance = (distance: number) => {
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`
  }

  const getDishStatus = () => {
    if (!item?.timings || item.timings.length === 0) return { status: 'unavailable', message: 'No schedule available' }
    
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTime = currentHour * 60 + currentMinute
    
    const timing = item.timings[0]
    const preparedAtTime = timing.preparedAt.hour * 60 + timing.preparedAt.minute
    const servedFromTime = timing.servedFrom.hour * 60 + timing.servedFrom.minute
    const servedUntilTime = timing.servedUntil.hour * 60 + timing.servedUntil.minute
    
    if (currentTime < preparedAtTime) {
      const timeUntilPrep = preparedAtTime - currentTime
      const hours = Math.floor(timeUntilPrep / 60)
      const minutes = timeUntilPrep % 60
      return {
        status: 'preparing',
        message: `Baking starts in ${hours > 0 ? `${hours}h ` : ''}${minutes}m`,
        nextTime: formatTime(timing.preparedAt.hour, timing.preparedAt.minute)
      }
    } else if (currentTime >= preparedAtTime && currentTime < servedFromTime) {
      const timeUntilServe = servedFromTime - currentTime
      const hours = Math.floor(timeUntilServe / 60)
      const minutes = timeUntilServe % 60
      return {
        status: 'baking',
        message: `Currently baking - Ready in ${hours > 0 ? `${hours}h ` : ''}${minutes}m`,
        nextTime: formatTime(timing.servedFrom.hour, timing.servedFrom.minute)
      }
    } else if (currentTime >= servedFromTime && currentTime <= servedUntilTime) {
      const timeUntilEnd = servedUntilTime - currentTime
      const hours = Math.floor(timeUntilEnd / 60)
      const minutes = timeUntilEnd % 60
      return {
        status: 'serving',
        message: `Available now - ${hours > 0 ? `${hours}h ` : ''}${minutes}m left to order`,
        nextTime: formatTime(timing.servedUntil.hour, timing.servedUntil.minute)
      }
    } else {
      return {
        status: 'unavailable',
        message: 'Not available today',
        nextTime: 'Tomorrow'
      }
    }
  }

  const dishStatus = getDishStatus()
  const getStatusColor = () => {
    switch (dishStatus.status) {
      case 'serving': return 'bg-green-500'
      case 'baking': return 'bg-yellow-500'
      case 'preparing': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = () => {
    switch (dishStatus.status) {
      case 'serving': return Clock
      case 'baking': return ChefHat
      case 'preparing': return Clock
      default: return Clock
    }
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4 pb-16 md:pb-0" onClick={onClose}>
      <div className="rounded-t-2xl md:rounded-2xl max-w-3xl w-full max-h-[80vh] md:max-h-[85vh] overflow-hidden" style={{ backgroundColor: '#ffffff', border: '1.5px solid var(--brand-border)', boxShadow: '0 24px 64px rgba(13,148,136,0.18)' }} onClick={(e) => e.stopPropagation()}>
        <div className="relative flex flex-col md:flex-row h-auto md:h-[550px]">
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors"
            style={{ backgroundColor: 'var(--brand-warm)', color: 'var(--brand-text)' }}
          >
            <X className="w-4 h-4" />
          </button>
          
          {/* Left Side - Product Image */}
          <div className="w-full md:w-1/2 p-0 md:p-4 flex flex-col justify-center" style={{ backgroundColor: 'var(--brand-cream)' }}>
            <div className="flex items-center justify-center">
              <div className="w-full h-56 md:w-64 md:h-64 relative">
                {item.imageUrls && item.imageUrls.length > 0 ? (
                  <Image
                    src={item.imageUrls[0]}
                    alt={item.name}
                    fill
                    className="object-cover md:object-contain"
                    sizes="(max-width: 768px) 100vw, 320px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--brand-warm) 0%, var(--brand-muted) 100%)' }}>
                    <span className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--brand-primary)' }}>
                      {item.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Thumbnail Images */}
            {item.imageUrls && item.imageUrls.length > 1 && (
              <div className="flex gap-2 justify-center mt-3 px-4 md:px-0">
                {item.imageUrls.slice(0, 4).map((url, index) => (
                  <div key={index} className="w-10 h-10 md:w-14 md:h-14 relative rounded overflow-hidden" style={{ border: '2px solid var(--brand-border)' }}>
                    <Image
                      src={url}
                      alt={`${item.name} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 48px, 64px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Product Details */}
          <div className="w-full md:w-1/2 p-4 md:p-5 overflow-y-auto max-h-[45vh] md:max-h-full mb-6 md:mb-0">
            {/* Product Name */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-wide mb-3 sm:mb-4 pr-8" style={{ color: 'var(--brand-text)' }}>
              {item.name}
            </h2>

            {/* Price Section */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <CurrencyConverter basePrice={item.price} />
                {priceData.originalPrice && priceData.originalPrice > item.price && (
                  <span className="text-base sm:text-xl line-through" style={{ color: 'var(--brand-subtext)' }}>
                    {formatPrice(priceData.originalPrice)}
                  </span>
                )}
              </div>
              {calculatedDiscount > 0 && (
                <span className="px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#dc2626' }}>
                  {calculatedDiscount}% OFF
                </span>
              )}
            </div>

            {/* Product Description */}
            {item.description ? (
              <p className="text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6" style={{ color: 'var(--brand-subtext)' }}>
                {item.description}
              </p>
            ) : (
              <p className="italic mb-4 sm:mb-6 text-xs sm:text-sm" style={{ color: 'var(--brand-subtext)' }}>No description available</p>
            )}

            {/* Scheduling Info */}
            <div className="bg-primary/10 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <div className={`w-2 h-2 rounded-full ${dishStatus.status === 'serving' || dishStatus.status === 'baking' ? 'animate-pulse' : ''} ${getStatusColor()}`}></div>
                <h3 className="font-semibold text-primary text-sm sm:text-base">
                  {dishStatus.status === 'serving' ? 'Available Now' :
                   dishStatus.status === 'baking' ? 'Currently Baking' :
                   dishStatus.status === 'preparing' ? 'Preparing Soon' : 'Not Available'}
                </h3>
              </div>
              <div className="text-xs sm:text-sm space-y-1" style={{ color: 'var(--brand-subtext)' }}>
                <p>• {dishStatus.message}</p>
                {item.timings && item.timings[0] && (
                  <>
                    <p>• Serving hours: {formatTime(item.timings[0].servedFrom.hour, item.timings[0].servedFrom.minute)} - {formatTime(item.timings[0].servedUntil.hour, item.timings[0].servedUntil.minute)}</p>
                    <p>• Fresh batch at: {formatTime(item.timings[0].preparedAt.hour, item.timings[0].preparedAt.minute)}</p>
                  </>
                )}
              </div>
            </div>

            {/* Shop Info */}
            {showShopInfo && shopData && (
              <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6" style={{ backgroundColor: 'var(--brand-cream)', border: '1px solid var(--brand-border)' }}>
                {shopData.logoUrl ? (
                  <Image
                    src={shopData.logoUrl}
                    alt={shopData.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover sm:w-12 sm:h-12"
                  />
                ) : (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary text-white rounded-full flex items-center justify-center text-base sm:text-lg font-bold">
                    {shopData.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg truncate" style={{ color: 'var(--brand-text)' }}>{shopData.name}</h3>
                  <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm" style={{ color: 'var(--brand-subtext)' }}>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{formatDistance(shopData.distance)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                      <span>{shopData.rating.toFixed(1)}</span>
                      <span className="hidden sm:inline">({shopData.reviewCount.toLocaleString()})</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {actions && (
              <div className="flex gap-2 sm:gap-3 mb-6 md:mb-4">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  , document.body)
}