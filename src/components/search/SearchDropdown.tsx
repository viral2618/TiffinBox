"use client";

import { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Store, Tag, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SearchResponse, SearchResult } from '@/types/search';

interface SearchDropdownProps {
  results: SearchResponse | null;
  isLoading: boolean;
  error: string | null;
  isOpen: boolean;
  onResultClick: (result: SearchResult) => void;
  className?: string;
}

const SearchDropdown = forwardRef<HTMLDivElement, SearchDropdownProps>(
  ({ results, isLoading, error, isOpen, onResultClick, className }, ref) => {
    if (!isOpen) return null;

    const hasResults = results && (
      results.dishes.length > 0 || 
      results.shops.length > 0 || 
      results.categories.length > 0
    );

    return (
      <AnimatePresence>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className={cn(
            "absolute top-full left-0 right-0 mt-2 rounded-xl max-h-96 overflow-hidden",
            className
          )}
          style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #e5e7eb',
            boxShadow: '0 8px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
            zIndex: 9999,
            position: 'absolute',
          }}
        >
          {isLoading && (
            <div className="p-4 flex items-center justify-center">
              <div className="flex items-center space-x-2" style={{ color: 'var(--brand-subtext)' }}>
                <div className="animate-spin rounded-full h-4 w-4 border-2" style={{ borderColor: 'var(--brand-muted)', borderTopColor: 'var(--brand-primary)' }}></div>
                <span className="text-sm">Searching...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 text-center text-red-500 text-sm">
              {error}
            </div>
          )}

          {!isLoading && !error && !hasResults && (
            <div className="p-4 text-center text-sm" style={{ color: 'var(--brand-subtext)' }}>
              No results found
            </div>
          )}

          {!isLoading && !error && hasResults && (
            <div className="max-h-96 overflow-y-auto">
              {/* Dishes Section */}
              {results!.dishes.length > 0 && (
                <SearchSection
                  title="Dishes"
                  icon={<Package className="h-4 w-4" />}
                  results={results!.dishes}
                  onResultClick={onResultClick}
                />
              )}

              {/* Shops Section */}
              {results!.shops.length > 0 && (
                <SearchSection
                  title="Shops"
                  icon={<Store className="h-4 w-4" />}
                  results={results!.shops}
                  onResultClick={onResultClick}
                />
              )}

              {/* Categories Section */}
              {results!.categories.length > 0 && (
                <SearchSection
                  title="Categories"
                  icon={<Tag className="h-4 w-4" />}
                  results={results!.categories}
                  onResultClick={onResultClick}
                />
              )}

              {/* Search Stats */}
              {results!.totalHits > 0 && (
                <div className="px-4 py-2" style={{ borderTop: '1px solid #f3f4f6', backgroundColor: '#f9fafb' }}>
                  <div className="flex items-center justify-between text-xs" style={{ color: 'var(--brand-subtext)' }}>
                    <span>{results!.totalHits} results found</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{results!.processingTimeMs}ms</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }
);

SearchDropdown.displayName = 'SearchDropdown';

interface SearchSectionProps {
  title: string;
  icon: React.ReactNode;
  results: SearchResult[];
  onResultClick: (result: SearchResult) => void;
}

function SearchSection({ title, icon, results, onResultClick }: SearchSectionProps) {
  return (
    <div style={{ borderBottom: '1px solid #f3f4f6' }} className="last:border-b-0">
      <div className="px-4 py-2" style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>
          {icon}
          <span>{title}</span>
          <span className="text-xs font-normal" style={{ color: '#9ca3af' }}>({results.length})</span>
        </div>
      </div>
      
      <div className="py-1">
        {results.map((result, index) => (
          <SearchResultItem
            key={`${result.type}-${result.id}`}
            result={result}
            onClick={() => onResultClick(result)}
            isLast={index === results.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

interface SearchResultItemProps {
  result: SearchResult;
  onClick: () => void;
  isLast: boolean;
}

function SearchResultItem({ result, onClick, isLast }: SearchResultItemProps) {
  return (
    <motion.button
      whileHover={{ backgroundColor: '#f9fafb' }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        "w-full px-4 py-3 text-left transition-colors duration-100 focus:outline-none",
        !isLast && "border-b"
      )}
      style={{ borderColor: '#f3f4f6' }}
    >
      <div className="flex items-start space-x-3">
        {result.image && (
          <div className="flex-shrink-0">
            <img
              src={result.image}
              alt={result.title}
              className="h-10 w-10 rounded-lg object-cover"
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 
              className="text-sm font-medium truncate"
              style={{ color: '#111827' }}
              dangerouslySetInnerHTML={{ __html: result.title }}
            />
            {result.price && (
              <span className="text-sm font-bold ml-2" style={{ color: 'var(--brand-primary)' }}>
                ₹{result.price}
              </span>
            )}
          </div>
          
          {result.description && (
            <p 
              className="text-xs mt-0.5 line-clamp-1"
              style={{ color: '#6b7280' }}
              dangerouslySetInnerHTML={{ __html: result.description }}
            />
          )}
          
          <div className="flex items-center space-x-2 mt-1.5">
            {result.categoryName && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ backgroundColor: '#f0fdfa', color: 'var(--brand-primary)' }}>
                <Tag className="h-3 w-3 mr-1" />
                {result.categoryName}
              </span>
            )}
            
            {result.shopName && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}>
                <Store className="h-3 w-3 mr-1" />
                {result.shopName}
              </span>
            )}
            
            {result.isAvailable === false && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-600">
                Unavailable
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

export default SearchDropdown;