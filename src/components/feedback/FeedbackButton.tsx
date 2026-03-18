"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'
import FeedbackModal from './FeedbackModal'

interface FeedbackButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export default function FeedbackButton({ 
  variant = 'outline', 
  size = 'sm',
  className = '' 
}: FeedbackButtonProps) {
  const [showFeedback, setShowFeedback] = useState(false)

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowFeedback(true)}
        className={`flex items-center gap-2 ${className}`}
      >
        <MessageSquare className="h-4 w-4" />
        Feedback
      </Button>
      
      <FeedbackModal 
        isOpen={showFeedback} 
        onClose={() => setShowFeedback(false)} 
      />
    </>
  )
}