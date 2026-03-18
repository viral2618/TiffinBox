import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (value: number) => value * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 10) / 10;
}

export interface ShopFilters {
  search?: string;
  categoryId?: string;
  subcategoryId?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  page?: number;
  limit?: number;
  minRating?: number;
  serveTime?: string;
  sortBy?: 'distance' | 'rating' | 'reviews' | 'relevance' | 'newest';
}

export interface ShopData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  bannerImage?: string;
  logoUrl?: string;
  imageUrls: string[];
  contactPhone?: string;
  whatsapp?: string;
  distance?: number;
  isFavorite: boolean;
  rating?: number;
  reviewCount?: number;
  dishes: any[];
  shopTags: {
    tag: {
      id: string;
      name: string;
    };
  }[];
}

export interface ShopsResponse {
  shops: ShopData[];
  isNearby: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export async function getShopsData(filters: ShopFilters = {}): Promise<ShopsResponse> {
  try {
    const {
      search = '',
      categoryId,
      subcategoryId,
      lat = 0,
      lng = 0,
      radius = 5,
      page = 1,
      limit = 10,
      sortBy = 'distance'
    } = filters;

    const hasLocation = !(lat === 0 && lng === 0);
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } }
    ];
  }

  let dishesFilter = {};
  if (categoryId) dishesFilter = { ...dishesFilter, categoryId };
  if (subcategoryId) dishesFilter = { ...dishesFilter, subcategoryId };

  if (categoryId || subcategoryId) {
    where.dishes = { some: dishesFilter };
  }

  // For location-based queries, we need to fetch all shops to calculate distances
  // For non-location queries, we can use database pagination
  const shops = await prisma.shop.findMany({
    where: hasLocation ? {} : where, // When using location, ignore other filters in DB query
    include: {
      dishes: {
        take: 3,
        include: { category: true }
      },
      shopTags: {
        include: { tag: true }
      },
      favorites: userId ? { where: { userId } } : false,
      shopReviews: {
        select: {
          rating: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  let shopsToReturn: any[] = [];
  let isNearby = false;
  let allShopsForPagination: any[] = [];

  if (hasLocation) {
    // Filter shops with coordinates and calculate distances
    let shopsWithDistance = shops
      .filter(shop => shop.coordinates)
      .map(shop => {
        const distance = calculateDistance(lat, lng, shop.coordinates!.lat, shop.coordinates!.lng);
        const isFavorite = userId ? shop.favorites.length > 0 : false;
        const rating = shop.shopReviews?.length > 0 
          ? shop.shopReviews.reduce((sum, review) => sum + review.rating, 0) / shop.shopReviews.length 
          : undefined;
        const reviewCount = shop.shopReviews?.length || 0;
        const { favorites, shopReviews, ...shopWithoutFavorites } = shop;
        
        return { ...shopWithoutFavorites, distance, isFavorite, rating, reviewCount };
      })
      .filter(shop => shop.distance! <= radius);

    // Apply other filters after distance calculation
    if (search) {
      shopsWithDistance = shopsWithDistance.filter(shop => 
        shop.name.toLowerCase().includes(search.toLowerCase()) ||
        (shop.description && shop.description.toLowerCase().includes(search.toLowerCase())) ||
        shop.address.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (categoryId || subcategoryId) {
      shopsWithDistance = shopsWithDistance.filter(shop => 
        shop.dishes.some((dish: any) => {
          if (categoryId && dish.categoryId !== categoryId) return false;
          if (subcategoryId && dish.subcategoryId !== subcategoryId) return false;
          return true;
        })
      );
    }

    shopsWithDistance.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'rating':
          // Mock rating calculation based on shop ID for consistent sorting
          const ratingA = 3 + (Math.abs(a.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)) % 200) / 100;
          const ratingB = 3 + (Math.abs(b.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)) % 200) / 100;
          return ratingB - ratingA;
        case 'reviews':
          // Mock review count based on shop ID
          const reviewsA = 10 + (Math.abs(a.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)) % 200);
          const reviewsB = 10 + (Math.abs(b.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)) % 200);
          return reviewsB - reviewsA;
        case 'relevance':
          return a.name.localeCompare(b.name);
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return (a.distance || 0) - (b.distance || 0);
      }
    });
    allShopsForPagination = shopsWithDistance;
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    shopsToReturn = shopsWithDistance.slice(startIndex, endIndex);
    isNearby = shopsToReturn.length > 0;
  } else {
    // No location filter - show all shops with pagination
    allShopsForPagination = shops.map(shop => {
      const isFavorite = userId ? shop.favorites.length > 0 : false;
      const rating = shop.shopReviews?.length > 0 
        ? shop.shopReviews.reduce((sum, review) => sum + review.rating, 0) / shop.shopReviews.length 
        : undefined;
      const reviewCount = shop.shopReviews?.length || 0;
      const { favorites, shopReviews, ...shopWithoutFavorites } = shop;
      
      return { ...shopWithoutFavorites, isFavorite, rating, reviewCount };
    });
    
    // Sort non-location shops
    allShopsForPagination.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          const ratingA = 3 + (Math.abs(a.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)) % 200) / 100;
          const ratingB = 3 + (Math.abs(b.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)) % 200) / 100;
          return ratingB - ratingA;
        case 'reviews':
          const reviewsA = 10 + (Math.abs(a.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)) % 200);
          const reviewsB = 10 + (Math.abs(b.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)) % 200);
          return reviewsB - reviewsA;
        case 'relevance':
          return a.name.localeCompare(b.name);
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    shopsToReturn = allShopsForPagination.slice(startIndex, endIndex);
  }

  const totalCount = allShopsForPagination.length;

    return {
      shops: shopsToReturn,
      isNearby,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching shops data:', error);
    throw new Error('Failed to fetch shops data');
  }
}