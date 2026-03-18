"use client"

import { useState, useEffect } from 'react'
import { MessageSquare, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReviewForm } from './ReviewForm'
import { ReviewList } from './ReviewList'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

interface Review {
  id: string
  rating: number
  comment?: string
  createdAt: string
  user: {
    id: string
    name: string
  }
}

interface ReviewData {
  reviews: Review[]
  totalCount: number
  averageRating: number
  currentPage: number
  totalPages: number
}

interface ReviewSectionProps {
  dishId: string
}

export function ReviewSection({ dishId }: ReviewSectionProps) {
  const { isAuthenticated, session } = useAuth()
  const [reviewData, setReviewData] = useState<ReviewData | null>(null)
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('reviews')

  useEffect(() => {
    fetchReviews()
  }, [dishId])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?dishId=${dishId}`)
      if (response.ok) {
        const data = await response.json()
        setReviewData(data)
        
        // Find user's existing review
        if (isAuthenticated && session?.user?.id) {
          const existingReview = data.reviews.find(
            (review: Review) => review.user.id === session.user.id
          )
          setUserReview(existingReview || null)
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitReview = async (rating: number, comment?: string) => {
    console.log('ReviewSection - Submitting review:', { dishId, rating, comment, isAuthenticated, userId: session?.user?.id })
    
    if (!isAuthenticated) {
      toast.error('Please log in to leave a review')
      return
    }

    setIsSubmitting(true)
    try {
      const requestBody = {
        dishId,
        rating,
        comment,
      }
      console.log('ReviewSection - Request body:', requestBody)
      
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('ReviewSection - Response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('ReviewSection - Success result:', result)
        toast.success('Review submitted successfully!')
        // Dispatch custom event for notification
        window.dispatchEvent(new CustomEvent('reviewSubmitted', {
          detail: { name: 'Dish' }
        }))
        await fetchReviews()
        setActiveTab('reviews')
      } else {
        const error = await response.json()
        console.log('ReviewSection - Error response:', error)
        toast.error(error.error || 'Failed to submit review')
      }
    } catch (error) {
      console.error('ReviewSection - Error submitting review:', error)
      toast.error('Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Reviews & Ratings</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Reviews ({reviewData?.totalCount || 0})
          </TabsTrigger>
          <TabsTrigger value="write" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            {userReview ? 'Your Review' : 'Write Review'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="mt-6">
          {reviewData && (
            <ReviewList
              reviews={reviewData.reviews}
              averageRating={reviewData.averageRating}
              totalCount={reviewData.totalCount}
            />
          )}
        </TabsContent>

        <TabsContent value="write" className="mt-6">
          <ReviewForm
            dishId={dishId}
            existingReview={userReview ? {
              rating: userReview.rating,
              comment: userReview.comment
            } : undefined}
            onSubmit={handleSubmitReview}
            isSubmitting={isSubmitting}
          />
        </TabsContent>
      </Tabs>
    </Card>
  )
}