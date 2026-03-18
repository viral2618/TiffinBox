import { meilisearchClient, SEARCH_INDEXES } from '@/lib/meilisearch';
import type { SearchResponse, SearchResult, MeilisearchDocument, SearchFilters } from '@/types/search';

class MeilisearchService {
  private static instance: MeilisearchService;

  public static getInstance(): MeilisearchService {
    if (!MeilisearchService.instance) {
      MeilisearchService.instance = new MeilisearchService();
    }
    return MeilisearchService.instance;
  }

  /**
   * Initialize search indexes with proper configuration
   */
  async initializeIndexes(): Promise<void> {
    try {
      // Create indexes if they don't exist
      await Promise.all([
        this.createIndexIfNotExists(SEARCH_INDEXES.DISHES),
        this.createIndexIfNotExists(SEARCH_INDEXES.SHOPS),
        this.createIndexIfNotExists(SEARCH_INDEXES.CATEGORIES),
      ]);

      // Configure searchable attributes
      await this.configureIndexes();
    } catch (error) {
      console.error('Failed to initialize Meilisearch indexes:', error);
      throw error;
    }
  }

  private async createIndexIfNotExists(indexName: string): Promise<void> {
    try {
      await meilisearchClient.getIndex(indexName);
    } catch (error) {
      // Index doesn't exist, create it
      await meilisearchClient.createIndex(indexName, { primaryKey: 'id' });
    }
  }

  private async configureIndexes(): Promise<void> {
    const dishesIndex = meilisearchClient.index(SEARCH_INDEXES.DISHES);
    const shopsIndex = meilisearchClient.index(SEARCH_INDEXES.SHOPS);
    const categoriesIndex = meilisearchClient.index(SEARCH_INDEXES.CATEGORIES);

    await Promise.all([
      // Configure dishes index
      dishesIndex.updateSearchableAttributes([
        'name',
        'description',
        'categoryName',
        'shopName',
        'searchableText'
      ]),
      dishesIndex.updateFilterableAttributes([
        'categoryName',
        'shopName',
        'isAvailable',
        'price'
      ]),
      dishesIndex.updateSortableAttributes(['name', 'price']),

      // Configure shops index
      shopsIndex.updateSearchableAttributes([
        'name',
        'description',
        'searchableText'
      ]),
      shopsIndex.updateFilterableAttributes(['isActive']),
      shopsIndex.updateSortableAttributes(['name']),

      // Configure categories index
      categoriesIndex.updateSearchableAttributes([
        'name',
        'description',
        'searchableText'
      ]),
      categoriesIndex.updateSortableAttributes(['name']),
    ]);
  }

  /**
   * Perform multi-index search with sectioned results
   */
  async search(query: string, filters?: SearchFilters, limit: number = 10): Promise<SearchResponse> {
    if (!query.trim()) {
      return {
        dishes: [],
        shops: [],
        categories: [],
        totalHits: 0,
        processingTimeMs: 0,
      };
    }

    const startTime = Date.now();

    try {
      // Check if indexes exist, if not auto-initialize them
      try {
        await meilisearchClient.getIndex(SEARCH_INDEXES.DISHES);
      } catch (error) {
        console.log('Auto-initializing search indexes...');
        try {
          await this.initializeIndexes();
          console.log('Search indexes initialized successfully');
        } catch (initError) {
          console.warn('Failed to initialize search indexes, using fallback');
          throw initError;
        }
      }

      const searchPromises = [
        this.searchDishes(query, filters, limit),
        this.searchShops(query, limit),
        this.searchCategories(query, limit),
      ];

      const [dishesResult, shopsResult, categoriesResult] = await Promise.all(searchPromises);

      const processingTimeMs = Date.now() - startTime;
      const totalHits = dishesResult.length + shopsResult.length + categoriesResult.length;

      return {
        dishes: dishesResult,
        shops: shopsResult,
        categories: categoriesResult,
        totalHits,
        processingTimeMs,
      };
    } catch (error) {
      console.error('Search failed:', error);
      return {
        dishes: [],
        shops: [],
        categories: [],
        totalHits: 0,
        processingTimeMs: Date.now() - startTime,
      };
    }
  }

  private async searchDishes(query: string, filters?: SearchFilters, limit: number = 20): Promise<SearchResult[]> {
    try {
      const index = meilisearchClient.index(SEARCH_INDEXES.DISHES);
      
      let filterString = '';
      if (filters) {
        const filterParts: string[] = [];
        
        if (filters.categoryId) {
          filterParts.push(`categoryId = "${filters.categoryId}"`);
        }
        
        if (filters.shopId) {
          filterParts.push(`shopId = "${filters.shopId}"`);
        }
        
        if (filters.isAvailable !== undefined) {
          filterParts.push(`isAvailable = ${filters.isAvailable}`);
        }
        
        if (filters.priceRange) {
          filterParts.push(`price >= ${filters.priceRange.min} AND price <= ${filters.priceRange.max}`);
        }
        
        filterString = filterParts.join(' AND ');
      }

      const searchParams: any = {
        limit,
        attributesToHighlight: ['name', 'description'],
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
      };

      if (filterString) {
        searchParams.filter = filterString;
      }

      const result = await index.search(query, searchParams);
      
      return result.hits.map((hit: any) => ({
        id: hit.id,
        type: 'dish' as const,
        title: hit._formatted?.name || hit.name,
        description: hit._formatted?.description || hit.description,
        image: hit.image,
        slug: hit.slug,
        categoryName: hit.categoryName,
        shopName: hit.shopName,
        price: hit.price,
        isAvailable: hit.isAvailable,
      }));
    } catch (error) {
      console.warn('Dishes search failed:', error);
      return [];
    }
  }

  private async searchShops(query: string, limit: number = 5): Promise<SearchResult[]> {
    try {
      const index = meilisearchClient.index(SEARCH_INDEXES.SHOPS);
      
      const result = await index.search(query, {
        limit,
        attributesToHighlight: ['name', 'description'],
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
      });
      
      return result.hits.map((hit: any) => ({
        id: hit.id,
        type: 'shop' as const,
        title: hit._formatted?.name || hit.name,
        description: hit._formatted?.description || hit.description,
        image: hit.image,
        slug: hit.slug,
      }));
    } catch (error) {
      console.warn('Shops search failed:', error);
      return [];
    }
  }

  private async searchCategories(query: string, limit: number = 5): Promise<SearchResult[]> {
    try {
      const index = meilisearchClient.index(SEARCH_INDEXES.CATEGORIES);
      
      const result = await index.search(query, {
        limit,
        attributesToHighlight: ['name', 'description'],
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
      });
      
      return result.hits.map((hit: any) => ({
        id: hit.id,
        type: 'category' as const,
        title: hit._formatted?.name || hit.name,
        description: hit._formatted?.description || hit.description,
        image: hit.image,
        slug: hit.slug,
      }));
    } catch (error) {
      console.warn('Categories search failed:', error);
      return [];
    }
  }

  /**
   * Index documents in bulk
   */
  async indexDocuments(indexName: string, documents: MeilisearchDocument[]): Promise<void> {
    if (documents.length === 0) return;

    const index = meilisearchClient.index(indexName);
    await index.addDocuments(documents);
  }

  /**
   * Update a single document
   */
  async updateDocument(indexName: string, document: MeilisearchDocument): Promise<void> {
    const index = meilisearchClient.index(indexName);
    await index.addDocuments([document]);
  }

  /**
   * Delete a document
   */
  async deleteDocument(indexName: string, documentId: string): Promise<void> {
    const index = meilisearchClient.index(indexName);
    await index.deleteDocument(documentId);
  }

  /**
   * Clear all documents from an index
   */
  async clearIndex(indexName: string): Promise<void> {
    const index = meilisearchClient.index(indexName);
    await index.deleteAllDocuments();
  }
}

export const meilisearchService = MeilisearchService.getInstance();