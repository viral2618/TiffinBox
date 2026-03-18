import { ReadonlyURLSearchParams } from 'next/navigation';

export interface DishSearchParams {
  search?: string;
  categoryId?: string;
  subcategoryId?: string;
  isEggless?: string;
  isPremium?: string;
  isSpecialToday?: string;
  lat?: string;
  lng?: string;
  radius?: string;
  page?: string;
  limit?: string;
  minRating?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
  hasDiscount?: string;
  serveTime?: string;
  sortBy?: string;
}

export function parseSearchParams(searchParams: ReadonlyURLSearchParams | URLSearchParams): DishSearchParams {
  return {
    search: searchParams.get('search') || undefined,
    categoryId: searchParams.get('categoryId') || undefined,
    subcategoryId: searchParams.get('subcategoryId') || undefined,
    isEggless: searchParams.get('isEggless') || undefined,
    isPremium: searchParams.get('isPremium') || undefined,
    isSpecialToday: searchParams.get('isSpecialToday') || undefined,
    lat: searchParams.get('lat') || undefined,
    lng: searchParams.get('lng') || undefined,
    radius: searchParams.get('radius') || undefined,
    page: searchParams.get('page') || undefined,
    limit: searchParams.get('limit') || undefined,
    minRating: searchParams.get('minRating') || undefined,
    minPrice: searchParams.get('minPrice') || undefined,
    maxPrice: searchParams.get('maxPrice') || undefined,
    inStock: searchParams.get('inStock') || undefined,
    hasDiscount: searchParams.get('hasDiscount') || undefined,
    serveTime: searchParams.get('serveTime') || undefined,
    sortBy: searchParams.get('sortBy') || undefined,
  };
}

export function buildSearchParams(params: DishSearchParams): URLSearchParams {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });
  
  return searchParams;
}

export function getPageTitle(params: DishSearchParams): string {
  if (params.lat && params.lng) {
    return "Dishes Near You";
  } else if (params.search) {
    return `Search Results: "${params.search}"`;
  } else {
    return "Find Your Favorite Dish";
  }
}

export function getPageSubtitle(params: DishSearchParams): string {
  if (params.lat && params.lng) {
    const radius = params.radius || '5';
    return `Showing dishes within ${radius}km of your location`;
  } else {
    return "Discover delicious treats from local bakeries";
  }
}