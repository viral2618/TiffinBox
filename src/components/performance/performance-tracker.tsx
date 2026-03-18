"use client"

import { useEffect } from 'react'
import { PerformanceMonitor } from '@/lib/performance'

interface PerformanceTrackerProps {
  routeName: string
  children: React.ReactNode
}

const PerformanceTracker: React.FC<PerformanceTrackerProps> = ({ 
  routeName, 
  children 
}) => {
  useEffect(() => {
    const monitor = PerformanceMonitor.getInstance()
    
    // Track route load time
    monitor.startTimer(`route-${routeName}`)
    
    // Track Core Web Vitals
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Largest Contentful Paint (LCP)
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`🎯 LCP for ${routeName}:`, lastEntry.startTime)
        }
      })
      
      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] })
      } catch (e) {
        // LCP not supported
      }
      
      // First Input Delay (FID) - using First Input Delay polyfill approach
      const handleFirstInput = (event: Event) => {
        const fid = performance.now() - (event as any).timeStamp
        if (process.env.NODE_ENV === 'development') {
          console.log(`⚡ FID for ${routeName}:`, fid)
        }
        
        // Remove listener after first input
        document.removeEventListener('click', handleFirstInput, true)
        document.removeEventListener('keydown', handleFirstInput, true)
      }
      
      document.addEventListener('click', handleFirstInput, true)
      document.addEventListener('keydown', handleFirstInput, true)
      
      // Cumulative Layout Shift (CLS)
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`📐 CLS for ${routeName}:`, clsValue)
        }
      })
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      } catch (e) {
        // CLS not supported
      }
      
      // Time to First Byte (TTFB)
      const navigationEntries = performance.getEntriesByType('navigation')
      if (navigationEntries.length > 0) {
        const navEntry = navigationEntries[0] as PerformanceNavigationTiming
        const ttfb = navEntry.responseStart - navEntry.requestStart
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`🚀 TTFB for ${routeName}:`, ttfb)
        }
      }
      
      // Cleanup function
      return () => {
        monitor.endTimer(`route-${routeName}`)
        observer.disconnect()
        clsObserver.disconnect()
        document.removeEventListener('click', handleFirstInput, true)
        document.removeEventListener('keydown', handleFirstInput, true)
      }
    }
    
    // Return cleanup for when window is undefined
    return () => {
      monitor.endTimer(`route-${routeName}`)
    }
  }, [routeName])
  
  return <>{children}</>
}

export default PerformanceTracker

// Web Vitals reporting utility
export function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Web Vital:', metric)
  }
  
  // Send to analytics service in production
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to Google Analytics
    // gtag('event', metric.name, {
    //   value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    //   event_label: metric.id,
    //   non_interaction: true,
    // })
  }
}

// Performance budget checker
export function checkPerformanceBudget() {
  if (typeof window === 'undefined') return
  
  const budgets = {
    LCP: 2500, // 2.5s
    FID: 100,  // 100ms
    CLS: 0.1,  // 0.1
    TTFB: 600, // 600ms
  }
  
  // Check if performance budgets are exceeded
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const entryType = entry.entryType
      const value = entry.startTime
      
      if (entryType === 'largest-contentful-paint' && value > budgets.LCP) {
        console.warn(`⚠️ LCP budget exceeded: ${value}ms > ${budgets.LCP}ms`)
      }
    }
  })
  
  try {
    observer.observe({ entryTypes: ['largest-contentful-paint'] })
  } catch (e) {
    // Not supported
  }
}