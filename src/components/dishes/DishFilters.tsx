import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { setFilter } from '@/redux/features/publicDishSlice';
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
import { MapPin, Filter } from 'lucide-react';
import { useLocation } from '@/hooks/use-location';

interface Category {
  id: string;
  name: string;
  subcategories: {
    id: string;
    name: string;
  }[];
}

const DishFilters: React.FC = () => {
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector((state) => state.publicDish);
  const { location, isLoading: locationLoading, toggleLocation, isEnabled } = useLocation();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data.categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Memoize handlers to prevent unnecessary re-renders
  const handleCategoryChange = useCallback((categoryId: string) => {
    dispatch(setFilter({ key: 'categoryId', value: filters.categoryId === categoryId ? null : categoryId }));
    dispatch(setFilter({ key: 'subcategoryId', value: null }));
  }, [dispatch, filters.categoryId]);
  
  const handleSubcategoryChange = useCallback((subcategoryId: string) => {
    dispatch(setFilter({ key: 'subcategoryId', value: subcategoryId }));
  }, [dispatch]);

  const handleCheckboxChange = useCallback((key: 'isEggless' | 'isPremium' | 'isSpecialToday', value: boolean) => {
    dispatch(setFilter({ key, value }));
  }, [dispatch]);

  const handleRadiusChange = useCallback((value: number[]) => {
    dispatch(setFilter({ key: 'radius', value: value[0] }));
  }, [dispatch]);
  
  // Memoize filtered subcategories
  const filteredSubcategories = useMemo(() => {
    return categories.find(c => c.id === filters.categoryId)?.subcategories || [];
  }, [categories, filters.categoryId]);
  
  // Sync location from hook to Redux
  useEffect(() => {
    if (location) {
      dispatch(setFilter({ key: 'location', value: { lat: location.lat, lng: location.lng } }));
    } else {
      dispatch(setFilter({ key: 'location', value: null }));
    }
  }, [location, dispatch]);
  
  return (
    <div className="p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><Filter className="h-5 w-5" /> Filters</h3>
        <Accordion type="multiple" defaultValue={['category', 'dietary', 'radius']} className="w-full">
            <AccordionItem value="category">
                <AccordionTrigger className="font-semibold">Category</AccordionTrigger>
                <AccordionContent>
                    <RadioGroup value={filters.categoryId || ""} onValueChange={handleCategoryChange}>
                        {categories.map(category => (
                            <div key={category.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={category.id} id={category.id} />
                                <Label htmlFor={category.id}>{category.name}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                </AccordionContent>
            </AccordionItem>
            {filters.categoryId && (
                <AccordionItem value="subcategory">
                    <AccordionTrigger className="font-semibold">Subcategory</AccordionTrigger>
                    <AccordionContent>
                    <RadioGroup value={filters.subcategoryId || ""} onValueChange={handleSubcategoryChange}>
                        {filteredSubcategories.map(subcategory => (
                            <div key={subcategory.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={subcategory.id} id={subcategory.id} />
                                <Label htmlFor={subcategory.id}>{subcategory.name}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                    </AccordionContent>
                </AccordionItem>
            )}
            <AccordionItem value="dietary">
                <AccordionTrigger className="font-semibold">Dietary Needs</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="isEggless" checked={filters.isEggless} onCheckedChange={(checked) => handleCheckboxChange('isEggless', !!checked)} />
                        <Label htmlFor="isEggless">Eggless</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="isPremium" checked={filters.isPremium} onCheckedChange={(checked) => handleCheckboxChange('isPremium', !!checked)} />
                        <Label htmlFor="isPremium">Premium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="isSpecialToday" checked={filters.isSpecialToday} onCheckedChange={(checked) => handleCheckboxChange('isSpecialToday', !!checked)} />
                        <Label htmlFor="isSpecialToday">Today's Special</Label>
                    </div>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="radius">
                <AccordionTrigger className="font-semibold">Distance</AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>1km</span>
                            <span>{filters.radius}km</span>
                            <span>20km</span>
                        </div>
                        <Slider
                            defaultValue={[filters.radius]}
                            max={20}
                            min={1}
                            step={1}
                            onValueChange={handleRadiusChange}
                        />
                        <Button 
                            variant={isEnabled ? "default" : "outline"} 
                            onClick={toggleLocation}
                            className="flex items-center gap-2 w-full"
                            disabled={locationLoading}
                        >
                            <MapPin className="h-4 w-4" />
                            <span>
                              {locationLoading ? "Getting Location..." : 
                               isEnabled ? "Location Enabled" : "Use My Location"}
                            </span>
                        </Button>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
  );
};

export default DishFilters;