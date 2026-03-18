"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import {
  setSearchFilter,
  setLocation,
  setRadius,
  setFilter
} from "@/redux/features/publicShopSlice"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Filter, X } from "lucide-react"
import { LocationButton } from "@/components/ui/location-button"
import { LocationData } from "@/hooks/use-location"
import { cn } from "@/lib/utils"

interface Tag {
  id: string
  name: string
  slug: string
}

interface FilterSidebarProps {
  className?: string
}

export default function FilterSidebar({ className }: FilterSidebarProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { filters } = useAppSelector((state) => state.publicShop)
  
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)
  const [selectedTags, setSelectedTags] = useState<string[]>(filters.tagIds || [])
  const [localLocation, setLocalLocation] = useState<{ lat: number; lng: number } | null>(filters.location)
  const [radiusValue, setRadiusValue] = useState<number>(filters.radius || 5)
  const [minRating, setMinRating] = useState<number>(filters.minRating || 0)
  const [isOpenOnly, setIsOpenOnly] = useState<boolean>(filters.isOpen || false)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Update local state when filters change from external sources
  useEffect(() => {
    setSelectedTags(filters.tagIds || [])
    setLocalLocation(filters.location)
    setRadiusValue(filters.radius || 5)
    setMinRating(filters.minRating || 0)
    setIsOpenOnly(filters.isOpen || false)
  }, [filters])
  
  // Check for changes
  useEffect(() => {
    const changes = 
      JSON.stringify(selectedTags) !== JSON.stringify(filters.tagIds || []) ||
      JSON.stringify(localLocation) !== JSON.stringify(filters.location) ||
      radiusValue !== (filters.radius || 5) ||
      minRating !== (filters.minRating || 0) ||
      isOpenOnly !== (filters.isOpen || false)
    
    setHasChanges(changes)
  }, [selectedTags, localLocation, radiusValue, minRating, isOpenOnly, filters])
  
  // Fetch tags on component mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/tags")
        if (!response.ok) {
          throw new Error("Failed to fetch tags")
        }
        const data = await response.json()
        setTags(data.tags || [])
      } catch (error) {
        console.error("Error fetching tags:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchTags()
  }, [])
  
  // Count active filters
  useEffect(() => {
    let count = 0
    if (filters.tagIds && filters.tagIds.length > 0) count++
    if (filters.location) count++
    if (filters.radius && filters.radius !== 5) count++
    if (filters.minRating && filters.minRating > 0) count++
    if (filters.isOpen) count++
    
    setActiveFiltersCount(count)
  }, [filters])
  
  // Handle tag toggle
  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }
  
  // Handle location change from LocationButton
  const handleLocationChange = useCallback((location: LocationData | null) => {
    if (location) {
      setLocalLocation({ lat: location.lat, lng: location.lng })
    } else {
      setLocalLocation(null)
    }
  }, [])
  
  // Handle radius change
  const handleRadiusChange = (value: number[]) => {
    setRadiusValue(value[0])
  }
  
  // Apply filters — push URL directly so server re-fetches
  const applyFilters = () => {
    const params = new URLSearchParams()
    if (selectedTags.length > 0) selectedTags.forEach(id => params.append('tagIds', id))
    if (minRating > 0) params.set('minRating', minRating.toString())
    if (isOpenOnly) params.set('isOpen', 'true')
    if (localLocation) {
      params.set('lat', localLocation.lat.toString())
      params.set('lng', localLocation.lng.toString())
      params.set('radius', radiusValue.toString())
    }
    // Dispatch to Redux so active filter badges update
    dispatch(setFilter({ key: "tagIds", value: selectedTags.length > 0 ? selectedTags : undefined }))
    dispatch(setFilter({ key: "location", value: localLocation }))
    dispatch(setFilter({ key: "radius", value: radiusValue }))
    dispatch(setFilter({ key: "minRating", value: minRating > 0 ? minRating : undefined }))
    dispatch(setFilter({ key: "isOpen", value: isOpenOnly || undefined }))
    router.push(`/shops${params.toString() ? `?${params.toString()}` : ''}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  // Reset all filters
  const resetAllFilters = () => {
    setSelectedTags([])
    setLocalLocation(null)
    setRadiusValue(5)
    setMinRating(0)
    setIsOpenOnly(false)
    dispatch(setFilter({ key: "tagIds", value: undefined }))
    dispatch(setFilter({ key: "location", value: null }))
    dispatch(setFilter({ key: "radius", value: 5 }))
    dispatch(setFilter({ key: "minRating", value: undefined }))
    dispatch(setFilter({ key: "isOpen", value: undefined }))
    dispatch(setFilter({ key: "search", value: "" }))
    router.push('/shops')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  

  
  const filterContent = (
    <div className={cn("flex flex-col h-full filter-sidebar", className)} style={{ backgroundColor: 'var(--brand-cream)', color: 'var(--brand-text)', border: '1.5px solid var(--brand-border)', borderRadius: '8px', padding: '16px' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Filter className="h-4 w-4" /> Filter Home Kitchens
        </h2>
        {activeFiltersCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetAllFilters}
            className="text-xs h-8"
          >
            Reset All
          </Button>
        )}
      </div>
      
      {/* Active filters */}
      {activeFiltersCount > 0 && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Active Filters:</p>
          <div className="flex flex-wrap gap-1">
            {filters.tagIds && filters.tagIds.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1" style={{backgroundColor:'var(--brand-warm)',color:'var(--brand-subtext)',border:'1px solid var(--brand-border)'}}>
                {filters.tagIds.length} Tag{filters.tagIds.length > 1 ? 's' : ''}
                <button 
                  onClick={() => {
                    dispatch(setFilter({ key: "tagIds", value: undefined }))
                    setSelectedTags([])
                  }}
                  className="ml-1 hover:bg-muted rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.minRating && filters.minRating > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1" style={{backgroundColor:'var(--brand-warm)',color:'var(--brand-subtext)',border:'1px solid var(--brand-border)'}}>
                {filters.minRating}+ Stars
                <button 
                  onClick={() => {
                    dispatch(setFilter({ key: "minRating", value: undefined }))
                    setMinRating(0)
                  }}
                  className="ml-1 hover:bg-muted rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.isOpen && (
              <Badge variant="secondary" className="flex items-center gap-1" style={{backgroundColor:'var(--brand-warm)',color:'var(--brand-subtext)',border:'1px solid var(--brand-border)'}}>
                Open Now
                <button 
                  onClick={() => {
                    dispatch(setFilter({ key: "isOpen", value: undefined }))
                    setIsOpenOnly(false)
                  }}
                  className="ml-1 hover:bg-muted rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.location && (
              <Badge variant="secondary" className="flex items-center gap-1" style={{backgroundColor:'var(--brand-warm)',color:'var(--brand-subtext)',border:'1px solid var(--brand-border)'}}>
                Near Me
                <button 
                  onClick={() => dispatch(setFilter({ key: "location", value: null }))}
                  className="ml-1 hover:bg-muted rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.radius && filters.radius !== 5 && (
              <Badge variant="secondary" className="flex items-center gap-1" style={{backgroundColor:'var(--brand-warm)',color:'var(--brand-subtext)',border:'1px solid var(--brand-border)'}}>
                {filters.radius}km Radius
                <button 
                  onClick={() => {
                    dispatch(setFilter({ key: "radius", value: 5 }))
                    setRadiusValue(5)
                  }}
                  className="ml-1 hover:bg-muted rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
      
      <Separator className="my-4" />
      
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto pr-2 -mr-2">
        {/* Nearest Location */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Find Nearby Home Kitchens</h3>
          <LocationButton 
            onLocationChange={handleLocationChange}
            variant="outline"
            size="default"
            showAddress={true}
          />
        </div>
        
        {/* Radius Slider - only show when location is set */}
        {localLocation && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Search Radius</h3>
              <span className="text-xs text-muted-foreground">
                {radiusValue} km
              </span>
            </div>
            <Slider
              defaultValue={[5]}
              value={[radiusValue]}
              min={1}
              max={50}
              step={1}
              onValueChange={handleRadiusChange}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1km</span>
              <span>50km</span>
            </div>
          </div>
        )}
        
        <Separator className="my-4" />
        
        {/* Rating Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Minimum Rating</h3>
          <RadioGroup value={minRating.toString()} onValueChange={(val) => setMinRating(parseInt(val))}>
            {[0, 1, 2, 3, 4].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                <Label htmlFor={`rating-${rating}`} className="cursor-pointer">
                  {rating === 0 ? 'All Ratings' : `${rating}+ Stars`}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        <Separator className="my-4" />
        
        {/* Open Now Filter */}
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="open-now"
              checked={isOpenOnly}
              onChange={(e) => setIsOpenOnly(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="open-now" className="cursor-pointer">Show only open home kitchens</Label>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* Shop Tags */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Shop Tags</h3>
          
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-100 animate-pulse rounded-md" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={tag.id}
                    checked={selectedTags.includes(tag.id)}
                    onChange={() => handleTagToggle(tag.id)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor={tag.id} className="cursor-pointer">{tag.name}</Label>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Apply Filters Button */}
        <div className="mt-6 pt-4 border-t">
          <Button 
            onClick={applyFilters}
            disabled={!hasChanges}
            className="w-full"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  )
  
  return filterContent
}