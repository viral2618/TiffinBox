"use client"

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { ShopReviewForm } from './ShopReviewForm'
import { ShopReviewList } from './ShopReviewList'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star } from 'lucide-react'

interface ShopReview {
  id: string
  rating: number
  comment?: string
  createdAt: string
  user?: {
    id: string
    name: string
  }
}

interface ShopReviewSectionProps {
  shopId: string
}

export function ShopReviewSection({ shopId }: ShopReviewSectionProps) {
  const { session, isAuthenticated } = useAuth()
  const [reviews, setReviews] = useState<ShopReview[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [userReview, setUserReview] = useState<{ rating: number; comment?: string } | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/shop-reviews?shopId=${shopId}`)
      if (!response.ok) throw new Error('Failed to fetch reviews')
      
      const data = await response.json()
      setReviews(data.reviews || [])
      setAverageRating(data.averageRating || 0)
      setTotalCount(data.totalCount || 0)
      
      // Check if current user has already reviewed
      if (isAuthenticated && session?.user?.id && data.reviews) {
        const existingReview = data.reviews.find(
          (review: ShopReview) => review.user?.id === session.user?.id
        )
        if (existingReview) {
          setUserReview({
            rating: existingReview.rating,
            comment: existingReview.comment
          })
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      // Set default values on error
      setReviews([])
      setAverageRating(0)
      setTotalCount(0)
      toast.error('Failed to load reviews')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [shopId, isAuthenticated, session?.user?.id])

  // Submit review
  const handleSubmitReview = async (rating: number, comment?: string) => {
    if (!isAuthenticated) {
      toast.error('Please log in to submit a review')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/shop-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shopId,
          rating,
          comment,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit review')
      }

      toast.success('Review submitted successfully!', {
        className: 'bg-gray-400 text-white border-gray-400',
        style: {
          backgroundColor: '#9ca3af !important',
          color: 'white !important',
          border: '1px solid #9ca3af !important'
        }
      })
      await fetchReviews() // Refresh reviews
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Shop Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          Shop Reviews
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="reviews" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reviews">
              Reviews ({totalCount})
            </TabsTrigger>
            <TabsTrigger value="write-review">
              Write Review
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="reviews" className="mt-6">
            <ShopReviewList
              reviews={reviews}
              averageRating={averageRating}
              totalCount={totalCount}
            />
          </TabsContent>
          
          <TabsContent value="write-review" className="mt-6">
            <ShopReviewForm
              shopId={shopId}
              existingReview={userReview}
              onSubmit={handleSubmitReview}
              isSubmitting={isSubmitting}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}