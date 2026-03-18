import { NextRequest, NextResponse } from 'next/server';

// Simple inline cache stats functions
const recordCacheHit = (key: string) => {
  // Simplified - just log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`Cache hit: ${key}`);
  }
};

const recordCacheMiss = (key: string) => {
  // Simplified - just log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`Cache miss: ${key}`);
  }
};

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheConfig {
  static: number;    // 30 minutes for static content
  dynamic: number;   // 5 minutes for dynamic content
  realtime: number;  // 1 minute for real-time data
}

class MemoryCache {
  private cache = new Map<string, CacheEntry>();
  private cleanupInterval: NodeJS.Timeout;
  
  private config: CacheConfig = {
    static: 30 * 60 * 1000,   // 30 minutes
    dynamic: 5 * 60 * 1000,   // 5 minutes
    realtime: 60 * 1000,      // 1 minute
  };

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  private generateKey(url: string, method: string = 'GET'): string {
    return `${method}:${url}`;
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private getCacheTTL(url: string): number {
    // Static content patterns
    if (url.includes('/about') || url.includes('/faq') || url.includes('/privacy') || url.includes('/terms')) {
      return this.config.static;
    }
    
    // Real-time patterns
    if (url.includes('/notifications') || url.includes('/count')) {
      return this.config.realtime;
    }
    
    // Default to dynamic
    return this.config.dynamic;
  }

  set<T>(url: string, data: T, method: string = 'GET'): void {
    const key = this.generateKey(url, method);
    const ttl = this.getCacheTTL(url);
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(url: string, method: string = 'GET'): T | null {
    const key = this.generateKey(url, method);
    const entry = this.cache.get(key);
    
    if (!entry || this.isExpired(entry)) {
      if (entry) this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  invalidate(url: string, method?: string): void {
    if (method) {
      const key = this.generateKey(url, method);
      this.cache.delete(key);
    } else {
      // Invalidate all methods for this URL
      const keysToDelete = Array.from(this.cache.keys()).filter(key => key.endsWith(url));
      keysToDelete.forEach(key => this.cache.delete(key));
    }
  }

  invalidatePattern(pattern: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => key.includes(pattern));
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        ttl: entry.ttl,
        expired: this.isExpired(entry)
      }))
    };
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

// Global cache instance
const cache = new MemoryCache();

// Browser cache headers function
export function getBrowserCacheHeaders(url: string): Record<string, string> {
  let maxAge = 300; // 5 minutes default
  
  // Static content gets longer browser cache
  if (url.includes('/about') || url.includes('/faq') || url.includes('/privacy') || url.includes('/terms')) {
    maxAge = 1800; // 30 minutes
  }
  // Real-time content gets shorter cache
  else if (url.includes('/notifications') || url.includes('/count')) {
    maxAge = 60; // 1 minute
  }
  
  return {
    'Cache-Control': `public, max-age=${maxAge}, s-maxage=${maxAge}`,
    'Vary': 'Accept-Encoding',
  };
}

// Cache wrapper function
export function withCache<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    const req = args[0] as NextRequest;
    const method = req.method;
    const url = req.url;
    
    // Disable caching temporarily
    if (method !== 'GET') {
      return await handler(...args);
    }
    
    // Return response without caching
    return await handler(...args);
  };
}

// Export cache instance for manual operations
export { cache };