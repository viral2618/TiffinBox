"use client"

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { buildSearchParams, parseSearchParams } from '@/lib/utils/url-params';

interface ServerDishPaginationProps {
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export default function ServerDishPagination({ pagination }: ServerDishPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentParams = parseSearchParams(searchParams);
  
  const { page, pages, total } = pagination;
  
  if (pages <= 1) return null;
  
  const updatePage = (newPage: number) => {
    const updatedParams = { ...currentParams, page: newPage.toString() };
    const searchParamsObj = buildSearchParams(updatedParams);
    const newURL = `/dishes?${searchParamsObj.toString()}`;
    router.push(newURL);
  };
  
  const getVisiblePages = () => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    
    for (let i = Math.max(2, page - delta); i <= Math.min(pages - 1, page + delta); i++) {
      range.push(i);
    }
    
    if (page - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }
    
    rangeWithDots.push(...range);
    
    if (page + delta < pages - 1) {
      rangeWithDots.push('...', pages);
    } else if (pages > 1) {
      rangeWithDots.push(pages);
    }
    
    return rangeWithDots;
  };
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
      <p className="text-sm text-muted-foreground">
        Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, total)} of {total} dishes
      </p>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => updatePage(page - 1)}
          disabled={page <= 1}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <div className="flex items-center gap-1">
          {getVisiblePages().map((pageNum, index) => (
            <React.Fragment key={index}>
              {pageNum === '...' ? (
                <span className="px-3 py-2 text-sm text-muted-foreground">...</span>
              ) : (
                <Button
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => updatePage(pageNum as number)}
                  className="min-w-[40px]"
                >
                  {pageNum}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => updatePage(page + 1)}
          disabled={page >= pages}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}