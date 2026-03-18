"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { fetchShopDetail, fetchShopDishes, resetShopDetail, setFilter, setDishPage } from '@/redux/features/publicShopDetailSlice';

import { createDish, fetchCategories, fetchTags } from '@/redux/features/dishSlice';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, MapPin, Phone, MessageCircle, Clock, Filter, Search, Plus, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { toggleFavoriteShop } from '@/redux/features/favoritesSlice';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';
import DishCard from '@/components/dishes/DishCard';
import FeaturedDishesSection from '@/components/shops/FeaturedDishesSection';
import { ShopReviewSection } from '@/components/shops/ShopReviewSection';

export default function ShopDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const dispatch = useAppDispatch();
  
  // Get category and subcategory from URL query parameters
  const categoryId = searchParams.get('categoryId');
  const subcategoryId = searchParams.get('subcategoryId');
  
  const { shop, dishes, filters, pagination, shopLoading, dishesLoading, shopError, dishesError } = 
    useAppSelector((state) => state.publicShopDetail);
  const { loading: favoriteLoading } = useAppSelector((state) => state.favorites);
  const { requireAuth } = useRequireAuth();
  const { session, isAuthenticated } = useAuth();
  
  // Check if current user is the shop owner
  const isShopOwner = false; // TODO: Implement proper owner check
  
  // State for categories and subcategories
  const [allCategories, setAllCategories] = useState<{id: string; name: string; subcategories: {id: string; name: string}[]}[]>([]);
  const [subcategories, setSubcategories] = useState<{id: string; name: string}[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch categories from database
  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setAllCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchAllCategories();
  }, []);
  
  // Fetch shop details on mount
  useEffect(() => {
    dispatch(fetchShopDetail(slug));
    
    // Apply filters from URL parameters if they exist
    if (categoryId) {
      dispatch(setFilter({ key: 'categoryId', value: categoryId }));
    }
    
    if (subcategoryId) {
      dispatch(setFilter({ key: 'subcategoryId', value: subcategoryId }));
    }
    
    // Cleanup on unmount
    return () => {
      dispatch(resetShopDetail());
    };
  }, [dispatch, slug, categoryId, subcategoryId]);
  
  // Fetch shop dishes when shop is loaded or filters/pagination change
  useEffect(() => {
    if (shop) {
      dispatch(fetchShopDishes(slug));
    }
  }, [
    dispatch, 
    slug, 
    shop, 
    filters.search, 
    filters.categoryId, 
    filters.subcategoryId, 
    filters.tagId,
    filters.isVeg,
    pagination.page
  ]);
  
  // Update subcategories when category changes
  useEffect(() => {
    if (filters.categoryId) {
      const selectedCategory = allCategories.find(cat => cat.id === filters.categoryId);
      setSubcategories(selectedCategory?.subcategories || []);
    } else {
      setSubcategories([]);
    }
  }, [filters.categoryId, allCategories]);
  

  
  // Handle search input change and submission
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setFilter({ key: 'search', value: searchInput }));
  };
  
  // Handle category change
  const handleCategoryChange = (value: string) => {
    if (value === '') {
      dispatch(setFilter({ key: 'categoryId', value: null }));
      dispatch(setFilter({ key: 'subcategoryId', value: null }));
    } else {
      dispatch(setFilter({ key: 'categoryId', value }));
      dispatch(setFilter({ key: 'subcategoryId', value: null }));
    }
  };
  
  // Handle favorite toggle
  const handleToggleFavorite = () => {
    if (shop) {
      requireAuth(() => {
        dispatch(toggleFavoriteShop({ shopId: shop.id, currentFavoriteStatus: shop.isFavorite || false }));
      });
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  // Filter dishes based on all active filters
  const filteredDishes = dishes.filter(dish => {
    // Category filter
    if (filters.categoryId && dish.category.id !== filters.categoryId) return false;
    
    // Subcategory filter
    if (filters.subcategoryId && dish.subcategory?.id !== filters.subcategoryId) return false;
    
    // Veg/Non-Veg filter
    if (filters.isVeg !== undefined && filters.isVeg !== null && dish.isVeg !== filters.isVeg) return false;
    
    return true;
  });
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Shop Details */}
      <div className="relative">
        {/* Banner Image */}
        <div className="relative h-[50vh] min-h-[400px] w-full overflow-hidden md:mt-16">
          {shopLoading ? (
            <Skeleton className="h-full w-full" />
          ) : shop?.bannerImage ? (
            <>
              <Image
                src={shop.bannerImage}
                alt={shop.name}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />
            </>
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-orange-100 via-orange-50 to-amber-100 relative overflow-hidden">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0">
                {/* Floating bakery items across the entire area */}
                <div className="absolute top-10 left-10 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
                  <span className="text-3xl opacity-20">🍰</span>
                </div>
                <div className="absolute top-20 right-20 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}>
                  <span className="text-2xl opacity-15">🥖</span>
                </div>
                <div className="absolute top-1/3 left-1/4 animate-bounce" style={{ animationDelay: '1s', animationDuration: '3.5s' }}>
                  <span className="text-4xl opacity-10">🧁</span>
                </div>
                <div className="absolute top-1/2 right-1/3 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '2s' }}>
                  <span className="text-3xl opacity-20">🍞</span>
                </div>
                <div className="absolute bottom-1/3 left-1/3 animate-bounce" style={{ animationDelay: '2s', animationDuration: '4s' }}>
                  <span className="text-2xl opacity-15">🥐</span>
                </div>
                <div className="absolute bottom-20 right-10 animate-bounce" style={{ animationDelay: '0.8s', animationDuration: '3s' }}>
                  <span className="text-3xl opacity-20">🍪</span>
                </div>
                <div className="absolute top-1/4 right-1/4 animate-bounce" style={{ animationDelay: '2.5s', animationDuration: '2.8s' }}>
                  <span className="text-2xl opacity-10">🥧</span>
                </div>
                <div className="absolute bottom-1/4 left-10 animate-bounce" style={{ animationDelay: '1.8s', animationDuration: '3.2s' }}>
                  <span className="text-4xl opacity-15">🍩</span>
                </div>
              </div>
              
              {/* Center Content */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-6 mb-6">
                    <div className="animate-bounce" style={{ animationDelay: '0s' }}>
                      <span className="text-6xl">🍰</span>
                    </div>
                    <div className="animate-bounce" style={{ animationDelay: '0.3s' }}>
                      <span className="text-6xl">🥖</span>
                    </div>
                    <div className="animate-bounce" style={{ animationDelay: '0.6s' }}>
                      <span className="text-6xl">🧁</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold animate-pulse" style={{ color: '#451a03' }}>{shop?.name || "Fresh Bakery"}</div>
                  <div className="text-lg mt-2 animate-pulse" style={{ color: '#92400e', animationDelay: '0.5s' }}>Delicious treats await you!</div>
                </div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/50" />
            </div>
          )}
          
          {/* Shop Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
            <div className="container mx-auto flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Logo */}
                {!shopLoading && shop?.logoUrl && (
                  <div className="h-20 w-20 rounded-full border-2 border-white overflow-hidden bg-white shadow-lg hidden md:block">
                    <Image
                      src={shop.logoUrl}
                      alt={`${shop.name} logo`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                
                <div>
                  {shopLoading ? (
                    <>
                      <Skeleton className="h-8 w-48 bg-white/20 mb-2" />
                      <Skeleton className="h-4 w-64 bg-white/20" />
                    </>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold">{shop?.name}</h1>
                      {shop?.description && (
                        <p className="text-white/80 mt-1 line-clamp-2">{shop.description}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              {/* Favorite Button */}
              {!shopLoading && shop && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleToggleFavorite}
                  disabled={favoriteLoading}
                  className={`px-4 py-2 rounded-full flex items-center gap-2 transition-colors ${shop.isFavorite ? 'bg-red-500 text-white' : 'bg-white/20 backdrop-blur-sm hover:bg-white/30'}`}
                >
                  <Heart className={`h-4 w-4 ${shop.isFavorite ? 'fill-white' : ''} ${favoriteLoading ? 'animate-pulse' : ''}`} />
                  <span>{shop.isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>
        
        {/* Shop Info Cards */}
        <div className="container mx-auto px-4 -mt-6 relative z-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card shadow-lg rounded-xl p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact & Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Location & Contact</h3>
                
                {shopLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <span className="text-sm">{shop?.address}</span>
                    </div>
                    
                    {shop?.contactPhone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-primary" />
                        <a href={`tel:${shop.contactPhone}`} className="text-sm hover:underline">
                          {shop.contactPhone}
                        </a>
                      </div>
                    )}
                    
                    {(shop as any)?.contactPhone2 && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-primary" />
                        <a href={`tel:${(shop as any).contactPhone2}`} className="text-sm hover:underline">
                          {(shop as any).contactPhone2}
                        </a>
                      </div>
                    )}
                    
                    {(shop as any)?.contactPhone3 && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-primary" />
                        <a href={`tel:${(shop as any).contactPhone3}`} className="text-sm hover:underline">
                          {(shop as any).contactPhone3}
                        </a>
                      </div>
                    )}
                    
                    {shop?.whatsapp && (
                      <div className="flex items-center gap-3">
                        <MessageCircle className="h-5 w-5 text-primary" />
                        <a 
                          href={`https://wa.me/${shop.whatsapp}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm hover:underline"
                        >
                          WhatsApp Chat
                        </a>
                      </div>
                    )}
                    
                    {(shop as any)?.establishedYear && (
                      <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                        <span className="text-sm">Established {(shop as any).establishedYear}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {/* Opening Hours */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Opening Hours</h3>
                
                {shopLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div className="text-sm">
                      <p>Monday - Friday: 8:00 AM - 8:00 PM</p>
                      <p>Saturday: 9:00 AM - 7:00 PM</p>
                      <p>Sunday: 10:00 AM - 6:00 PM</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Menu Section */}
      <div className="container mx-auto py-12 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-3xl font-bold">Our Menu</h2>
            
            {/* Search Bar */}
            <div className="w-full md:w-96">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search dishes..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </form>
            </div>
          </div>
          
          {/* Category Tabs with Filters */}
          <div className="bg-card rounded-xl shadow-sm border border-border/20 overflow-hidden">
            {/* Filter Bar */}
            <div className="flex items-center justify-between p-4 border-b border-border/20">
              <h3 className="text-lg font-semibold">Filter Dishes</h3>
              <Button 
                variant={showFilters ? "default" : "ghost"}
                size="sm" 
                className="flex items-center gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
            </div>
            
            {/* Advanced Filters */}
            {showFilters && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-4 space-y-4 bg-muted/20"
              >
                {/* Active Filters Display */}
                {(filters.categoryId || filters.subcategoryId || filters.isVeg !== null) && (
                  <div className="flex flex-wrap gap-2 pb-2 border-b border-border/20">
                    <span className="text-sm font-medium text-muted-foreground">Active Filters:</span>
                    {filters.categoryId && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {allCategories.find(c => c.id === filters.categoryId)?.name}
                        <button onClick={() => handleCategoryChange('')} className="ml-1 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {filters.subcategoryId && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {subcategories.find(s => s.id === filters.subcategoryId)?.name}
                        <button onClick={() => dispatch(setFilter({ key: 'subcategoryId', value: null }))} className="ml-1 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {filters.isVeg === true && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Veg
                        <button onClick={() => dispatch(setFilter({ key: 'isVeg', value: null }))} className="ml-1 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {filters.isVeg === false && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Non-Veg
                        <button onClick={() => dispatch(setFilter({ key: 'isVeg', value: null }))} className="ml-1 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category Filter */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Category</label>
                      {filters.categoryId && (
                        <button 
                          onClick={() => handleCategoryChange('')}
                          className="text-xs text-primary hover:underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <select 
                      className="w-full p-2 rounded-md border border-input bg-background text-sm"
                      value={filters.categoryId || ''}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      {allCategories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Subcategory Filter */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Subcategory</label>
                      {filters.subcategoryId && (
                        <button 
                          onClick={() => dispatch(setFilter({ key: 'subcategoryId', value: null }))}
                          className="text-xs text-primary hover:underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <select 
                      className="w-full p-2 rounded-md border border-input bg-background text-sm"
                      value={filters.subcategoryId || ''}
                      onChange={(e) => dispatch(setFilter({ key: 'subcategoryId', value: e.target.value || null }))}
                      disabled={!filters.categoryId || subcategories.length === 0}
                    >
                      <option value="">All Subcategories</option>
                      {subcategories.map(subcategory => (
                        <option key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Veg/Non-Veg Filters */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Food Type</label>
                    <div className="flex flex-wrap gap-2">
                      <Badge 
                        variant="outline" 
                        className={`cursor-pointer hover:bg-green-100 ${filters.isVeg === true ? 'bg-green-100 border-green-500' : ''}`}
                        onClick={() => dispatch(setFilter({ key: 'isVeg', value: filters.isVeg === true ? null : true }))}
                      >
                        <span className="w-3 h-3 border border-green-600 rounded-sm flex items-center justify-center mr-1">
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                        </span>
                        Veg
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`cursor-pointer hover:bg-red-100 ${filters.isVeg === false ? 'bg-red-100 border-red-500' : ''}`}
                        onClick={() => dispatch(setFilter({ key: 'isVeg', value: filters.isVeg === false ? null : false }))}
                      >
                        <span className="w-3 h-3 border border-red-600 rounded-sm flex items-center justify-center mr-1">
                          <span className="w-1.5 h-1.5 bg-red-600 rounded-sm"></span>
                        </span>
                        Non-Veg
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end pt-2 border-t border-border/20">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      dispatch(setFilter({ key: 'search', value: '' }));
                      dispatch(setFilter({ key: 'categoryId', value: null }));
                      dispatch(setFilter({ key: 'subcategoryId', value: null }));
                      dispatch(setFilter({ key: 'isVeg', value: null }));
                      setSearchInput('');
                    }}
                    className="flex items-center gap-1"
                  >
                    <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                    </svg>
                    Reset All Filters
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Dish Grid */}
          {dishesLoading && dishes.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(6)].map((_, i) => (
                <DishCardSkeleton key={i} />
              ))}
            </div>
          ) : dishesError ? (
            <div className="p-8 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{dishesError}</p>
            </div>
          ) : filteredDishes.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No dishes found matching your criteria.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  dispatch(setFilter({ key: 'search', value: '' }));
                  dispatch(setFilter({ key: 'categoryId', value: null }));
                  dispatch(setFilter({ key: 'subcategoryId', value: null }));
                  dispatch(setFilter({ key: 'isVeg', value: null }));
                  setSearchInput('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <motion.div 
              key={`${filters.categoryId}-${filters.search}-${filters.subcategoryId}`}
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
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            >
              {filteredDishes.map(dish => (
                <motion.div 
                  key={dish.id} 
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <DishCard dish={{
                    id: dish.id,
                    name: dish.name,
                    slug: dish.slug,
                    description: dish.description,
                    imageUrls: dish.imageUrls,
                    price: dish.price,
                    currency: 'INR',
                    originalPrice: undefined,
                    discountPercentage: undefined,
                    isVeg: dish.isVeg,
                    shop: {
                      id: shop?.id || '',
                      name: shop?.name || '',
                      slug: slug,
                      logoUrl: shop?.logoUrl,
                      distance: undefined
                    },
                    isFavorite: dish.isFavorite,
                    isReminder: false,
                    timings: [],
                    avgRating: 0,
                    reviews: []
                  }} />
                </motion.div>
              ))}
            </motion.div>
          )}
          
          {/* Add Dish Tab Content - Only visible to shop owner */}
          {isShopOwner && (
            <div className="mt-8">
              <AddDishForm shopId={shop?.id || ''} onSuccess={() => {
                if (shop?.slug) {
                  dispatch(fetchShopDishes(shop.slug));
                }
              }} />
            </div>
          )}
          
          {/* Load More Button */}
          {!dishesLoading && filteredDishes.length > 0 && pagination.page < pagination.pages && (
            <div className="flex justify-center mt-8">
              <Button 
                variant="outline"
                onClick={() => dispatch(setDishPage(pagination.page + 1))}
                disabled={dishesLoading}
                className="px-8"
              >
                {dishesLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </span>
                ) : (
                  'Load More Dishes'
                )}
              </Button>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Shop Reviews Section */}
      {!shopLoading && shop && (
        <div className="container mx-auto py-12 px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <ShopReviewSection shopId={shop.id} />
          </motion.div>
        </div>
      )}
    </div>
  );
}



// Add Dish Form Component for Shop Owners
interface AddDishFormProps {
  shopId: string;
  onSuccess: () => void;
}

function AddDishForm({ shopId, onSuccess }: AddDishFormProps) {
  const dispatch = useAppDispatch();
  const { loading, error, success, categories, tags, categoriesLoading } = useAppSelector((state) => state.dish);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrls: [] as string[],
    price: 0,
    isVeg: true,
    prepTimeMinutes: 0,
    categoryId: "",
    subcategoryId: null as string | null,
    selectedTags: [] as string[],
    timings: [
      {
        createdAt: { hour: 8, minute: 0 },
        preparedAt: { hour: 9, minute: 0 },
        servedFrom: { hour: 10, minute: 0 },
        servedUntil: { hour: 22, minute: 0 }
      }
    ]
  });
  
  const [subcategories, setSubcategories] = useState<{ id: string; name: string }[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchTags());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success("Dish created successfully!");
      onSuccess();
      // Reset form
      setFormData({
        name: "",
        description: "",
        imageUrls: [],
        price: 0,
        isVeg: true,
        prepTimeMinutes: 0,
        categoryId: "",
        subcategoryId: null,
        selectedTags: [],
        timings: [
          {
            createdAt: { hour: 8, minute: 0 },
            preparedAt: { hour: 9, minute: 0 },
            servedFrom: { hour: 10, minute: 0 },
            servedUntil: { hour: 22, minute: 0 }
          }
        ]
      });
      setSubcategories([]);
      setNewImageUrl("");
      setCustomTags([]);
    }
    
    if (error) {
      toast.error(error);
    }
  }, [success, error, onSuccess]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: parseFloat(value) || 0 });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({ ...formData, [name]: checked });
  };

  const handleCategoryChange = (value: string) => {
    const category = categories.find(cat => cat.id === value);
    setFormData({ 
      ...formData, 
      categoryId: value,
      subcategoryId: null
    });
    
    if (category) {
      setSubcategories(category.subcategories || []);
    } else {
      setSubcategories([]);
    }
  };

  const handleSubcategoryChange = (value: string) => {
    setFormData({ ...formData, subcategoryId: value });
  };

  const handleTagToggle = (tagId: string) => {
    setFormData(prev => {
      const selectedTags = [...prev.selectedTags];
      
      if (selectedTags.includes(tagId)) {
        return { 
          ...prev, 
          selectedTags: selectedTags.filter(id => id !== tagId) 
        };
      } else {
        return { 
          ...prev, 
          selectedTags: [...selectedTags, tagId] 
        };
      }
    });
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) {
      toast.error("Please enter a valid image URL");
      return;
    }
    
    if (formData.imageUrls.length >= 4) {
      toast.error("Maximum 4 images allowed");
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      imageUrls: [...prev.imageUrls, newImageUrl.trim()]
    }));
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    if (formData.imageUrls.length + files.length > 4) {
      setUploadError(`You can only upload a maximum of 4 images. You can select ${4 - formData.imageUrls.length} more.`);
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'dishes');
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload image');
        }
        
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to upload image');
        }
        
        return result.url;
      });
      
      const uploadedUrls = await Promise.all(uploadPromises);
      
      setFormData(prev => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...uploadedUrls]
      }));
      
    } catch (error) {
      console.error('Image upload error:', error);
      setUploadError('Failed to upload one or more images. Please try again.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const formatTagSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.categoryId || formData.price <= 0) {
      toast.error("Please fill all required fields");
      return;
    }
    
    const customTagsData = customTags.map(tagName => ({
      name: tagName,
      slug: formatTagSlug(tagName)
    }));
    
    const dishData = {
      ...formData,
      price: Number(formData.price),
      customTags: customTagsData
    };
    
    dispatch(createDish({ shopId, formData: dishData }));
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add New Dish to Your Shop
        </CardTitle>
        <p className="text-sm text-muted-foreground">Create a new dish for your shop menu</p>
      </CardHeader>
      <CardContent className="px-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Dish Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter dish name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price || ""}
                  onChange={handleNumberChange}
                  className="pl-7"
                  required
                />
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              {categoriesLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading categories...</span>
                </div>
              ) : (
                <select 
                  className="w-full p-2 rounded-md border border-input bg-background"
                  value={formData.categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  required
                >
                  <option value="">Select category</option>
                  {categories?.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Subcategory</Label>
              <select 
                className="w-full p-2 rounded-md border border-input bg-background"
                value={formData.subcategoryId || ""}
                onChange={(e) => handleSubcategoryChange(e.target.value)}
                disabled={!formData.categoryId || subcategories.length === 0}
              >
                <option value="">Select subcategory</option>
                {subcategories?.map(subcategory => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your dish..."
              className="w-full p-3 rounded-md border border-input bg-background min-h-[100px] resize-y"
              rows={3}
            />
          </div>

          {/* Images */}
          <div className="space-y-4">
            <Label>Images ({formData.imageUrls.length}/4)</Label>
            
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Enter image URL"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                disabled={formData.imageUrls.length >= 4}
              />
              <Button 
                type="button" 
                onClick={handleAddImage} 
                disabled={formData.imageUrls.length >= 4}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            
            <div className="border-2 border-dashed rounded-lg p-4">
              <label htmlFor="image-upload" className="cursor-pointer block">
                <div className="text-center">
                  <svg className="w-8 h-8 mb-2 text-gray-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400">PNG, JPG or WebP (MAX. 4 images)</p>
                </div>
                <input 
                  id="image-upload" 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={formData.imageUrls.length >= 4 || isUploading}
                />
              </label>
              {isUploading && (
                <div className="flex items-center justify-center mt-2">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Uploading...</span>
                </div>
              )}
              {uploadError && (
                <p className="text-sm text-destructive mt-2">{uploadError}</p>
              )}
            </div>
            
            {formData.imageUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.imageUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 z-10 hover:bg-red-600"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <img 
                      src={url} 
                      alt={`Dish image ${index + 1}`} 
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attributes */}
          <div className="space-y-4">
            <Label>Dish Attributes</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="font-medium">Vegetarian</Label>
                  <p className="text-xs text-muted-foreground">Suitable for vegetarians</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isVeg}
                  onChange={(e) => handleSwitchChange("isVeg", e.target.checked)}
                  className="rounded"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prepTimeMinutes">Prep Time (minutes)</Label>
                <Input
                  id="prepTimeMinutes"
                  name="prepTimeMinutes"
                  type="number"
                  min="0"
                  value={formData.prepTimeMinutes || ""}
                  onChange={handleNumberChange}
                  placeholder="e.g., 90"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <Label>Tags ({formData.selectedTags.length} selected)</Label>
            <div className="border rounded-lg p-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {tags?.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      formData.selectedTags.includes(tag.id)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-muted border-border'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
              
              {customTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {customTags.map((tag, index) => (
                    <div key={index} className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 border border-green-200">
                      <span>{tag}</span>
                      <span className="text-xs">(new)</span>
                      <button
                        type="button"
                        onClick={() => setCustomTags(prev => prev.filter((_, i) => i !== index))}
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Add custom tag..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = (e.target as HTMLInputElement).value.trim();
                      if (value && !customTags.includes(value)) {
                        setCustomTags(prev => [...prev, value]);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <Button 
                  type="button" 
                  size="sm"
                  onClick={(e) => {
                    const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                    const value = input?.value.trim();
                    if (value && !customTags.includes(value)) {
                      setCustomTags(prev => [...prev, value]);
                      input.value = '';
                    }
                  }}
                >
                  Add Tag
                </Button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button 
              type="submit" 
              disabled={loading}
              className="px-6"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Dish
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Dish Card Skeleton
function DishCardSkeleton() {
  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-sm border border-border/40">
      <div className="relative">
        <Skeleton className="h-40 w-full" />
        <div className="absolute top-3 left-3">
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="absolute top-3 right-3">
          <Skeleton className="h-7 w-7 rounded-full" />
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
      <div className="p-3 space-y-2">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-3 w-full" />
        <div className="flex items-center justify-between pt-1">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}