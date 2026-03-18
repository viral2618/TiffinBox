import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { 
  setDishSearchFilter, 
  setDishCategoryFilter, 
  setDishSubcategoryFilter,
  setDishTagFilter
} from '@/redux/features/publicShopDetailSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface DishFiltersProps {
  categories: { id: string; name: string }[];
  subcategories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
}

const DishFilters: React.FC<DishFiltersProps> = ({ categories, subcategories, tags }) => {
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector((state) => state.publicShopDetail);
  
  const [searchInput, setSearchInput] = useState(filters.search);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };
  
  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setDishSearchFilter(searchInput));
  };
  
  // Handle category change
  const handleCategoryChange = (value: string) => {
    dispatch(setDishCategoryFilter(value === 'all' ? null : value));
  };
  
  // Handle subcategory change
  const handleSubcategoryChange = (value: string) => {
    dispatch(setDishSubcategoryFilter(value === 'all' ? null : value));
  };
  
  // Handle tag change
  const handleTagChange = (value: string) => {
    dispatch(setDishTagFilter(value === 'all' ? null : value));
  };
  
  return (
    <div className="space-y-4 mb-6">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search dishes..."
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
        
        <div className="flex-1">
          <Select
            value={filters.tagId || 'all'}
            onValueChange={handleTagChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag.id} value={tag.id}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default DishFilters;