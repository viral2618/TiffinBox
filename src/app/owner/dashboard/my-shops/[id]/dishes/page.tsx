"use client";

import { useEffect, useState, useCallback } from "react";
import { debounce } from "lodash";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchShopDetail, fetchShopDishes, DishFilters } from "@/redux/features/shopDetailSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { 
  Loader2, 
  Search, 
  Plus, 
  ArrowLeft, 
  Edit, 
  Filter, 
  SlidersHorizontal, 
  X, 
  ChevronDown 
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function ShopDishesPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const shopId = params.id as string;
  
  // Ensure shopId is valid
  useEffect(() => {
    if (!shopId) {
      console.error('Shop ID is missing');
      router.push('/owner/dashboard/my-shops');
    }
  }, [shopId, router]);
  
  const { 
    shop, 
    dishes, 
    pagination,
    shopLoading, 
    dishesLoading, 
    shopError, 
    dishesError 
  } = useAppSelector((state) => state.shopDetail);

  // Filter state
  const [filters, setFilters] = useState<DishFilters>({
    page: 1,
    limit: 12,
    search: "",
    sortBy: "name",
    sortOrder: "asc"
  });
  
  // Search input state (for debouncing)
  const [searchInput, setSearchInput] = useState("");

  // Categories and subcategories from dishes
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    if (shopId) {
      dispatch(fetchShopDetail(shopId));
    }
  }, [dispatch, shopId]);
  
  useEffect(() => {
    if (shopId) {
      // Explicitly log the shopId to verify it's correct
      console.log('Dispatching fetchShopDishes with shopId:', shopId);
      // Make sure we're passing a valid object with shopId
      dispatch(fetchShopDishes({ 
        shopId, 
        filters: {
          ...filters,
          page: filters.page || 1,
          limit: filters.limit || 12
        }
      }));
    }
  }, [dispatch, shopId, filters]);

  // Extract unique categories from dishes
  useEffect(() => {
    if (dishes.length > 0) {
      const uniqueCategories = Array.from(
        new Map(dishes.map(dish => [dish.category.id, dish.category])).values()
      );
      setCategories(uniqueCategories);
    }
  }, [dishes]);

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.subcategory) count++;
    if (filters.isVeg) count++;
    if (filters.isOutOfStock) count++;
    if (filters.isMarketingEnabled) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.tagId) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setFilters(prev => ({ ...prev, search: value, page: 1 }));
    }, 500),
    []
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedSearch(value);
  };

  const handleFilterChange = (key: keyof DishFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchInput("");
    setFilters({
      page: 1,
      limit: 12,
      search: "",
      sortBy: "name",
      sortOrder: "asc"
    });
  };

  const handleAddDish = () => {
    router.push(`/owner/dashboard/my-shops/${shopId}/dishes/create`);
  };

  if (shopLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (shopError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-destructive">{shopError}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p>Shop not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Breadcrumb and Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/owner/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/owner/dashboard/my-shops" className="hover:text-foreground">
            My Shops
          </Link>
          <span>/</span>
          <Link href={`/owner/dashboard/my-shops/${shopId}`} className="hover:text-foreground">
            {shop.name}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Dishes</span>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">{shop.name} - Dishes</h1>
          </div>
          <Button onClick={handleAddDish}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Dish
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search dishes..."
              className="pl-8"
              value={searchInput}
              onChange={handleSearchChange}
            />
            {searchInput && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-9 w-9"
                onClick={() => {
                  setSearchInput("");
                  setFilters(prev => ({ ...prev, search: "", page: 1 }));
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Sort</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  onClick={() => setFilters(prev => ({ ...prev, sortBy: "name", sortOrder: "asc" }))}
                  className={filters.sortBy === "name" && filters.sortOrder === "asc" ? "bg-accent" : ""}
                >
                  Name (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setFilters(prev => ({ ...prev, sortBy: "name", sortOrder: "desc" }))}
                  className={filters.sortBy === "name" && filters.sortOrder === "desc" ? "bg-accent" : ""}
                >
                  Name (Z-A)
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setFilters(prev => ({ ...prev, sortBy: "price", sortOrder: "asc" }))}
                  className={filters.sortBy === "price" && filters.sortOrder === "asc" ? "bg-accent" : ""}
                >
                  Price (Low to High)
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setFilters(prev => ({ ...prev, sortBy: "price", sortOrder: "desc" }))}
                  className={filters.sortBy === "price" && filters.sortOrder === "desc" ? "bg-accent" : ""}
                >
                  Price (High to Low)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filter</span>
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filter Dishes</SheetTitle>
                  <SheetDescription>
                    Apply filters to find specific dishes
                  </SheetDescription>
                </SheetHeader>
                
                <div className="py-6 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Categories</h3>
                    <Select 
                      value={filters.category || "all"} 
                      onValueChange={(value) => handleFilterChange("category", value === "all" ? undefined : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Dish Types</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="isVeg" 
                          checked={filters.isVeg || false}
                          onCheckedChange={(checked) => 
                            handleFilterChange("isVeg", checked ? true : undefined)
                          }
                        />
                        <Label htmlFor="isVeg">Vegetarian</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="isOutOfStock" 
                          checked={filters.isOutOfStock || false}
                          onCheckedChange={(checked) => 
                            handleFilterChange("isOutOfStock", checked ? true : undefined)
                          }
                        />
                        <Label htmlFor="isOutOfStock">Out of Stock</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="isMarketingEnabled" 
                          checked={filters.isMarketingEnabled || false}
                          onCheckedChange={(checked) => 
                            handleFilterChange("isMarketingEnabled", checked ? true : undefined)
                          }
                        />
                        <Label htmlFor="isMarketingEnabled">Marketing Enabled</Label>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Price Range</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minPrice">Min Price (₹)</Label>
                        <Input
                          id="minPrice"
                          type="number"
                          placeholder="0"
                          value={filters.minPrice || ""}
                          onChange={(e) => handleFilterChange("minPrice", e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxPrice">Max Price (₹)</Label>
                        <Input
                          id="maxPrice"
                          type="number"
                          placeholder="10000"
                          value={filters.maxPrice || ""}
                          onChange={(e) => handleFilterChange("maxPrice", e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <SheetFooter className="flex flex-row justify-between sm:justify-between gap-2">
                  <Button variant="outline" onClick={clearFilters}>
                    Clear All
                  </Button>
                  <SheetClose asChild>
                    <Button>Apply Filters</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        {/* Active filters display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {filters.category && categories.find(c => c.id === filters.category) && (
              <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                Category: {categories.find(c => c.id === filters.category)?.name}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 ml-1" 
                  onClick={() => handleFilterChange("category", undefined)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {filters.isVeg && (
              <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                Vegetarian
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 ml-1" 
                  onClick={() => handleFilterChange("isVeg", undefined)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {filters.isOutOfStock && (
              <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                Out of Stock
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 ml-1" 
                  onClick={() => handleFilterChange("isOutOfStock", undefined)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {filters.isMarketingEnabled && (
              <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                Marketing Enabled
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 ml-1" 
                  onClick={() => handleFilterChange("isMarketingEnabled", undefined)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {(filters.minPrice || filters.maxPrice) && (
              <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                Price: {filters.minPrice || 0} - {filters.maxPrice || '∞'}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 ml-1" 
                  onClick={() => {
                    handleFilterChange("minPrice", undefined);
                    handleFilterChange("maxPrice", undefined);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {activeFiltersCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs" 
                onClick={clearFilters}
              >
                Clear All
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Dishes Grid */}
      {dishesLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : dishesError ? (
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{dishesError}</p>
          <Button onClick={() => dispatch(fetchShopDishes({ shopId, filters }))}>
            Try Again
          </Button>
        </div>
      ) : dishes.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/10 flex flex-col items-center">
          <div className="bg-muted/20 p-4 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
              <path d="M7 2v20"/>
              <path d="M21 15V2"/>
              <path d="M18 15h-8a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2Z"/>
            </svg>
          </div>
          <h3 className="text-xl font-medium mb-2">No dishes found</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {activeFiltersCount > 0 
              ? "Try adjusting your filters to see more results." 
              : "Start adding dishes to your shop menu. Dishes will appear here and be visible to your customers."}
          </p>
          {activeFiltersCount > 0 ? (
            <Button onClick={clearFilters} className="gap-2">
              <Filter className="h-4 w-4" />
              Clear Filters
            </Button>
          ) : (
            <Button onClick={handleAddDish} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Dish
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {dishes.map((dish) => (
              <Card key={dish.id} className="overflow-hidden border hover:shadow-md transition-shadow">
                <div className="relative">
                  {dish.imageUrls.length > 0 ? (
                    <div className="h-36 w-full overflow-hidden">
                      <img 
                        src={dish.imageUrls[0]} 
                        alt={dish.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-36 w-full bg-muted/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/50">
                        <path d="M7 19a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7Z"/>
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                        <circle cx="11.5" cy="8.5" r="1.5"/>
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {dish.isVeg && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">Vegetarian</Badge>
                    )}
                    {dish.isOutOfStock && (
                      <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">Out of Stock</Badge>
                    )}
                    {dish.isMarketingEnabled && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">Featured</Badge>
                    )}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-base">{dish.name}</h3>
                    <div className="text-base font-bold">₹{dish.price}</div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {dish.description || "No description provided."}
                  </p>
                  
                  <div className="flex items-center text-xs mb-2">
                    <span className="font-medium mr-1 text-muted-foreground">Category:</span> 
                    <span className="text-xs">{dish.category.name}</span>
                    {dish.subcategory && (
                      <span className="ml-1 text-xs">
                        &rsaquo; {dish.subcategory.name}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {dish.dishTags && dish.dishTags.length > 0 ? dish.dishTags.map((dishTag) => (
                      <Badge key={dishTag.tag.id} variant="outline" className="text-xs px-1 py-0 h-5">
                        {dishTag.tag.name}
                      </Badge>
                    )) : null}
                  </div>
                  
                  <div className="flex justify-end border-t pt-3">
                    <Link href={`/owner/dashboard/my-shops/${shopId}/dishes/${dish.id}`}>
                      <Button variant="outline" size="sm" className="h-8">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit Dish
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => pagination.page > 1 && handlePageChange(pagination.page - 1)}
                      className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, and pages around current page
                    if (
                      page === 1 || 
                      page === pagination.totalPages || 
                      (page >= pagination.page - 1 && page <= pagination.page + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink 
                            isActive={page === pagination.page}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    
                    // Show ellipsis for gaps
                    if (
                      (page === 2 && pagination.page > 3) || 
                      (page === pagination.totalPages - 1 && pagination.page < pagination.totalPages - 2)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <span className="px-2">...</span>
                        </PaginationItem>
                      );
                    }
                    
                    return null;
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => pagination.page < pagination.totalPages && handlePageChange(pagination.page + 1)}
                      className={pagination.page >= pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}