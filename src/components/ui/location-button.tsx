"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Loader2, MapPinOff, Check } from 'lucide-react'
import { useLocation, LocationData } from '@/hooks/use-location'
import { cn } from '@/lib/utils'

interface LocationButtonProps {
  onLocationChange?: (location: LocationData | null) => void
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  showAddress?: boolean
}

export function LocationButton({ 
  onLocationChange, 
  className,
  variant = 'outline',
  size = 'default',
  showAddress = true
}: LocationButtonProps) {
  const { location, isLoading, error, isEnabled, toggleLocation, clearLocation, forceRefreshLocation } = useLocation()
  const [showError, setShowError] = useState(false)
  const lastNotifiedLocation = useRef<LocationData | null>(null)

  // Notify parent component of location changes with proper comparison
  const notifyLocationChange = useCallback((newLocation: LocationData | null) => {
    if (onLocationChange && newLocation !== lastNotifiedLocation.current) {
      lastNotifiedLocation.current = newLocation
      onLocationChange(newLocation)
    }
  }, [onLocationChange])

  useEffect(() => {
    notifyLocationChange(location)
  }, [location, notifyLocationChange])

  // Show error temporarily
  useEffect(() => {
    if (error) {
      setShowError(true)
      const timer = setTimeout(() => setShowError(false), 3000)
      return () => clearTimeout(timer)
    }
    return undefined;
  }, [error])

  const handleClearLocation = useCallback(() => {
    clearLocation()
    notifyLocationChange(null)
  }, [clearLocation, notifyLocationChange])

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Getting location...</span>
        </>
      )
    }

    if (isEnabled && location) {
      const displayText = location.address?.city || 
                         location.address?.state || 
                         `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
      return (
        <>
          <Check className="h-4 w-4 text-green-600" />
          <span>{displayText}</span>
        </>
      )
    }

    return (
      <>
        <MapPin className="h-4 w-4" />
        <span>Use my location</span>
      </>
    )
  }

  const getButtonVariant = () => {
    if (isEnabled && location) {
      return 'default'
    }
    return variant
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Button
        variant={getButtonVariant()}
        size={size}
        onClick={toggleLocation}
        disabled={isLoading}
        className={cn(
          "flex items-center gap-2 w-full transition-all duration-200",
          isEnabled && location && "bg-primary hover:bg-primary/90 text-primary-foreground"
        )}
      >
        {getButtonContent()}
      </Button>

      {/* Location Address Display */}
      {showAddress && location && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs bg-gray-400">
              Current Location
            </Badge>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => forceRefreshLocation()}
                className="h-6 w-6 p-0 hover:bg-blue-100"
                title="Refresh location"
              >
                <span className="text-xs">🔄</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearLocation}
                className="h-6 w-6 p-0 hover:bg-destructive/10"
                title="Clear location"
              >
                <MapPinOff className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="text-xs text-muted-foreground space-y-0.5 p-2 bg-muted/50 rounded-md">
            {location.address?.street && (
              <div className="font-medium">{location.address.street}</div>
            )}
            <div className="flex flex-wrap gap-1">
              {location.address?.city && (
                <span>{location.address.city}</span>
              )}
              {location.address?.city && location.address?.state && (
                <span>,</span>
              )}
              {location.address?.state && (
                <span>{location.address.state}</span>
              )}
            </div>
            {location.address?.country && (
              <div className="text-muted-foreground/70">{location.address.country}</div>
            )}
            <div className="text-xs text-muted-foreground/60 mt-1 font-mono">
              Location detected
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {showError && error && (
        <div className="text-xs text-destructive bg-destructive/10 p-2 rounded-md">
          {error}
        </div>
      )}
    </div>
  )
}