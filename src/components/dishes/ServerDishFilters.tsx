"use client"

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from '@/components/ui/button';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Filter, Star, Clock, Package, Percent, DollarSign } from 'lucide-react';
import { LocationButton } from '@/components/ui/location-button';
import { LocationData } from '@/hooks/use-location';
import { buildSearchParams, parseSearchParams } from '@/lib/utils/url-params';

interface Category {
  id: string;
  name: string;
  subcategories: {
    id: string;
    name: string;
  }[];
}

interface ServerDishFiltersProps {
  categories: Category[];
}

export default function ServerDishFilters({ categories }: ServerDishFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentParams = parseSearchParams(searchParams);
  
  const [radius, setRadius] = useState(parseInt(currentParams.radius || '5'));
  const [priceRange, setPriceRange] = useState([
    parseInt(currentParams.minPrice || '0'),
    parseInt(currentParams.maxPrice || '1000')
  ]);
  const [minRating, setMinRating] = useState(parseInt(currentParams.minRating || '0'));
  
  // Debounced values for sliders
  const debouncedRadius = useDebounce(radius, 500);
  const debouncedPriceRange = useDebounce(priceRange, 500);
  const debouncedMinRating = useDebounce(minRating, 500);
  
  const updateURL = useCallback((newParams: Partial<typeof currentParams>) => {
    const updatedParams = { ...currentParams, ...newParams };
    
    // Remove page when filters change
    if (Object.keys(newParams).some(key => key !== 'page')) {
      delete updatedParams.page;
    }
    
    const searchParamsObj = buildSearchParams(updatedParams);
    const newURL = `/dishes?${searchParamsObj.toString()}`;
    router.push(newURL);
  }, [currentParams, router]);
  
  const handleCategoryChange = (categoryId: string) => {
    const newCategoryId = currentParams.categoryId === categoryId ? undefined : categoryId;
    updateURL({ 
      categoryId: newCategoryId,
      subcategoryId: undefined // Reset subcategory when category changes
    });
  };
  
  const handleSubcategoryChange = (subcategoryId: string) => {
    updateURL({ subcategoryId });
  };

  const handleCheckboxChange = (key: 'isEggless' | 'isPremium' | 'isSpecialToday', checked: boolean) => {
    updateURL({ [key]: checked ? 'true' : undefined });
  };

  const handleRadiusChange = (value: number[]) => {
    setRadius(value[0]);
  };

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange(value);
  };

  const handleRatingChange = (value: number[]) => {
    setMinRating(value[0]);
  };
  
  // Update URL when debounced values change
  useEffect(() => {
    if (debouncedRadius !== parseInt(currentParams.radius || '5')) {
      updateURL({ radius: debouncedRadius.toString() });
    }
  }, [debouncedRadius]);
  
  useEffect(() => {
    const currentMinPrice = parseInt(currentParams.minPrice || '0');
    const currentMaxPrice = parseInt(currentParams.maxPrice || '1000');
    if (debouncedPriceRange[0] !== currentMinPrice || debouncedPriceRange[1] !== currentMaxPrice) {
      updateURL({ 
        minPrice: debouncedPriceRange[0] === 0 ? undefined : debouncedPriceRange[0].toString(),
        maxPrice: debouncedPriceRange[1] === 1000 ? undefined : debouncedPriceRange[1].toString()
      });
    }
  }, [debouncedPriceRange]);
  
  useEffect(() => {
    const currentRating = parseInt(currentParams.minRating || '0');
    if (debouncedMinRating !== currentRating) {
      updateURL({ minRating: debouncedMinRating === 0 ? undefined : debouncedMinRating.toString() });
    }
  }, [debouncedMinRating]);

  const handleSortChange = (value: string) => {
    updateURL({ sortBy: value === 'relevance' ? undefined : value });
  };

  const handleServeTimeChange = (value: string) => {
    updateURL({ serveTime: value === 'all' ? undefined : value });
  };
  
  const handleLocationChange = useCallback((location: LocationData | null) => {
    if (location) {
      updateURL({ 
        lat: location.lat.toString(), 
        lng: location.lng.toString() 
      });
    } else {
      updateURL({ lat: undefined, lng: undefined });
    }
  }, [updateURL]);

  const hasLocation = currentParams.lat && currentParams.lng;
  
  return (
    <div className="w-full">
      <Accordion type="multiple" defaultValue={['category', 'foodtype', 'radius', 'rating', 'price']} className="w-full">
        <AccordionItem value="category">
          <AccordionTrigger className="font-semibold">Category</AccordionTrigger>
          <AccordionContent>
            <RadioGroup value={currentParams.categoryId || ""} onValueChange={handleCategoryChange}>
              {categories.map(category => (
                <div key={category.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={category.id} id={category.id} />
                  <Label htmlFor={category.id}>{category.name}</Label>
                </div>
              ))}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>
        {currentParams.categoryId && (
          <AccordionItem value="subcategory">
            <AccordionTrigger className="font-semibold">Subcategory</AccordionTrigger>
            <AccordionContent>
              <RadioGroup value={currentParams.subcategoryId || ""} onValueChange={handleSubcategoryChange}>
                {categories.find(c => c.id === currentParams.categoryId)?.subcategories.map(subcategory => (
                  <div key={subcategory.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={subcategory.id} id={subcategory.id} />
                    <Label htmlFor={subcategory.id}>{subcategory.name}</Label>
                  </div>
                ))}
              </RadioGroup>
            </AccordionContent>
          </AccordionItem>
        )}
        <AccordionItem value="foodtype">
          <AccordionTrigger className="font-semibold">Food Type</AccordionTrigger>
          <AccordionContent className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isVeg" 
                checked={currentParams.isEggless === 'true'} 
                onCheckedChange={(checked) => handleCheckboxChange('isEggless', !!checked)} 
              />
              <Label htmlFor="isVeg" className="flex items-center gap-2">
                <span className="w-3 h-3 border border-green-600 rounded-sm flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                </span>
                Veg
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isNonVeg" 
                checked={currentParams.isEggless === 'false'} 
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateURL({ isEggless: 'false' });
                  } else {
                    updateURL({ isEggless: undefined });
                  }
                }} 
              />
              <Label htmlFor="isNonVeg" className="flex items-center gap-2">
                <span className="w-3 h-3 border border-red-600 rounded-sm flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-red-600 rounded-sm"></span>
                </span>
                Non-Veg
              </Label>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="rating">
          <AccordionTrigger className="font-semibold flex items-center gap-2">
            <Star className="h-4 w-4" />
            Rating
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Any</span>
                <span>{minRating === 0 ? 'Any' : `${minRating}+ stars`}</span>
                <span>5 stars</span>
              </div>
              <Slider
                value={[minRating]}
                max={5}
                min={0}
                step={1}
                onValueChange={handleRatingChange}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                {[0, 1, 2, 3, 4, 5].map((rating) => (
                  <div key={rating} className="flex items-center">
                    {rating === 0 ? (
                      <span>Any</span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{rating}+</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="price">
          <AccordionTrigger className="font-semibold flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Price Range
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>₹{priceRange[0]}</span>
                <span>₹{priceRange[1]}</span>
              </div>
              <Slider
                value={priceRange}
                max={1000}
                min={0}
                step={10}
                onValueChange={handlePriceRangeChange}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>₹0</span>
                <span>₹500</span>
                <span>₹1000+</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="availability">
          <AccordionTrigger className="font-semibold flex items-center gap-2">
            <Package className="h-4 w-4" />
            Availability
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="inStock" 
                checked={currentParams.inStock === 'true'} 
                onCheckedChange={(checked) => {
                  updateURL({ inStock: checked ? 'true' : undefined });
                }} 
              />
              <Label htmlFor="inStock" className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                In Stock Only
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="hasDiscount" 
                checked={currentParams.hasDiscount === 'true'} 
                onCheckedChange={(checked) => {
                  updateURL({ hasDiscount: checked ? 'true' : undefined });
                }} 
              />
              <Label htmlFor="hasDiscount" className="flex items-center gap-2">
                <Percent className="h-3 w-3 text-red-500" />
                On Discount
              </Label>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="servetime">
          <AccordionTrigger className="font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Serve Time
          </AccordionTrigger>
          <AccordionContent>
            <Select value={currentParams.serveTime || 'all'} onValueChange={handleServeTimeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select serve time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Times</SelectItem>
                <SelectItem value="morning">Morning (6AM - 12PM)</SelectItem>
                <SelectItem value="afternoon">Afternoon (12PM - 6PM)</SelectItem>
                <SelectItem value="evening">Evening (6PM - 10PM)</SelectItem>
                <SelectItem value="available-now">Available Now</SelectItem>
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sort">
          <AccordionTrigger className="font-semibold">Sort By</AccordionTrigger>
          <AccordionContent>
            <Select value={currentParams.sortBy || 'relevance'} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="distance">Nearest First</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="radius">
          <AccordionTrigger className="font-semibold">Distance</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>1km</span>
                <span>{radius}km</span>
                <span>20km</span>
              </div>
              <Slider
                value={[radius]}
                max={20}
                min={1}
                step={1}
                onValueChange={handleRadiusChange}
              />
              <LocationButton 
                onLocationChange={handleLocationChange}
                variant="outline"
                size="default"
                showAddress={true}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}