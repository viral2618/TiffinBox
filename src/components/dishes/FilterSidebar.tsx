"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Filter, X, Star, Clock, DollarSign, Package, Percent } from "lucide-react"
import { LocationButton } from "@/components/ui/location-button"
import { LocationData } from "@/hooks/use-location"
import { cn } from "@/lib/utils"
import { parseSearchParams, buildSearchParams } from "@/lib/utils/url-params"
import { Checkbox } from "@/components/ui/checkbox"

interface Category {
  id: string
  name: string
  subcategories: {
    id: string
    name: string
  }[]
}

interface FilterSidebarProps {
  categories: Category[]
  className?: string
}

export default function FilterSidebar({ categories, className }: FilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentParams = useMemo(() => parseSearchParams(searchParams), [searchParams])
  
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(currentParams.categoryId || null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(currentParams.subcategoryId || null)
  const [radiusValue, setRadiusValue] = useState<number>(parseInt(currentParams.radius || '5'))
  const [ratingValue, setRatingValue] = useState<number>(parseInt(currentParams.minRating || '0'))
  const [priceRange, setPriceRange] = useState([
    parseInt(currentParams.minPrice || '0'),
    parseInt(currentParams.maxPrice || '1000')
  ])
  const [serveTime, setServeTime] = useState<string>(currentParams.serveTime || 'all')
  const [isEggless, setIsEggless] = useState<string | undefined>(currentParams.isEggless)
  const [hasDiscount, setHasDiscount] = useState<boolean>(currentParams.hasDiscount === 'true')
  const [hasLocation, setHasLocation] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Sync local state with URL params - only on mount and when searchParams actually change
  useEffect(() => {
    const params = parseSearchParams(searchParams)
    setSelectedCategory(params.categoryId || null)
    setSelectedSubcategory(params.subcategoryId || null)
    setServeTime(params.serveTime || 'all')
    setIsEggless(params.isEggless)
    setHasDiscount(params.hasDiscount === 'true')
    setRadiusValue(parseInt(params.radius || '5'))
    setRatingValue(parseInt(params.minRating || '0'))
    setPriceRange([
      parseInt(params.minPrice || '0'),
      parseInt(params.maxPrice || '1000')
    ])
  }, [searchParams])
  
  // Check for changes
  useEffect(() => {
    const changes = 
      selectedCategory !== (currentParams.categoryId || null) ||
      selectedSubcategory !== (currentParams.subcategoryId || null) ||
      serveTime !== (currentParams.serveTime || 'all') ||
      isEggless !== currentParams.isEggless ||
      hasDiscount !== (currentParams.hasDiscount === 'true') ||
      radiusValue !== parseInt(currentParams.radius || '5') ||
      ratingValue !== parseInt(currentParams.minRating || '0') ||
      priceRange[0] !== parseInt(currentParams.minPrice || '0') ||
      priceRange[1] !== parseInt(currentParams.maxPrice || '1000')
    
    setHasChanges(changes)
  }, [selectedCategory, selectedSubcategory, serveTime, isEggless, hasDiscount, radiusValue, ratingValue, priceRange, currentParams])
  
  // Check if component is mounted (client-side only)
  useEffect(() => {
    setIsMounted(true)
    setHasLocation(sessionStorage.getItem('userLocation') !== null)
  }, [])
  
  // Count active filters
  useEffect(() => {
    let count = 0
    if (currentParams.categoryId) count++
    if (currentParams.subcategoryId) count++
    if (isMounted && hasLocation) count++
    if (currentParams.radius && currentParams.radius !== '5') count++
    if (currentParams.minRating && currentParams.minRating !== '0') count++
    if (currentParams.serveTime) count++
    if (currentParams.isEggless) count++
    if (currentParams.hasDiscount) count++
    if (currentParams.minPrice && currentParams.minPrice !== '0') count++
    if (currentParams.maxPrice && currentParams.maxPrice !== '1000') count++
    
    setActiveFiltersCount(count)
  }, [currentParams, isMounted, hasLocation])
  
  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === '') {
      setSelectedCategory(null)
      setSelectedSubcategory(null)
    } else {
      setSelectedCategory(categoryId)
      setSelectedSubcategory(null)
    }
  }
  
  // Handle subcategory change
  const handleSubcategoryChange = (subcategoryId: string) => {
    const newSubcategoryId = subcategoryId === selectedSubcategory ? null : subcategoryId
    setSelectedSubcategory(newSubcategoryId)
  }
  
  // Handle location change from LocationButton
  const handleLocationChange = useCallback((location: LocationData | null) => {
    if (location) {
      sessionStorage.setItem('userLocation', JSON.stringify(location))
      setHasLocation(true)
      
      // Immediately update URL with location
      const updatedParams = { ...currentParams }
      updatedParams.lat = location.lat.toString()
      updatedParams.lng = location.lng.toString()
      updatedParams.radius = radiusValue.toString()
      delete updatedParams.page
      
      const searchParamsObj = buildSearchParams(updatedParams)
      router.push(`/dishes?${searchParamsObj.toString()}`)
    } else {
      sessionStorage.removeItem('userLocation')
      setHasLocation(false)
      
      // Remove location from URL
      const updatedParams = { ...currentParams }
      delete updatedParams.lat
      delete updatedParams.lng
      delete updatedParams.radius
      delete updatedParams.page
      
      const searchParamsObj = buildSearchParams(updatedParams)
      router.push(`/dishes?${searchParamsObj.toString()}`)
    }
  }, [router, currentParams, radiusValue])
  
  // Apply filters
  const applyFilters = () => {
    const updatedParams = { ...currentParams }
    
    updatedParams.categoryId = selectedCategory || undefined
    updatedParams.subcategoryId = selectedSubcategory || undefined
    updatedParams.serveTime = serveTime === 'all' ? undefined : serveTime
    updatedParams.isEggless = isEggless
    updatedParams.hasDiscount = hasDiscount ? 'true' : undefined
    
    // Add location params if available
    if (hasLocation) {
      const savedLocation = sessionStorage.getItem('userLocation')
      if (savedLocation) {
        try {
          const location = JSON.parse(savedLocation) as LocationData
          updatedParams.lat = location.lat.toString()
          updatedParams.lng = location.lng.toString()
          updatedParams.radius = radiusValue.toString()
        } catch (err) {
          console.error('Failed to parse location:', err)
        }
      }
    } else {
      delete updatedParams.lat
      delete updatedParams.lng
      delete updatedParams.radius
    }
    
    updatedParams.minRating = ratingValue === 0 ? undefined : ratingValue.toString()
    updatedParams.minPrice = priceRange[0] === 0 ? undefined : priceRange[0].toString()
    updatedParams.maxPrice = priceRange[1] === 1000 ? undefined : priceRange[1].toString()
    
    delete updatedParams.page
    
    const searchParamsObj = buildSearchParams(updatedParams)
    router.push(`/dishes?${searchParamsObj.toString()}`)
    
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  // Reset all filters
  const resetAllFilters = () => {
    setSelectedCategory(null)
    setSelectedSubcategory(null)
    setRadiusValue(5)
    setRatingValue(0)
    setPriceRange([0, 1000])
    setServeTime('all')
    setIsEggless(undefined)
    setHasDiscount(false)
    
    const updatedParams: any = {}
    const searchParamsObj = buildSearchParams(updatedParams)
    router.push(`/dishes?${searchParamsObj.toString()}`)
  }
  
  const filterContent = (
    <div className={cn("flex flex-col h-full max-h-[calc(100vh-8rem)] overflow-hidden", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Filter className="h-4 w-4" /> Filter Dishes
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
      
      {/* Active filters - showing current URL params */}
      {activeFiltersCount > 0 && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Active Filters:</p>
          <div className="flex flex-wrap gap-1">
            {currentParams.categoryId && (() => {
              const selectedCat = categories.find(cat => cat.id === currentParams.categoryId)
              const handleRemove = () => {
                setSelectedCategory(null)
                setSelectedSubcategory(null)
                const updatedParams = { ...currentParams }
                delete updatedParams.categoryId
                delete updatedParams.subcategoryId
                delete updatedParams.page
                const searchParamsObj = buildSearchParams(updatedParams)
                router.push(`/dishes?${searchParamsObj.toString()}`)
              }
              return (
                <Badge variant="secondary" className="flex items-center gap-1 bg-gray-400 pr-1">
                  <span>{selectedCat?.name || 'Category'}</span>
                  <button onClick={handleRemove} className="ml-1 hover:bg-gray-500 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )
            })()}
            {currentParams.subcategoryId && (() => {
              let selectedSub = null
              if (currentParams.categoryId) {
                const selectedCat = categories.find(cat => cat.id === currentParams.categoryId)
                selectedSub = selectedCat?.subcategories.find(sub => sub.id === currentParams.subcategoryId)
              } else {
                for (const cat of categories) {
                  selectedSub = cat.subcategories.find(sub => sub.id === currentParams.subcategoryId)
                  if (selectedSub) break
                }
              }
              const handleRemove = () => {
                setSelectedSubcategory(null)
                const updatedParams = { ...currentParams }
                delete updatedParams.subcategoryId
                delete updatedParams.page
                const searchParamsObj = buildSearchParams(updatedParams)
                router.push(`/dishes?${searchParamsObj.toString()}`)
              }
              return (
                <Badge variant="secondary" className="flex items-center gap-1 bg-gray-400 pr-1">
                  <span>{selectedSub?.name || 'Subcategory'}</span>
                  <button onClick={handleRemove} className="ml-1 hover:bg-gray-500 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )
            })()}
            {currentParams.serveTime && (() => {
              const handleRemove = () => {
                setServeTime('all')
                const updatedParams = { ...currentParams }
                delete updatedParams.serveTime
                delete updatedParams.page
                const searchParamsObj = buildSearchParams(updatedParams)
                router.push(`/dishes?${searchParamsObj.toString()}`)
              }
              return (
                <Badge variant="secondary" className="flex items-center gap-1 bg-gray-400 pr-1">
                  <span>{currentParams.serveTime}</span>
                  <button onClick={handleRemove} className="ml-1 hover:bg-gray-500 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )
            })()}
            {currentParams.isEggless && (() => {
              const handleRemove = () => {
                setIsEggless(undefined)
                const updatedParams = { ...currentParams }
                delete updatedParams.isEggless
                delete updatedParams.page
                const searchParamsObj = buildSearchParams(updatedParams)
                router.push(`/dishes?${searchParamsObj.toString()}`)
              }
              return (
                <Badge variant="secondary" className="flex items-center gap-1 bg-gray-400 pr-1">
                  <span>{currentParams.isEggless === 'true' ? 'Veg' : 'Non-Veg'}</span>
                  <button onClick={handleRemove} className="ml-1 hover:bg-gray-500 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )
            })()}
            {currentParams.minRating && currentParams.minRating !== '0' && (() => {
              const handleRemove = () => {
                setRatingValue(0)
                const updatedParams = { ...currentParams }
                delete updatedParams.minRating
                delete updatedParams.page
                const searchParamsObj = buildSearchParams(updatedParams)
                router.push(`/dishes?${searchParamsObj.toString()}`)
              }
              return (
                <Badge variant="secondary" className="flex items-center gap-1 bg-gray-400 pr-1">
                  <span>{currentParams.minRating}+ Stars</span>
                  <button onClick={handleRemove} className="ml-1 hover:bg-gray-500 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )
            })()}
            {(currentParams.minPrice && currentParams.minPrice !== '0' || currentParams.maxPrice && currentParams.maxPrice !== '1000') && (() => {
              const handleRemove = () => {
                setPriceRange([0, 1000])
                const updatedParams = { ...currentParams }
                delete updatedParams.minPrice
                delete updatedParams.maxPrice
                delete updatedParams.page
                const searchParamsObj = buildSearchParams(updatedParams)
                router.push(`/dishes?${searchParamsObj.toString()}`)
              }
              return (
                <Badge variant="secondary" className="flex items-center gap-1 bg-gray-400 pr-1">
                  <span>₹{currentParams.minPrice || '0'} - ₹{currentParams.maxPrice || '1000'}</span>
                  <button onClick={handleRemove} className="ml-1 hover:bg-gray-500 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )
            })()}
            {currentParams.hasDiscount === 'true' && (() => {
              const handleRemove = () => {
                setHasDiscount(false)
                const updatedParams = { ...currentParams }
                delete updatedParams.hasDiscount
                delete updatedParams.page
                const searchParamsObj = buildSearchParams(updatedParams)
                router.push(`/dishes?${searchParamsObj.toString()}`)
              }
              return (
                <Badge variant="secondary" className="flex items-center gap-1 bg-gray-400 pr-1">
                  <span>On Discount</span>
                  <button onClick={handleRemove} className="ml-1 hover:bg-gray-500 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )
            })()}
          </div>
        </div>
      )}
      
      <Separator className="my-4" />
      
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pr-2 -mr-2">
        {/* Location */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Find Nearby Dishes</h3>
          <LocationButton 
            onLocationChange={handleLocationChange}
            variant="outline"
            size="default"
            showAddress={true}
          />
        </div>
        
        {hasLocation && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Search Radius</h3>
              <span className="text-xs text-muted-foreground">{radiusValue} km</span>
            </div>
            <Slider
              value={[radiusValue]}
              min={1}
              max={50}
              step={1}
              onValueChange={(val) => setRadiusValue(val[0])}
            />
          </div>
        )}
        
        <Separator className="my-4" />
        
        {/* Categories */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Categories</h3>
          <RadioGroup value={selectedCategory || ""} onValueChange={handleCategoryChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="" id="all-categories" />
              <Label htmlFor="all-categories">All Categories</Label>
            </div>
            <Accordion type="multiple" defaultValue={selectedCategory ? [selectedCategory] : []} className="w-full">
              {categories.map((category) => (
                <AccordionItem key={category.id} value={category.id} className="border-b-0">
                  <div className="flex items-center space-x-2 py-1">
                    <RadioGroupItem 
                      value={category.id} 
                      id={category.id}
                    />
                    <Label htmlFor={category.id} className="flex-1">{category.name}</Label>
                    {category.subcategories.length > 0 && <AccordionTrigger className="py-0" />}
                  </div>
                  {category.subcategories.length > 0 && (
                    <AccordionContent>
                      <div className="pl-6 pt-1 space-y-1">
                        {category.subcategories.map((sub) => (
                          <div key={sub.id} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={sub.id}
                              checked={selectedSubcategory === sub.id}
                              onChange={() => handleSubcategoryChange(sub.id)}
                              className="h-4 w-4"
                            />
                            <Label htmlFor={sub.id}>{sub.name}</Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  )}
                </AccordionItem>
              ))}
            </Accordion>
          </RadioGroup>
        </div>
        
        <Separator className="my-4" />
        
        {/* Serve Time */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" /> Serve Time
          </h3>
          <Select value={serveTime} onValueChange={setServeTime}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Times</SelectItem>
              <SelectItem value="morning">Morning</SelectItem>
              <SelectItem value="afternoon">Afternoon</SelectItem>
              <SelectItem value="evening">Evening</SelectItem>
              <SelectItem value="available-now">Available Now</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Separator className="my-4" />
        
        {/* Rating */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Star className="h-4 w-4" /> Minimum Rating
          </h3>
          <Slider
            value={[ratingValue]}
            max={5}
            min={0}
            step={1}
            onValueChange={(val) => setRatingValue(val[0])}
          />
          <div className="text-xs text-muted-foreground mt-2">
            {ratingValue === 0 ? 'Any' : `${ratingValue}+ stars`}
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* Price Range */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> Price Range
          </h3>
          <Slider
            value={priceRange}
            max={1000}
            min={0}
            step={10}
            onValueChange={setPriceRange}
          />
          <div className="text-xs text-muted-foreground mt-2">
            ₹{priceRange[0]} - ₹{priceRange[1]}
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* Food Type */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Food Type</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isVeg" 
                checked={isEggless === 'true'} 
                onCheckedChange={(checked) => setIsEggless(checked ? 'true' : undefined)} 
              />
              <Label htmlFor="isVeg">Veg</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isNonVeg" 
                checked={isEggless === 'false'} 
                onCheckedChange={(checked) => setIsEggless(checked ? 'false' : undefined)} 
              />
              <Label htmlFor="isNonVeg">Non-Veg</Label>
            </div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* Availability */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Percent className="h-4 w-4" /> Offers
          </h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="hasDiscount" 
                checked={hasDiscount} 
                onCheckedChange={(checked) => setHasDiscount(!!checked)} 
              />
              <Label htmlFor="hasDiscount">On Discount</Label>
            </div>
          </div>
        </div>
      </div>
      
      {/* Apply Button */}
      <div className="mt-4 pt-4 border-t">
        <Button 
          onClick={applyFilters}
          disabled={!hasChanges}
          className="w-full"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  )
  
  return filterContent
}
