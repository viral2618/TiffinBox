"use client"

import { useState, useCallback } from 'react'
import { useRequireAuth } from './use-require-auth'
import { toast } from 'sonner'

export function useFavorites() {
  const [loading, setLoading] = useState(false)
  const { requireAuth } = useRequireAuth()

  const toggleShopFavorite = useCallback(async (shopId: string, currentStatus: boolean) => {
    const result = requireAuth(() => {
      return (async () => {
        try {
          setLoading(true)
          
          if (currentStatus) {
            // Remove from favorites
            const response = await fetch(`/api/favorites/shops?shopId=${shopId}`, {
              method: 'DELETE'
            })
            if (!response.ok) {
              const errorData = await response.text()
              throw new Error(`Failed to remove from favorites: ${errorData}`)
            }
            toast.success('Shop removed from favorites')
          } else {
            // Add to favorites
            const response = await fetch('/api/favorites/shops', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ shopId })
            })
            if (!response.ok) {
              const errorData = await response.text()
              throw new Error(`Failed to add to favorites: ${errorData}`)
            }
            toast.success('Shop added to favorites')
          }
          
          return !currentStatus
        } catch (error) {
          console.error('Error toggling shop favorite:', error)
          toast.error('Failed to update favorites')
          return currentStatus
        } finally {
          setLoading(false)
        }
      })()
    })
    
    return result ? await result : currentStatus
  }, [requireAuth])

  const toggleDishFavorite = useCallback(async (dishId: string, currentStatus: boolean) => {
    const result = requireAuth(() => {
      return (async () => {
        try {
          setLoading(true)
          
          if (currentStatus) {
            // Remove from favorites
            const response = await fetch(`/api/favorites/dishes?dishId=${dishId}`, {
              method: 'DELETE'
            })
            if (!response.ok) {
              const errorData = await response.text()
              throw new Error(`Failed to remove from favorites: ${errorData}`)
            }
            toast.success('Dish removed from favorites')
          } else {
            // Add to favorites
            const response = await fetch('/api/favorites/dishes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ dishId })
            })
            if (!response.ok) {
              const errorData = await response.text()
              throw new Error(`Failed to add to favorites: ${errorData}`)
            }
            toast.success('Dish added to favorites')
          }
          
          return !currentStatus
        } catch (error) {
          console.error('Error toggling dish favorite:', error)
          toast.error('Failed to update favorites')
          return currentStatus
        } finally {
          setLoading(false)
        }
      })()
    })
    
    return result ? await result : currentStatus
  }, [requireAuth])

  return {
    loading,
    toggleShopFavorite,
    toggleDishFavorite
  }
}