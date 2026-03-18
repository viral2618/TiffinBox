"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useForm, ValidationError } from '@formspree/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star, MessageSquare, Trash2 } from 'lucide-react'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { data: session } = useSession()
  const [state, handleSubmit] = useForm("mvgeypld")
  const [rating, setRating] = useState(5)
  const [allowFollowUp, setAllowFollowUp] = useState(false)
  const [previousFeedback, setPreviousFeedback] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const resetForm = () => {
    setRating(5)
    setAllowFollowUp(false)
    setShowForm(true)
  }

  useEffect(() => {
    if (isOpen && session?.user) {
      fetchPreviousFeedback()
    }
  }, [isOpen, session?.user])

  const fetchPreviousFeedback = async () => {
    if (!session?.user?.email) {
      setShowForm(true)
      setLoading(false)
      return
    }
    
    try {
      const response = await fetch(`/api/feedback/user/${encodeURIComponent(session.user.email)}`)
      if (response.ok) {
        const data = await response.json()
        setPreviousFeedback(data.feedbacks || [])
        setShowForm(true)
      }
    } catch (error) {
      console.error('Error fetching previous feedback:', error)
      setShowForm(true)
    } finally {
      setLoading(false)
    }
  }

  if (state.succeeded) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Feedback Submitted</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <div className="mb-4">
              <MessageSquare className="h-16 w-16 mx-auto text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
            <p className="text-muted-foreground mb-4">
              Your feedback has been submitted successfully. We appreciate your input!
            </p>
            <div className="space-y-2">
              <Button onClick={() => {
                window.location.reload()
              }} className="w-full" variant="outline">
                Submit Another Feedback
              </Button>
              <Button onClick={onClose} className="w-full">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Share Your Feedback
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">
            <p>Loading...</p>
          </div>
        ) : (
          <>
            {previousFeedback.length > 0 && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-lg">You already given feedback</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Thank you for your previous feedback! You can submit another one below.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {previousFeedback.slice(0, 2).map((feedback, index) => (
                      <div key={index} className="p-3 bg-white rounded-lg relative group">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">{feedback.feedbackCategory}</span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < feedback.experienceRating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <button
                              onClick={async () => {
                                try {
                                  const response = await fetch(`/api/feedback/${feedback.id}`, {
                                    method: 'DELETE'
                                  })
                                  if (response.ok) {
                                    fetchPreviousFeedback()
                                  }
                                } catch (error) {
                                  console.error('Error deleting feedback:', error)
                                }
                              }}
                              className="p-1 hover:bg-red-100 rounded text-red-600"
                              title="Delete feedback"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{feedback.feedback}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    <div className="all-feedback hidden space-y-3">
                      {previousFeedback.slice(2).map((feedback, index) => (
                        <div key={index + 2} className="p-3 bg-white rounded-lg relative group">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium">{feedback.feedbackCategory}</span>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < feedback.experienceRating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <button
                                onClick={async () => {
                                  try {
                                    const response = await fetch(`/api/feedback/${feedback.id}`, {
                                      method: 'DELETE'
                                    })
                                    if (response.ok) {
                                      fetchPreviousFeedback()
                                    }
                                  } catch (error) {
                                    console.error('Error deleting feedback:', error)
                                  }
                                }}
                                className="p-1 hover:bg-red-100 rounded text-red-600"
                                title="Delete feedback"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{feedback.feedback}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(feedback.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {previousFeedback.length > 2 && (
                    <button 
                      onClick={() => {
                        const allFeedbackDiv = document.querySelector('.all-feedback')
                        if (allFeedbackDiv) {
                          allFeedbackDiv.classList.toggle('hidden')
                        }
                      }}
                      className="text-sm text-primary hover:underline text-center w-full mt-3"
                    >
                      +{previousFeedback.length - 2} more feedback(s)
                    </button>
                  )}
                </CardContent>
              </Card>
            )}
            <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Help Us Improve Sweet Bakery</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Your feedback is valuable to us. Please share your experience and suggestions.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={async (e) => {
                    e.preventDefault()
                    
                    const formData = new FormData(e.target as HTMLFormElement)
                    const data = {
                      fullName: formData.get('fullName'),
                      email: formData.get('email'),
                      contactNumber: formData.get('contactNumber'),
                      preferredBakery: formData.get('preferredBakery'),
                      feedbackCategory: formData.get('feedbackCategory'),
                      feedback: formData.get('feedback'),
                      experienceRating: rating,
                      allowFollowUp: allowFollowUp ? 'yes' : 'no',
                      userEmail: session?.user?.email
                    }
                    
                    await Promise.all([
                      handleSubmit(e),
                      fetch('/api/feedback', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                      })
                    ])
                    
                    // Dispatch custom event for notification
                    window.dispatchEvent(new CustomEvent('feedbackSubmitted', {
                      detail: { category: data.feedbackCategory }
                    }))
                    
                    setTimeout(() => {
                      fetchPreviousFeedback()
                    }, 1000)
                  }} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        defaultValue={session?.user?.name || ''}
                        required
                        placeholder="Enter your full name"
                      />
                      <ValidationError prefix="Full Name" field="fullName" errors={state.errors} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={session?.user?.email || ''}
                        required
                        placeholder="Enter your email address"
                      />
                      <ValidationError prefix="Email" field="email" errors={state.errors} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactNumber">Contact Number (Optional)</Label>
                      <Input
                        id="contactNumber"
                        name="contactNumber"
                        type="tel"
                        placeholder="Enter 10-digit contact number"
                        maxLength={10}
                        pattern="[0-9]{10}"
                        onInput={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.value = target.value.replace(/[^0-9]/g, '').slice(0, 10);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferredBakery">Preferred Bakery / Shop (Optional)</Label>
                      <Input
                        id="preferredBakery"
                        name="preferredBakery"
                        placeholder="Enter your preferred bakery name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="feedbackCategory">Feedback Category *</Label>
                      <Select name="feedbackCategory" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select feedback category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="Home">Home</SelectItem>
                          <SelectItem value="Shops">Shops</SelectItem>
                          <SelectItem value="Dishes">Dishes</SelectItem>
                          <SelectItem value="Categories">Categories</SelectItem>
                          <SelectItem value="General">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="feedback">Your Feedback / Suggestion *</Label>
                      <Textarea
                        id="feedback"
                        name="feedback"
                        required
                        placeholder="Please share your feedback, suggestions, or any issues you've encountered..."
                        rows={4}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Overall Experience Rating *</Label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`h-8 w-8 ${
                                star <= rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-muted-foreground">
                          {rating} out of 5 stars
                        </span>
                      </div>
                      <input type="hidden" name="experienceRating" value={rating} />
                    </div>

                    <div className="space-y-3">
                      <Label>Permission for Follow-up</Label>
                      <RadioGroup
                        value={allowFollowUp ? 'yes' : 'no'}
                        onValueChange={(value) => setAllowFollowUp(value === 'yes')}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="followup-yes" />
                          <Label htmlFor="followup-yes">Yes, you may contact me for follow-up</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="followup-no" />
                          <Label htmlFor="followup-no">No, please don't contact me</Label>
                        </div>
                      </RadioGroup>
                      <input type="hidden" name="allowFollowUp" value={allowFollowUp ? 'yes' : 'no'} />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={state.submitting}
                        className="flex-1"
                      >
                        {state.submitting ? 'Submitting...' : 'Submit Feedback'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}