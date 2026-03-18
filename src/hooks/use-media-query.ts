"use client"

import { useState, useEffect } from 'react'

// Define breakpoints that match Tailwind's default breakpoints
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

type BreakpointKey = keyof typeof breakpoints

/**
 * Custom hook for responsive design
 * @param query The breakpoint to check (sm, md, lg, xl, 2xl)
 * @param direction 'up' means >= breakpoint, 'down' means < breakpoint
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: BreakpointKey, direction: 'up' | 'down' = 'up'): boolean {
  // Default to false for server-side rendering
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia(
        direction === 'up'
          ? `(min-width: ${breakpoints[query]}px)`
          : `(max-width: ${breakpoints[query] - 1}px)`
      )
      
      // Set initial value
      setMatches(mediaQuery.matches)

      // Create event listener
      const handler = (event: MediaQueryListEvent) => setMatches(event.matches)
      
      // Add event listener
      mediaQuery.addEventListener('change', handler)
      
      // Remove event listener on cleanup
      return () => mediaQuery.removeEventListener('change', handler)
    }
    
    return undefined
  }, [query, direction])

  return matches
}