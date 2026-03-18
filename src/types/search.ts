export interface SearchResult {
  id: string;
  type: 'dish' | 'shop' | 'category';
  title: string;
  description?: string;
  image?: string;
  slug?: string;
  categoryName?: string;
  shopName?: string;
  price?: number;
  isAvailable?: boolean;
}

export interface SearchResponse {
  dishes: SearchResult[];
  shops: SearchResult[];
  categories: SearchResult[];
  totalHits: number;
  processingTimeMs: number;
}

export interface MeilisearchDocument {
  id: string;
  name: string;
  description?: string;
  image?: string;
  slug?: string;
  categoryName?: string;
  shopName?: string;
  price?: number;
  isAvailable?: boolean;
  searchableText: string;
}

export interface SearchFilters {
  categoryId?: string;
  shopId?: string;
  isAvailable?: boolean;
  priceRange?: {
    min: number;
    max: number;
  };
}