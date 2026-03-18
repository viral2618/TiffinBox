"use client"

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  fallbackUrl?: string
  fallbackText?: string
}

export default function BackButton({ fallbackUrl, fallbackText }: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else if (fallbackUrl) {
      router.push(fallbackUrl)
    }
  }

  return (
    <button 
      onClick={handleBack}
      className="inline-flex items-center text-gray-600 hover:text-gray-900"
    >
      <ArrowLeft className="h-4 w-4 mr-1" />
      {fallbackText || 'Back'}
    </button>
  )
}