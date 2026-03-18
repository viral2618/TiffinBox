import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Clock, Calendar, ChefHat, CalendarClock, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice, getTimeRange, formatTime, formatDate } from '@/lib/utils'
import CurrencyConverter from '@/components/CurrencyConverter'
import BackButton from '@/components/BackButton'
import TodaysSchedule from '@/components/dishes/TodaysSchedule'
import YouMayAlsoLike from '@/components/dishes/YouMayAlsoLike'
import ShopDetailsDropdown from '@/components/dishes/ShopDetailsDropdown'
import { ReviewSection } from '@/components/dishes/ReviewSection'
import ShopReviews from '@/components/dishes/ShopReviews'
import DishFavoriteButton from '@/components/dishes/DishFavoriteButton'
import DishImageStatus from '@/components/dishes/DishImageStatus'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

interface DishDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

async function getDish(slug: string) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    
    const dish = await prisma.dish.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrls: true,
        price: true,
        currency: true,
        originalPrice: true,
        discountPercentage: true,
        isVeg: true,
        categoryId: true,
        shopId: true,
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            address: true,
            contactPhone: true,
            whatsapp: true,
            openingHours: true
          }
        },
        category: true,
        subcategory: true,
        timings: true,
        dishTags: {
          include: {
            tag: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        },
        favorites: userId ? {
          where: {
            userId
          }
        } : false
      }
    })
    
    if (!dish) {
      notFound()
    }
    
    return dish
  } catch (error) {
    console.error('Database error:', error)
    notFound()
  }
}

export default async function DishDetailPage({ params }: DishDetailPageProps) {
  const { slug } = await params
  const dish = await getDish(slug)
  const isFavorite = dish.favorites ? dish.favorites.length > 0 : false
  
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-2">
          <BackButton 
            fallbackUrl={`/shops/${dish.shop.slug}`}
            fallbackText={`Back to ${dish.shop.name}`}
          />
          
          {dish.shop.address && (
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{dish.shop.address}</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side - Main Image */}
          <div className="lg:w-1/2">
            {dish.imageUrls && dish.imageUrls.length > 0 ? (
              <div className="relative aspect-square rounded-lg overflow-hidden border">
                <Image
                  src={dish.imageUrls[0]}
                  alt={dish.name}
                  width={600}
                  height={600}
                  className="object-cover w-full h-full"
                  priority
                />
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <DishImageStatus dishId={dish.id} />
                </div>
              </div>
            ) : (
              <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center border">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>
          
          {/* Right Side - Thumbnails and Product Info */}
          <div className="lg:w-1/2 flex flex-col gap-6">
            {/* Product Information */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{dish.name}</h1>
              <div className="flex items-center gap-3 mb-4">
                <CurrencyConverter basePrice={dish.price} />
                {dish.originalPrice && dish.originalPrice > dish.price && (() => {
                  const calculatedDiscount = dish.discountPercentage || Math.round(((dish.originalPrice - dish.price) / dish.originalPrice) * 100)
                  return (
                    <>
                      <span className="text-xl text-gray-500 line-through">{formatPrice(dish.originalPrice)}</span>
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                        {calculatedDiscount}% OFF
                      </span>
                    </>
                  )
                })()}
              </div>
              
              {/* Rating and Reviews */}
              {dish.reviews.length > 0 && (() => {
                const averageRating = dish.reviews.reduce((sum, review) => sum + review.rating, 0) / dish.reviews.length
                return (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-5 h-5 ${i < Math.round(averageRating) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-gray-600">({dish.reviews.length} {dish.reviews.length === 1 ? 'review' : 'reviews'})</span>
                  </div>
                )
              })()}
              
              {dish.description && (
                <p className="text-gray-600 leading-relaxed mb-6">{dish.description}</p>
              )}
              
              {/* Special badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {dish.isVeg && (
                  <Badge className="bg-green-600 text-white">Vegetarian</Badge>
                )}
              </div>
              
              {/* Today's Schedule - Horizontal Layout */}
              <div className="mb-6">
                <TodaysSchedule dish={dish} />
              </div>
              
              {/* Favorite Button */}
              <div className="mb-6">
                <DishFavoriteButton dishId={dish.id} initialIsFavorite={isFavorite} />
              </div>
              
              {/* Shop Details */}
              <ShopDetailsDropdown shop={dish.shop} />
            </div>
          </div>
        </div>
        

        
        {/* Reviews Section */}
        <div className="mt-12">
          <ReviewSection dishId={dish.id} />
        </div>
        
        {/* Shop Reviews Section */}
        <div className="mt-12">
          <ShopReviews 
            shopId={dish.shop.id}
            shopName={dish.shop.name}
            initialReviews={[]}
            totalReviews={0}
          />
        </div>
        
        {/* You May Also Like Section */}
        <YouMayAlsoLike 
          currentDishId={dish.id}
          categoryId={dish.categoryId}
          shopId={dish.shopId}
        />
      </div>
    </div>
  )
}