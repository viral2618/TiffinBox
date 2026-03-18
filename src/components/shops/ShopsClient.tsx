"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { setFilter } from "@/redux/features/publicShopSlice"
import ShopCard from "@/components/shops/ShopCard"
import ShopSkeleton from "@/components/shops/ShopSkeleton"
import FilterSidebar from "@/components/shops/FilterSidebar"
import SearchInput from "@/components/search/SearchInput"
import type { SearchResult } from "@/types/search"
import { Button } from "@/components/ui/button"
import { Store, SlidersHorizontal, Filter, MapPin } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { motion } from "framer-motion"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import ServerPagination from "@/components/shops/ServerPagination"
import { LocationButton } from "@/components/ui/location-button"
import ShopSortDropdown from "@/components/shops/ShopSortDropdown";
import { LocationData } from "@/hooks/use-location"

interface ShopData {
  id: string
  name: string
  slug: string
  description?: string
  address: string
  coordinates?: {
    lat: number
    lng: number
  }
  bannerImage?: string
  logoUrl?: string
  imageUrls: string[]
  contactPhone?: string
  whatsapp?: string
  distance?: number
  isFavorite: boolean
  rating?: number
  reviewCount?: number
  dishes: any[]
  shopTags: {
    tag: {
      id: string
      name: string
    }
  }[]
}


interface ShopsClientProps {
  initialShops: ShopData[]
  initialPagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
  initialIsNearby: boolean
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function ShopsClient({ 
  initialShops, 
  initialPagination, 
  initialIsNearby,
  searchParams 
}: ShopsClientProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const isDesktop = useMediaQuery("lg")
  
  const { error, filters } = useAppSelector((state) => state.publicShop)
  const [searchInput, setSearchInput] = useState(searchParams.search as string || "")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const isInitializedRef = useRef(false)
  
  // Use server-rendered data directly
  const displayShops = initialShops
  const displayPagination = initialPagination
  const displayIsNearby = initialIsNearby



  // Initialize filters from URL params
  useEffect(() => {
    const lat = searchParams.lat as string
    const lng = searchParams.lng as string
    const search = searchParams.search as string
    const radius = searchParams.radius as string
    const minRating = searchParams.minRating as string
    const isOpen = searchParams.isOpen as string
    const tagIds = searchParams.tagIds as string | string[]

    if (lat && lng) dispatch(setFilter({ key: "location", value: { lat: parseFloat(lat), lng: parseFloat(lng) } }))
    if (search) dispatch(setFilter({ key: "search", value: search }))
    if (radius) dispatch(setFilter({ key: "radius", value: parseFloat(radius) }))
    if (minRating) dispatch(setFilter({ key: "minRating", value: parseInt(minRating) }))
    if (isOpen) dispatch(setFilter({ key: "isOpen", value: isOpen === 'true' }))
    if (tagIds) {
      const tagArray = Array.isArray(tagIds) ? tagIds : [tagIds]
      dispatch(setFilter({ key: "tagIds", value: tagArray }))
    }
    
    // Mark as initialized after setting filters
    isInitializedRef.current = true
  }, [dispatch, searchParams])

  // Handle location and radius changes on client-side only
  useEffect(() => {
    const hasLocationChange = 
      (filters.location && (!searchParams.lat || !searchParams.lng)) ||
      (!filters.location && (searchParams.lat || searchParams.lng)) ||
      (filters.location && searchParams.lat && searchParams.lng && 
        (filters.location.lat !== parseFloat(searchParams.lat as string) || 
         filters.location.lng !== parseFloat(searchParams.lng as string)))

    const hasRadiusChange = 
      filters.location && 
      filters.radius !== undefined && 
      filters.radius !== parseFloat(searchParams.radius as string || '5')

    if (hasLocationChange || hasRadiusChange) {
      const params = new URLSearchParams()
      
      // Preserve all existing search params except lat/lng/radius
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value && key !== 'lat' && key !== 'lng' && key !== 'radius' && key !== 'page') {
          params.set(key, value.toString())
        }
      })
      
      // Add location params
      if (filters.location) {
        params.set('lat', filters.location.lat.toString())
        params.set('lng', filters.location.lng.toString())
        // Always include radius when location is set
        params.set('radius', (filters.radius || 5).toString())
      }
      
      // Navigate to new URL (server will handle the data fetching)
      const newURL = `/shops${params.toString() ? `?${params.toString()}` : ''}`
      router.push(newURL)
    }
  }, [filters.location, filters.radius, searchParams, router])

  // Handle other filter changes with server-side navigation (only when filters actually change)
  useEffect(() => {
    // Don't navigate on initial mount
    if (!isInitializedRef.current) return
    
    const hasNonLocationChange = 
      filters.search !== (searchParams.search || '') ||
      (filters.minRating || 0) !== parseInt(searchParams.minRating as string || '0') ||
      (filters.isOpen || false) !== (searchParams.isOpen === 'true') ||
      JSON.stringify(filters.tagIds || []) !== JSON.stringify(
        searchParams.tagIds ? (Array.isArray(searchParams.tagIds) ? searchParams.tagIds : [searchParams.tagIds]) : []
      )

    if (hasNonLocationChange) {
      const params = new URLSearchParams()
      
      // Add all current filters
      if (filters.search) params.set('search', filters.search)
      if (filters.minRating && filters.minRating > 0) params.set('minRating', filters.minRating.toString())
      if (filters.isOpen) params.set('isOpen', 'true')
      if (filters.tagIds && filters.tagIds.length > 0) {
        filters.tagIds.forEach(tagId => params.append('tagIds', tagId))
      }
      if (searchParams.lat) params.set('lat', searchParams.lat as string)
      if (searchParams.lng) params.set('lng', searchParams.lng as string)
      if (searchParams.radius) params.set('radius', searchParams.radius as string)
      
      const newURL = `/shops${params.toString() ? `?${params.toString()}` : ''}`
      router.push(newURL)
    }
  }, [filters.search, filters.minRating, filters.isOpen, filters.tagIds, searchParams, router])

  const handleResultSelect = (result: SearchResult) => {
    if (result.type === 'shop') {
      router.push(`/shops/${result.slug}`)
    } else if (result.type === 'dish') {
      router.push(`/dishes?search=${encodeURIComponent(result.title.replace(/<[^>]*>/g, ''))}`)
    } else if (result.type === 'category') {
      router.push(`/dishes?categoryId=${result.id}`)
    }
  }

  const handleLocationChange = useCallback((location: LocationData | null) => {
    if (location) {
      dispatch(setFilter({ key: "location", value: { lat: location.lat, lng: location.lng } }))
    } else {
      dispatch(setFilter({ key: "location", value: null }))
    }
  }, [dispatch])

  const getPageTitle = () => {
    if (filters.location) return "Bakeries Near You"
    if (filters.search) return `Search Results: "${filters.search}"`
    return "Find Your Perfect Bakery"
  }

  const getPageSubtitle = () => {
    if (displayIsNearby) return `Showing bakeries within ${filters.radius || 5}km of your location`
    if (filters.search) return "Bakeries matching your search criteria"
    return "Discover fresh baked goods from local bakeries in your area"
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }



  return (
    <div className="container mx-auto py-24 px-3 sm:px-4">
      <div className="flex flex-col space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-4"
        >
          <h1 className="text-4xl font-semibold mb-3">{getPageTitle()}</h1>
          <p className="text-lg text-muted-foreground">{getPageSubtitle()}</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-3xl mx-auto w-full"
        >
          <SearchInput
            placeholder="Search for Shops by name or location..."
            onResultSelect={handleResultSelect}
            showDropdown={true}
            className="max-w-3xl mx-auto"
          />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-center gap-4 lg:hidden"
        >
          <div className="w-48">
            <LocationButton 
              onLocationChange={handleLocationChange}
              variant="outline"
              size="default"
              showAddress={false}
            />
          </div>
        </motion.div>
        
        <div className="flex flex-col lg:flex-row gap-8 mt-5">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="hidden lg:block w-72 shrink-0"
          >
            <div className="sticky top-24">
              <FilterSidebar />
            </div>
          </motion.div>
          
          <div className="flex-1">
            {error ? (
              <div className="p-8 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            ) : displayShops.length > 0 ? (
              <>
                {filters.location && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6 p-4 bg-primary/5 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <p className="text-sm">
                        Showing bakeries within {filters.radius || 5}km of your location
                      </p>
                    </div>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="text-primary p-0"
                      onClick={() => dispatch(setFilter({ key: "location", value: null }))}
                    >
                      Clear
                    </Button>
                  </motion.div>
                )}
                
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-muted-foreground">
                    Found {displayPagination.total} {displayPagination.total === 1 ? "bakery" : "bakeries"}
                  </p>
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="hidden sm:inline text-sm">Sort by:</span>
                    <ShopSortDropdown currentSort={searchParams.sortBy as string} />
                  </div>
                </div>
                
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                  className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6 lg:gap-8"
                >
                  {displayShops.map((shop) => {
                    return (
                      <motion.div key={shop.id} variants={itemVariants}>
                        <ShopCard shop={shop} />
                      </motion.div>
                    );
                  })}
                </motion.div>
                
                <ServerPagination 
                  currentPage={displayPagination.page}
                  totalPages={displayPagination.pages}
                  searchParams={searchParams}
                />
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="p-12 text-center bg-muted/30 rounded-lg flex flex-col items-center"
              >
                <div className="bg-muted/50 p-4 rounded-full mb-4">
                  <Store className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium mb-2">No Bakeries Found</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  We couldn't find any bakeries matching your criteria. Try adjusting your filters or search for something else.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    dispatch(setFilter({ key: "categoryId", value: null }))
                    dispatch(setFilter({ key: "subcategoryId", value: null }))
                    dispatch(setFilter({ key: "search", value: "" }))
                    dispatch(setFilter({ key: "minRating", value: 0 }))
                    dispatch(setFilter({ key: "serveTime", value: null }))
                  }}
                >
                  Clear Filters
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* Floating Filter Button - Mobile/Tablet Only */}
      <div className="lg:hidden">
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <Button 
              size="icon"
              className={`fixed bottom-42 right-4 z-[60] h-12 w-12 rounded-full shadow-lg transition-opacity ${isFilterOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
              <Filter className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filter Bakeries</SheetTitle>
            </SheetHeader>
            <FilterSidebar className="pt-4 pl-4 pr-4" />
            <div className="mt-6 pt-4 border-t">
              <ServerPagination 
                currentPage={displayPagination.page}
                totalPages={displayPagination.pages}
                searchParams={searchParams}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}