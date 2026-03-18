"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2, RefreshCw } from "lucide-react"
import HeartIcon from "@/components/ui/heart-icon"
import ShopCard from "@/components/cards/shop-card"
import DishCard from "@/components/dishes/DishCard"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input"

export default function FavoritesPage() {
  const [activeTab, setActiveTab] = useState<string>("shops")
  const [favoriteShops, setFavoriteShops] = useState<any[]>([])
  const [favoriteDishes, setFavoriteDishes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState<number>(1)
  const [hasMore, setHasMore] = useState<boolean>(false)
  
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/favorites")
    }
  }, [status, router])
  
  // Fetch favorite shops
  const fetchFavoriteShops = async (pageNum = 1) => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/favorites/shops?page=${pageNum}&limit=12`)
      if (!response.ok) throw new Error('Failed to fetch favorite shops')
      
      const data = await response.json()
      
      if (pageNum === 1) {
        setFavoriteShops(data.shops)
      } else {
        setFavoriteShops(prev => [...prev, ...data.shops])
      }
      
      setHasMore(data.pagination.page < data.pagination.pages)
      setError(null)
    } catch (err) {
      setError("Failed to load favorite shops")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Fetch favorite dishes
  const fetchFavoriteDishes = async (pageNum = 1) => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/favorites/dishes?page=${pageNum}&limit=12`)
      if (!response.ok) throw new Error('Failed to fetch favorite dishes')
      
      const data = await response.json()
      
      if (pageNum === 1) {
        setFavoriteDishes(data.dishes)
      } else {
        setFavoriteDishes(prev => [...prev, ...data.dishes])
      }
      
      setHasMore(data.pagination.page < data.pagination.pages)
      setError(null)
    } catch (err) {
      setError("Failed to load favorite dishes")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Load data based on active tab
  useEffect(() => {
    if (status === "authenticated") {
      setPage(1)
      if (activeTab === "shops") {
        fetchFavoriteShops()
      } else {
        fetchFavoriteDishes()
      }
    }
  }, [activeTab, status])
  
  // Refresh favorites when page becomes visible (when user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && status === "authenticated") {
        if (activeTab === "shops") {
          fetchFavoriteShops()
        } else {
          fetchFavoriteDishes()
        }
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [activeTab, status])
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }
  
  // Refresh current tab data
  const refreshCurrentTab = () => {
    if (activeTab === "shops") {
      fetchFavoriteShops()
    } else {
      fetchFavoriteDishes()
    }
  }
  
  // Load more items
  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    
    if (activeTab === "shops") {
      fetchFavoriteShops(nextPage)
    } else {
      fetchFavoriteDishes(nextPage)
    }
  }
  
  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  return (
    <div className="favorites-section">
      <div className="container mx-auto py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center justify-center mb-4">
            <HeartIcon className="h-8 w-8 text-primary" />
          </div>
          <div className="flex items-center justify-center gap-4 mb-3">
            <h1 className="section-header text-4xl font-semibold">
              My Favorites
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshCurrentTab}
              disabled={isLoading}
              className="flex items-center gap-2"
              style={{ 
                backgroundColor: '#fef3e2', 
                color: '#451a03', 
                border: '1px solid rgba(69, 26, 3, 0.2)' 
              }}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <p className="text-lg" style={{ color: '#451a03' }}>
            Your collection of favorite shops and dishes.
          </p>
        </motion.div>

      <Tabs defaultValue="shops" value={activeTab} onValueChange={handleTabChange}>
        <div className="tab-list grid w-full max-w-md grid-cols-2 mb-8 mx-auto">
          <button className={`tab-trigger ${activeTab === 'shops' ? 'active' : ''}`} onClick={() => setActiveTab('shops')}>Favorite Shops</button>
          <button className={`tab-trigger ${activeTab === 'dishes' ? 'active' : ''}`} onClick={() => setActiveTab('dishes')}>Favorite Dishes</button>
        </div>

        <TabsContent value="shops">
          {isLoading && page === 1 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-96 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : favoriteShops.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>You haven't added any shops to your favorites yet.</p>
            </div>
          ) : (
            <>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              >
                {favoriteShops.map((shop) => (
                  <motion.div
                    key={shop.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                  >
                    <ShopCard shop={shop} onClick={() => router.push(`/shops/${shop.id}`)} />
                  </motion.div>
                ))}
              </motion.div>

              {hasMore && (
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    variant="outline"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="dishes">
          {isLoading && page === 1 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-96 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : favoriteDishes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>You haven't added any dishes to your favorites yet.</p>
            </div>
          ) : (
            <>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              >
                {favoriteDishes.map((dish) => (
                  <motion.div
                    key={dish.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                  >
                    <DishCard dish={dish} />
                  </motion.div>
                ))}
              </motion.div>

              {hasMore && (
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    variant="outline"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}