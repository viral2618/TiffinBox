"use client"

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

interface ShopReviewFormProps {
  shopId: string
  existingReview?: {
    rating: number
    comment?: string
  }
  onSubmit: (rating: number, comment?: string) => Promise<void>
  isSubmitting?: boolean
}

export function ShopReviewForm({ shopId, existingReview, onSubmit, isSubmitting }: ShopReviewFormProps) {
  const { isAuthenticated } = useAuth()
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [comment, setComment] = useState(existingReview?.comment || '')
  const [hoveredRating, setHoveredRating] = useState(0)

  if (!isAuthenticated) {
    return (
      <div className="text-center py-6 text-gray-500">
        Please log in to leave a review
      </div>
    )
  }

  // If user already has a review, show it as read-only
  if (existingReview) {
    return (
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="font-medium text-gray-900 mb-3">Your Review</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "w-6 h-6",
                    star <= existingReview.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
          </div>
          {existingReview.comment && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment
              </label>
              <div className="bg-white p-3 rounded border text-gray-900">
                {existingReview.comment}
              </div>
            </div>
          )}
          <div className="mt-4 text-sm text-gray-500">
            You have already reviewed this shop. Reviews cannot be changed once submitted.
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) return
    
    await onSubmit(rating, comment.trim() || undefined)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating *
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="p-2 transition-all duration-200 rounded-lg hover:bg-orange-100 active:bg-orange-200 active:scale-95 hover:scale-110"
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
            >
              <Star
                className={cn(
                  "w-6 h-6 transition-colors",
                  (hoveredRating >= star || rating >= star)
                    ? "fill-orange-400 text-orange-400"
                    : "text-orange-200 hover:text-orange-300"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Comment (Optional)
        </label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this shop..."
          rows={3}
          maxLength={500}
        />
        <div className="text-xs text-gray-500 mt-1">
          {comment.length}/500 characters
        </div>
      </div>

      <Button
        type="submit"
        disabled={rating === 0 || isSubmitting}
        className="w-full bg-gradient-to-r from-red-400 to-orange-500 hover:from-red-500 hover:to-orange-600 active:from-red-600 active:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl active:shadow-md transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  )
}