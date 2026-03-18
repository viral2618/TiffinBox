"use client"

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'

export interface LocationData {
  lat: number
  lng: number
  address?: {
    street?: string
    city?: string
    state?: string
    country?: string
    formattedAddress?: string
  }
}

interface UseLocationReturn {
  location: LocationData | null
  isLoading: boolean
  error: string | null
  isEnabled: boolean
  getCurrentLocation: () => Promise<void>
  toggleLocation: () => void
  clearLocation: () => void
  forceRefreshLocation: () => Promise<void>
}

// Cookie helpers with better performance
const LOCATION_COOKIE_NAME = 'user_location'
const LOCATION_DISABLED_COOKIE_NAME = 'user_location_disabled'
const COOKIE_EXPIRY_DAYS = 7

// Memoized cookie operations
const cookieCache = new Map<string, string | null>()

function setCookie(name: string, value: string, days: number) {
  if (typeof window === 'undefined') return
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  const cookieString = `${name}=${value};expires=${expires.toUTCString()};path=/`
  document.cookie = cookieString
  cookieCache.set(name, value)
}

function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null
  
  // Check cache first
  if (cookieCache.has(name)) {
    return cookieCache.get(name) || null
  }
  
  const nameEQ = name + '='
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) {
      const value = c.substring(nameEQ.length, c.length)
      cookieCache.set(name, value)
      return value
    }
  }
  cookieCache.set(name, null)
  return null
}

function deleteCookie(name: string) {
  if (typeof window === 'undefined') return
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
  cookieCache.delete(name)
}

export function useLocation(): UseLocationReturn {
  const searchParams = useSearchParams()
  const [location, setLocation] = useState<LocationData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEnabled, setIsEnabled] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Initialize location from URL params or cookies only (no automatic geolocation)
  useEffect(() => {
    if (initialized) return
    
    const initializeLocation = async () => {
      // Check if user has explicitly disabled location
      const isDisabled = getCookie(LOCATION_DISABLED_COOKIE_NAME)
      if (isDisabled === 'true') {
        setInitialized(true)
        return
      }
      
      // First check URL parameters
      const lat = searchParams?.get('lat')
      const lng = searchParams?.get('lng')
      
      if (lat && lng) {
        const locationData: LocationData = {
          lat: parseFloat(lat),
          lng: parseFloat(lng)
        }
        
        setLocation(locationData)
        setIsEnabled(true)
        setCookie(LOCATION_COOKIE_NAME, JSON.stringify(locationData), COOKIE_EXPIRY_DAYS)
        
        // Get address in background
        reverseGeocode(locationData.lat, locationData.lng).then(address => {
          const updatedLocationData = { ...locationData, address }
          setLocation(updatedLocationData)
          setCookie(LOCATION_COOKIE_NAME, JSON.stringify(updatedLocationData), COOKIE_EXPIRY_DAYS)
        }).catch(err => {
          console.error('Failed to get address for URL coordinates:', err)
        })
        setInitialized(true)
        return
      }
      
      // Check cookies for previously saved location (only if user explicitly enabled it)
      const savedLocation = getCookie(LOCATION_COOKIE_NAME)
      if (savedLocation) {
        try {
          const locationData = JSON.parse(savedLocation) as LocationData
          setLocation(locationData)
          setIsEnabled(true)
        } catch (err) {
          console.error('Failed to parse saved location:', err)
          deleteCookie(LOCATION_COOKIE_NAME)
        }
      }
      
      setInitialized(true)
    }
    
    initializeLocation()
  }, [searchParams, initialized])

  // Memoize reverse geocoding with cache
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<LocationData['address']> => {
    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`
    const cached = sessionStorage.getItem(`geocode_${cacheKey}`)
    
    if (cached) {
      try {
        return JSON.parse(cached)
      } catch {
        sessionStorage.removeItem(`geocode_${cacheKey}`)
      }
    }
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'WhenFresh/1.0'
          },
          signal: controller.signal
        }
      )
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error('Failed to fetch address')
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      const address = data.address || {}
      
      // Prioritize city/area names over business names
      const city = address.city || address.town || address.village || address.municipality || address.county || address.state_district
      const state = address.state || address.province || address.region
      
      console.log('Reverse geocode raw address:', address)
      console.log('Extracted city:', city, 'state:', state)
      
      const result = {
        street: address.road || address.house_number ? 
          `${address.house_number || ''} ${address.road || ''}`.trim() : undefined,
        city: city,
        state: state,
        country: address.country,
        formattedAddress: city && state ? `${city}, ${state}` : (city || state || data.display_name)
      }
      
      // Cache the result
      sessionStorage.setItem(`geocode_${cacheKey}`, JSON.stringify(result))
      
      return result
    } catch (err) {
      console.warn('Reverse geocoding failed, using coordinates:', err)
      const fallback = {
        formattedAddress: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      }
      sessionStorage.setItem(`geocode_${cacheKey}`, JSON.stringify(fallback))
      return fallback
    }
  }, [])

  const getCurrentLocation = useCallback(async (): Promise<void> => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000
          }
        )
      })

      const { latitude, longitude } = position.coords
      
      const locationData: LocationData = {
        lat: latitude,
        lng: longitude
      }
      
      setLocation(locationData)
      setIsEnabled(true)
      setCookie(LOCATION_COOKIE_NAME, JSON.stringify(locationData), COOKIE_EXPIRY_DAYS)
      
      // Get address in background
      reverseGeocode(latitude, longitude).then(address => {
        const updatedLocationData = { ...locationData, address }
        setLocation(updatedLocationData)
        setCookie(LOCATION_COOKIE_NAME, JSON.stringify(updatedLocationData), COOKIE_EXPIRY_DAYS)
      }).catch(err => {
        console.error('Background reverse geocoding failed:', err)
      })
    } catch (err) {
      let errorMessage = 'Unable to get your precise location'
      
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Using approximate location.'
            break
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Precise location unavailable. Using approximate location.'
            break
          case err.TIMEOUT:
            errorMessage = 'Location request timed out. Using approximate location.'
            break
        }
      }
      
      setError(errorMessage)
      
      // Fallback to IP location if precise location fails
      try {
        const response = await fetch('/api/location/ip')
        const data = await response.json()
        
        if (data.location) {
          const locationData: LocationData = {
            lat: data.location.lat,
            lng: data.location.lng,
            address: {
              city: data.location.city,
              country: data.location.country,
              formattedAddress: `${data.location.city}, ${data.location.country}`
            }
          }
          
          setLocation(locationData)
          setIsEnabled(true)
          setCookie(LOCATION_COOKIE_NAME, JSON.stringify(locationData), COOKIE_EXPIRY_DAYS)
        }
      } catch (ipError) {
        console.error('IP location fallback failed:', ipError)
        setIsEnabled(false)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const toggleLocation = useCallback(() => {
    if (isEnabled && location) {
      // Disable location
      setLocation(null)
      setIsEnabled(false)
      setError(null)
      
      // Mark as explicitly disabled
      setCookie(LOCATION_DISABLED_COOKIE_NAME, 'true', COOKIE_EXPIRY_DAYS)
      deleteCookie(LOCATION_COOKIE_NAME)
    } else {
      // Enable location
      deleteCookie(LOCATION_DISABLED_COOKIE_NAME)
      getCurrentLocation()
    }
  }, [isEnabled, location, getCurrentLocation])

  const clearLocation = useCallback(() => {
    setLocation(null)
    setIsEnabled(false)
    setError(null)
    
    // Remove from cookies and mark as disabled
    deleteCookie(LOCATION_COOKIE_NAME)
    setCookie(LOCATION_DISABLED_COOKIE_NAME, 'true', COOKIE_EXPIRY_DAYS)
  }, [])

  const forceRefreshLocation = useCallback(async () => {
    // Clear all location data
    deleteCookie(LOCATION_COOKIE_NAME)
    deleteCookie(LOCATION_DISABLED_COOKIE_NAME)
    setLocation(null)
    setIsEnabled(false)
    setError(null)
    
    // Force get fresh location
    await getCurrentLocation()
  }, [getCurrentLocation])

  return {
    location,
    isLoading,
    error,
    isEnabled,
    getCurrentLocation,
    toggleLocation,
    clearLocation,
    forceRefreshLocation
  }
}