"use client"

import Image, { ImageProps } from 'next/image'
import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string
  showLoader?: boolean
  loaderClassName?: string
  errorClassName?: string
  onLoadComplete?: () => void
  onError?: () => void
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  fallbackSrc = '/placeholder.svg',
  showLoader = true,
  loaderClassName,
  errorClassName,
  onLoadComplete,
  onError,
  priority = false,
  quality = 75,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    onLoadComplete?.()
  }, [onLoadComplete])

  const handleError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
    }
    onError?.()
  }, [currentSrc, fallbackSrc, onError])

  return (
    <div className="relative overflow-hidden">
      {isLoading && showLoader && (
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse",
            loaderClassName
          )}
        />
      )}
      
      <Image
        src={currentSrc}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          hasError && errorClassName,
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        priority={priority}
        quality={quality}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        {...props}
      />
    </div>
  )
}

export default OptimizedImage

export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(url => 
      new Promise<void>((resolve, reject) => {
        const img = new window.Image()
        img.onload = () => resolve()
        img.onerror = reject
        img.src = url
      })
    )
  )
}

export function useImageLazyLoading() {
  const [loadedImages, setLoadedImages] = useState(new Set<string>())

  const markAsLoaded = useCallback((src: string) => {
    setLoadedImages(prev => new Set(prev).add(src))
  }, [])

  const isLoaded = useCallback((src: string) => {
    return loadedImages.has(src)
  }, [loadedImages])

  return { markAsLoaded, isLoaded }
}