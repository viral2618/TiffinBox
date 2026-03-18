import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { 
  setSearchFilter, 
  setFilter,
  setLocation
} from '@/redux/features/publicShopSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, MapPin } from 'lucide-react';
import { useLocation } from '@/hooks/use-location';

interface Category {
  id: string;
  name: string;
  subcategories: {
    id: string;
    name: string;
  }[];
}

const ShopFilters: React.FC = () => {
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector((state) => state.publicShop);
  const { location, isLoading: locationLoading, toggleLocation, isEnabled } = useLocation();
  
  const [searchInput, setSearchInput] = useState(filters.search);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<{id: string; name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Fetch categories on component mount
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
  
  // Update subcategories when category changes
  useEffect(() => {
    if (filters.categoryId) {
      const selectedCategory = categories.find(cat => cat.id === filters.categoryId);
      if (selectedCategory) {
        setSubcategories(selectedCategory.subcategories);
      }
    } else {
      setSubcategories([]);
    }
  }, [filters.categoryId, categories]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };
  
  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setSearchFilter(searchInput));
  };
  
  // Handle category change
  const handleCategoryChange = (value: string) => {
    dispatch(setFilter({ key: 'categoryId', value: value === 'all' ? null : value }));
  };
  
  // Handle subcategory change
  const handleSubcategoryChange = (value: string) => {
    dispatch(setFilter({ key: 'subcategoryId', value: value === 'all' ? null : value }));
  };
  
  // Sync location from hook to Redux
  useEffect(() => {
    if (location) {
      dispatch(setLocation({ lat: location.lat, lng: location.lng }));
    } else {
      dispatch(setLocation(null));
    }
  }, [location, dispatch]);
  
  return (
    <div className="space-y-4 mb-6">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search shops, dishes, or cuisines..."
            value={searchInput}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <Select
            value={filters.categoryId || 'all'}
            onValueChange={handleCategoryChange}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1">
          <Select
            value={filters.subcategoryId || 'all'}
            onValueChange={handleSubcategoryChange}
            disabled={!filters.categoryId || subcategories.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Subcategories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subcategories</SelectItem>
              {subcategories.map((subcategory) => (
                <SelectItem key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          variant={isEnabled ? "default" : "outline"} 
          onClick={toggleLocation}
          className="flex items-center gap-2"
          disabled={locationLoading}
        >
          <MapPin className="h-4 w-4" />
          <span>
            {locationLoading ? "Getting Location..." : 
             isEnabled ? "Location Enabled" : "Use My Location"}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default ShopFilters;