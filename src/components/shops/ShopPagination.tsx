import React from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { setPage } from '@/redux/features/publicShopSlice';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ShopPagination: React.FC = () => {
  const dispatch = useAppDispatch();
  const { pagination } = useAppSelector((state) => state.publicShop);
  const { page, pages, total } = pagination;
  
  // Don't show pagination if there's only one page
  if (pages <= 1) {
    return null;
  }
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (pages <= maxPagesToShow) {
      // If total pages is less than max to show, display all pages
      for (let i = 1; i <= pages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);
      
      // Calculate start and end of page range
      let start = Math.max(2, page - 1);
      let end = Math.min(pages - 1, page + 1);
      
      // Adjust if at the beginning
      if (page <= 2) {
        end = 4;
      }
      
      // Adjust if at the end
      if (page >= pages - 1) {
        start = pages - 3;
      }
      
      // Add ellipsis after first page if needed
      if (start > 2) {
        pageNumbers.push('...');
      }
      
      // Add page numbers in the middle
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (end < pages - 1) {
        pageNumbers.push('...');
      }
      
      // Always include last page
      pageNumbers.push(pages);
    }
    
    return pageNumbers;
  };
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pages) {
      dispatch(setPage(newPage));
      // Scroll to top when changing page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
      <p className="text-sm text-gray-500">
        Showing {Math.min((page - 1) * pagination.limit + 1, total)} to {Math.min(page * pagination.limit, total)} of {total} shops
      </p>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {getPageNumbers().map((pageNumber, index) => (
          pageNumber === '...' ? (
            <span key={`ellipsis-${index}`} className="px-2">...</span>
          ) : (
            <Button
              key={`page-${pageNumber}`}
              variant={pageNumber === page ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(pageNumber as number)}
            >
              {pageNumber}
            </Button>
          )
        ))}
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(page + 1)}
          disabled={page === pages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ShopPagination;