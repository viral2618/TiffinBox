"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSearch } from '@/hooks/use-search';
import SearchDropdown from './SearchDropdown';
import type { SearchResult } from '@/types/search';
import './search-input.css';

interface SearchInputProps {
  placeholder?: string;
  className?: string;
  onResultSelect?: (result: SearchResult) => void;
  onSubmit?: (query: string) => void;
  onClear?: () => void;
  onChange?: (value: string) => void;
  initialValue?: string;
  showDropdown?: boolean;
  autoFocus?: boolean;
  style?: React.CSSProperties;
}

export default function SearchInput({
  placeholder = "Search dishes, shops, categories...",
  className,
  onResultSelect,
  onSubmit,
  onClear,
  onChange,
  initialValue = '',
  showDropdown = true,
  autoFocus = false,
  style,
}: SearchInputProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { results, isLoading, error, search, clearResults } = useSearch({
    debounceMs: 300,
    minQueryLength: 2,
    limit: 50,
  });

  // Sync with initialValue changes
  useEffect(() => {
    setQuery(initialValue || '');
  }, [initialValue]);

  // Handle input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (onChange) {
      onChange(value);
    }
    
    if (value.trim().length >= 2) {
      search(value);
      setIsDropdownOpen(showDropdown);
    } else {
      clearResults();
      setIsDropdownOpen(false);
    }
  }, [search, clearResults, showDropdown, onChange]);

  // Handle result selection
  const handleResultClick = useCallback((result: SearchResult) => {
    setQuery(result.title.replace(/<[^>]*>/g, '')); // Remove HTML tags
    setIsDropdownOpen(false);
    
    if (onResultSelect) {
      onResultSelect(result);
    } else {
      // Default navigation behavior
      switch (result.type) {
        case 'dish':
          router.push(`/dishes/${result.slug}`);
          break;
        case 'shop':
          router.push(`/shops/${result.slug}`);
          break;
        case 'category':
          router.push(`/dishes?categoryId=${result.id}`);
          break;
      }
    }
  }, [onResultSelect, router]);

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsDropdownOpen(false);
      if (onSubmit) {
        onSubmit(query.trim());
      } else {
        router.push(`/dishes?search=${encodeURIComponent(query.trim())}`);
      }
    }
  }, [query, router, onSubmit]);

  // Handle clear button
  const handleClear = useCallback(() => {
    setQuery('');
    clearResults();
    setIsDropdownOpen(false);
    inputRef.current?.focus();
    if (onClear) {
      onClear();
    }
  }, [clearResults, onClear]);

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (query.trim().length >= 2 && showDropdown) {
      setIsDropdownOpen(true);
    }
  }, [query, showDropdown]);

  // Handle blur
  const handleBlur = useCallback((e: React.FocusEvent) => {
    setIsFocused(false);
    // Delay closing dropdown to allow for result clicks
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setIsDropdownOpen(false);
      }
    }, 150);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      inputRef.current?.blur();
    }
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const shouldShowDropdown = Boolean(
    showDropdown && isDropdownOpen && (
      isLoading || 
      error || 
      (results && (results.dishes.length > 0 || results.shops.length > 0 || results.categories.length > 0)) ||
      (query.length >= 2 && results && results.totalHits === 0)
    )
  );

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div 
          className={cn(
            "relative flex items-center w-full rounded-lg border transition-all duration-200",
            isFocused 
              ? "border-gray-300" 
              : "border-gray-200 hover:border-gray-300"
          )}
          style={{
            height: '48px',
            backgroundColor: 'rgba(252, 124, 124, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(252, 124, 124, 0.3)'
          }}
        >
         
          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 h-full bg-transparent border-none outline-none pr-12 search-input"
            style={{
              color: '#451a03',
              fontSize: '16px',
              fontWeight: '500'
            }}
            autoComplete="off"
            spellCheck="false"
          />

          {/* Clear Button */}
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                type="button"
                onClick={handleClear}
                className="flex items-center justify-center w-8 h-8 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
              >
                <X className="h-4 w-4" style={{ color: '#fc7c7c' }} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!query.trim()}
            className="flex items-center justify-center w-12 h-12 mr-2 rounded-full transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: query.trim() ? '#fc7c7c' : 'rgba(146, 64, 14, 0.3)',
              color: 'white',
              cursor: query.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            <Search className="h-4 w-4" />
          </button>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute right-14 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-primary"></div>
          </div>
        )}
      </form>

      {/* Search Dropdown */}
      {shouldShowDropdown && (
        <SearchDropdown
          ref={dropdownRef}
          results={results}
          isLoading={isLoading}
          error={error}
          isOpen={shouldShowDropdown}
          onResultClick={handleResultClick}
        />
      )}
    </div>
  );
}