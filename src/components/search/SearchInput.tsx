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

  useEffect(() => { setQuery(initialValue || ''); }, [initialValue]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onChange?.(value);
    if (value.trim().length >= 2) {
      search(value);
      setIsDropdownOpen(showDropdown);
    } else {
      clearResults();
      setIsDropdownOpen(false);
    }
  }, [search, clearResults, showDropdown, onChange]);

  const handleResultClick = useCallback((result: SearchResult) => {
    setQuery(result.title.replace(/<[^>]*>/g, ''));
    setIsDropdownOpen(false);
    if (onResultSelect) {
      onResultSelect(result);
    } else {
      switch (result.type) {
        case 'dish': router.push(`/dishes/${result.slug}`); break;
        case 'shop': router.push(`/shops/${result.slug}`); break;
        case 'category': router.push(`/dishes?categoryId=${result.id}`); break;
      }
    }
  }, [onResultSelect, router]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsDropdownOpen(false);
      if (onSubmit) onSubmit(query.trim());
      else router.push(`/dishes?search=${encodeURIComponent(query.trim())}`);
    }
  }, [query, router, onSubmit]);

  const handleClear = useCallback(() => {
    setQuery('');
    clearResults();
    setIsDropdownOpen(false);
    inputRef.current?.focus();
    onClear?.();
  }, [clearResults, onClear]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (query.trim().length >= 2 && showDropdown) setIsDropdownOpen(true);
  }, [query, showDropdown]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) setIsDropdownOpen(false);
    }, 150);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setIsDropdownOpen(false); inputRef.current?.blur(); }
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setIsDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const shouldShowDropdown = Boolean(
    showDropdown && isDropdownOpen && (
      isLoading || error ||
      (results && (results.dishes.length > 0 || results.shops.length > 0 || results.categories.length > 0)) ||
      (query.length >= 2 && results && results.totalHits === 0)
    )
  );

  return (
    <div ref={containerRef} className={cn("relative w-full", className)} style={style}>
      <form onSubmit={handleSubmit}>
        {/* Outer ring shown on focus */}
        <div
          style={{
            borderRadius: '12px',
            padding: isFocused ? '2px' : '0',
            background: isFocused ? 'rgba(13,148,136,0.25)' : 'transparent',
            transition: 'padding 0.15s, background 0.15s',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'stretch',
              height: 'clamp(44px, 5.5vw, 54px)',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            }}
          >
            {/* Left teal icon */}
            <div style={{
              width: 'clamp(44px, 5.5vw, 54px)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#0d9488',
            }}>
              <Search size={20} color="#ffffff" strokeWidth={2.5} />
            </div>

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
              autoComplete="off"
              spellCheck="false"
              className="search-bar-input"
              style={{
                flex: 1,
                minWidth: 0,
                height: '100%',
                border: 'none',
                outline: 'none',
                background: '#ffffff',
                color: '#111827',
                fontSize: 'clamp(13px, 1.5vw, 15px)',
                padding: '0 8px',
                backgroundImage: 'none',
                boxShadow: 'none',
                borderRadius: '0',
              }}
            />

            {/* Clear button */}
            <AnimatePresence>
              {query && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.12 }}
                  type="button"
                  onClick={handleClear}
                  style={{
                    flexShrink: 0,
                    width: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%',
                    background: '#e5e7eb', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <X size={10} color="#6b7280" />
                  </div>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Right teal Search button */}
            <button
              type="submit"
              style={{
                flexShrink: 0,
                width: 'clamp(70px, 10vw, 96px)',
                background: '#0d9488',
                color: '#ffffff',
                border: 'none',
                fontSize: 'clamp(13px, 1.5vw, 15px)',
                fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: '0.01em',
              }}
            >
              Search
            </button>
          </div>
        </div>
      </form>

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
