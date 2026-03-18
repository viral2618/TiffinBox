"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CategoryCard from '@/components/cards/category-card';
import type { Category } from '@/lib/categories';
import { useDebounce } from '@/hooks/use-debounce';

interface CategoriesClientProps {
  categories: Category[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  searchParams: { search?: string; page?: string };
}

export default function CategoriesClient({ 
  categories, 
  pagination, 
  searchParams 
}: CategoriesClientProps) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.search || '');
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Update URL with search query
  useEffect(() => {
    const params = new URLSearchParams(urlSearchParams);
    
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
      // Only reset to page 1 when search query actually changes
      if (debouncedSearch !== searchParams.search) {
        params.delete('page');
      }
    } else {
      params.delete('search');
      // Only reset to page 1 when clearing search
      if (searchParams.search) {
        params.delete('page');
      }
    }
    
    const newUrl = params.toString() ? `?${params.toString()}` : '/categories';
    
    // Only navigate if URL actually changed
    const currentUrl = urlSearchParams.toString();
    if (params.toString() !== currentUrl) {
      router.push(newUrl);
    }
  }, [debouncedSearch, router, urlSearchParams, searchParams.search]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(urlSearchParams);
    
    if (page > 1) {
      params.set('page', page.toString());
    } else {
      params.delete('page');
    }
    
    const newUrl = params.toString() ? `?${params.toString()}` : '/categories';
    router.push(newUrl);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      {/* Header with Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">Categories</h1>
          <p className="text-muted-foreground">
            Showing {categories.length} of {pagination.total} categories
          </p>
        </div>
        <div className="relative w-full md:w-64 mt-4 md:mt-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hidden md:block" />
          <Input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:pl-10 pr-4 py-2 rounded-full border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-medium text-muted-foreground">No categories found</h3>
          <p className="mt-2 text-muted-foreground">
            {searchQuery ? 'Try a different search term' : 'No categories available'}
          </p>
          {searchQuery && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setSearchQuery('')}
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
          >
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                variants={itemVariants}
              />
            ))}
          </motion.div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const pageNum = pagination.page <= 3 
                    ? i + 1 
                    : pagination.page >= pagination.pages - 2
                    ? pagination.pages - 4 + i
                    : pagination.page - 2 + i;
                  
                  if (pageNum < 1 || pageNum > pagination.pages) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}