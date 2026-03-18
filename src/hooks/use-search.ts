import { useState, useEffect, useCallback, useRef } from 'react';
import type { SearchResponse, SearchFilters } from '@/types/search';

interface UseSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  limit?: number;
  filters?: SearchFilters;
}

interface UseSearchReturn {
  results: SearchResponse | null;
  isLoading: boolean;
  error: string | null;
  search: (query: string) => void;
  clearResults: () => void;
}

export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    limit = 10,
    filters,
  } = options;

  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < minQueryLength) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams({
        q: searchQuery,
        limit: limit.toString(),
      });

      // Add filters to search params
      if (filters?.categoryId) {
        searchParams.append('categoryId', filters.categoryId);
      }
      if (filters?.shopId) {
        searchParams.append('shopId', filters.shopId);
      }
      if (filters?.isAvailable !== undefined) {
        searchParams.append('isAvailable', filters.isAvailable.toString());
      }
      if (filters?.priceRange) {
        searchParams.append('minPrice', filters.priceRange.min.toString());
        searchParams.append('maxPrice', filters.priceRange.max.toString());
      }

      const response = await fetch(`/api/search?${searchParams.toString()}`, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn('Search API not available, using fallback');
        // Fallback to empty results instead of throwing error
        setResults({
          dishes: [],
          shops: [],
          categories: [],
          totalHits: 0,
          processingTimeMs: 0
        });
        return;
      }

      const data: SearchResponse = await response.json();
      setResults(data);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled, ignore
        return;
      }
      
      console.error('Search error:', err);
      setError('Search failed. Please try again.');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, [minQueryLength, limit, filters]);

  const search = useCallback((searchQuery: string) => {
    setQuery(searchQuery);

    // Clear previous debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Clear results immediately if query is too short
    if (searchQuery.length < minQueryLength) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    // Set loading state immediately for better UX
    setIsLoading(true);

    // Debounce the search
    debounceTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, debounceMs);
  }, [debounceMs, minQueryLength, performSearch]);

  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
    setIsLoading(false);
    setQuery('');

    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    results,
    isLoading,
    error,
    search,
    clearResults,
  };
}