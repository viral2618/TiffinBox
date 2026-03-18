import { meilisearchService } from './meilisearch.service';
import { SEARCH_INDEXES } from '@/lib/meilisearch';
import type { MeilisearchDocument } from '@/types/search';
import { prisma } from '@/lib/prisma';

class SearchIndexingService {
  private static instance: SearchIndexingService;

  public static getInstance(): SearchIndexingService {
    if (!SearchIndexingService.instance) {
      SearchIndexingService.instance = new SearchIndexingService();
    }
    return SearchIndexingService.instance;
  }

  async initializeSearchIndexes(): Promise<void> {
    try {
      console.log('Initializing Meilisearch indexes...');
      
      await meilisearchService.initializeIndexes();
      
      await Promise.all([
        this.indexAllDishes(),
        this.indexAllShops(),
        this.indexAllCategories(),
      ]);
      
      console.log('Search indexes initialized successfully');
    } catch (error) {
      console.error('Failed to initialize search indexes:', error);
      throw error;
    }
  }

  async indexAllDishes(): Promise<void> {
    try {
      const dishes = await prisma.dish.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          imageUrls: true,
          slug: true,
          price: true,
          shop: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
          subcategory: { select: { id: true, name: true } },
        },
      });

      const documents: MeilisearchDocument[] = dishes.map(dish => ({
        id: dish.id,
        name: dish.name,
        description: dish.description || '',
        image: dish.imageUrls?.[0] || '',
        slug: dish.slug,
        categoryName: dish.category?.name || '',
        shopName: dish.shop?.name || '',
        price: dish.price || 0,
        isAvailable: true,
        searchableText: [
          dish.name,
          dish.description || '',
          dish.category?.name || '',
          dish.subcategory?.name || '',
          dish.shop?.name || '',
        ].filter(Boolean).join(' ').toLowerCase(),
      }));

      await meilisearchService.indexDocuments(SEARCH_INDEXES.DISHES, documents);
      console.log(`Indexed ${documents.length} dishes`);
    } catch (error) {
      console.error('Failed to index dishes:', error);
      throw error;
    }
  }

  async indexAllShops(): Promise<void> {
    try {
      const shops = await prisma.shop.findMany();

      const documents: MeilisearchDocument[] = shops.map(shop => ({
        id: shop.id,
        name: shop.name,
        description: shop.description || '',
        image: shop.imageUrls?.[0] || '',
        slug: shop.slug,
        searchableText: [
          shop.name,
          shop.description || '',
          shop.address || '',
        ].filter(Boolean).join(' ').toLowerCase(),
      }));

      await meilisearchService.indexDocuments(SEARCH_INDEXES.SHOPS, documents);
      console.log(`Indexed ${documents.length} shops`);
    } catch (error) {
      console.error('Failed to index shops:', error);
      throw error;
    }
  }

  async indexAllCategories(): Promise<void> {
    try {
      const categories = await prisma.category.findMany();

      const documents: MeilisearchDocument[] = categories.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description || '',
        image: category.imageUrl || '',
        slug: category.slug,
        searchableText: [
          category.name,
          category.description || '',
        ].filter(Boolean).join(' ').toLowerCase(),
      }));

      await meilisearchService.indexDocuments(SEARCH_INDEXES.CATEGORIES, documents);
      console.log(`Indexed ${documents.length} categories`);
    } catch (error) {
      console.error('Failed to index categories:', error);
      throw error;
    }
  }

  async reindexAll(): Promise<void> {
    try {
      console.log('Reindexing all search data...');
      
      await Promise.all([
        this.indexAllDishes(),
        this.indexAllShops(),
        this.indexAllCategories(),
      ]);
      
      console.log('All search indexes reindexed successfully');
    } catch (error) {
      console.error('Failed to reindex all search data:', error);
      throw error;
    }
  }
}

export const searchIndexingService = SearchIndexingService.getInstance();