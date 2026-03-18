import { MeiliSearch } from 'meilisearch';

// Create a lazy-initialized client to avoid build-time errors
let _meilisearchClient: MeiliSearch | null = null;

function createMeilisearchClient() {
  if (!process.env.MEILI_SEARCH_URL || !process.env.MEILI_SEARCH_API_KEY) {
    throw new Error('Meilisearch configuration is missing. Please check MEILI_SEARCH_URL and MEILI_SEARCH_API_KEY environment variables.');
  }
  return new MeiliSearch({
    host: process.env.MEILI_SEARCH_URL,
    apiKey: process.env.MEILI_SEARCH_API_KEY,
  });
}

export const meilisearchClient = {
  index: (name: string) => createMeilisearchClient().index(name),
  createIndex: (name: string, options?: any) => createMeilisearchClient().createIndex(name, options),
  getIndex: (name: string) => createMeilisearchClient().getIndex(name)
};

// Index names
export const SEARCH_INDEXES = {
  DISHES: 'dishes',
  SHOPS: 'shops',
  CATEGORIES: 'categories',
} as const;

export type SearchIndexName = typeof SEARCH_INDEXES[keyof typeof SEARCH_INDEXES];