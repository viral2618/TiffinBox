"use client"

import { useState, useEffect } from 'react'
import { Star, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Review {
  id: string
  rating: number
  comment: string
  userName: string
  userAvatar?: string
  createdAt: string
}

interface ShopReviewsProps {
  shopId: string
  shopName: string
  initialReviews?: Review[]
  totalReviews?: number
}

export default function ShopReviews({ 
  shopId, 
  shopName, 
  initialReviews = [], 
  totalReviews = 0 
}: ShopReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(totalReviews > 10)

  const loadMoreReviews = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/shop-reviews?shopId=${shopId}&skip=${reviews.length}&limit=10`)
      if (!response.ok) {
        throw new Error('Failed to fetch reviews')
      }
      const data = await response.json()
      
      if (data.reviews) {
        setReviews(prev => [...prev, ...data.reviews])
        setHasMore(data.hasMore)
      }
    } catch (error) {
      console.error('Failed to load more reviews:', error)
      // Don't show error to user, just stop loading
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No reviews yet for {shopName}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold" style={{ color: '#451a03' }}>
        Reviews for {shopName} ({totalReviews})
      </h3>
      
      <div className="space-y-4">
        {reviews.map((review) => (
          <div 
            key={review.id} 
            className="p-4 rounded-lg border"
            style={{ backgroundColor: '#fef3e2', borderColor: 'rgba(69, 26, 3, 0.1)' }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {review.userAvatar ? (
                  <img 
                    src={review.userAvatar} 
                    alt={review.userName}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#fc7c7c' }}
                  >
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium" style={{ color: '#451a03' }}>
                      {review.userName}
                    </p>
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                
                {review.comment && (
                  <p className="text-sm" style={{ color: '#92400e' }}>
                    {review.comment}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="text-center pt-4">
          <Button
            onClick={loadMoreReviews}
            disabled={loading}
            variant="outline"
            style={{ 
              borderColor: '#fc7c7c', 
              color: '#451a03',
              backgroundColor: 'transparent'
            }}
          >
            {loading ? 'Loading...' : 'Load More Reviews'}
          </Button>
        </div>
      )}
    </div>
  )
}