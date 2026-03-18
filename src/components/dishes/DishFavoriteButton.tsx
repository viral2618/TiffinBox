"use client"

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { toggleFavoriteDish } from '@/redux/features/favoritesSlice'
import { useRequireAuth } from '@/hooks/use-require-auth'

interface DishFavoriteButtonProps {
  dishId: string
  initialIsFavorite: boolean
}

export default function DishFavoriteButton({ dishId, initialIsFavorite }: DishFavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const dispatch = useAppDispatch()
  const { loading } = useAppSelector(state => state.favorites)
  const { requireAuth } = useRequireAuth()

  const handleToggleFavorite = async () => {
    requireAuth(async () => {
      const result = await dispatch(toggleFavoriteDish({ 
        dishId, 
        currentFavoriteStatus: isFavorite 
      }))
      
      if (toggleFavoriteDish.fulfilled.match(result)) {
        setIsFavorite(!isFavorite)
      }
    })
  }

  return (
    <Button
      variant={isFavorite ? "default" : "outline"}
      size="lg"
      onClick={handleToggleFavorite}
      disabled={loading}
      className="w-full sm:w-auto"
    >
      <Heart className={`h-5 w-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
      {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
    </Button>
  )
}
