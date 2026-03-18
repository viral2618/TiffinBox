import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export interface DishFilters {
  search?: string;
  categoryId?: string;
  subcategoryId?: string;
  isEggless?: boolean;
  lat?: number;
  lng?: number;
  radius?: number;
  page?: number;
  limit?: number;
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  hasDiscount?: boolean;
  serveTime?: string;
  sortBy?: string;
}

export interface DishWithDistance {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrls?: string[];
  price: number;
  isVeg: boolean;
  shop: {
    id: string;
    name: string;
    slug: string;
    distance?: number;
    rating?: number;
    reviewCount?: number;
  };
  isFavorite: boolean;
  isReminder: boolean;
  avgRating: number;
  reviews: { rating: number }[];
  timings: {
    preparedAt: { hour: number; minute: number };
    servedFrom: { hour: number; minute: number };
    servedUntil: { hour: number; minute: number };
  }[];
}

export interface DishesResponse {
  dishes: DishWithDistance[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export async function getDishes(filters: DishFilters): Promise<DishesResponse> {
  const {
    search,
    categoryId,
    subcategoryId,
    isEggless,
    lat,
    lng,
    radius = 5,
    page = 1,
    limit = 12,
    minRating,
    minPrice,
    maxPrice,
    inStock,
    hasDiscount,
    serveTime,
    sortBy,
  } = filters;

  const hasLocation = lat !== undefined && lng !== undefined && lat !== 0 && lng !== 0;
  console.log('getDishes called with:', { search, categoryId, subcategoryId, lat, lng, radius, hasLocation });
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { shop: { name: { contains: search, mode: "insensitive" } } },
      { shop: { address: { contains: search, mode: "insensitive" } } },
      { category: { name: { contains: search, mode: "insensitive" } } },
      { subcategory: { name: { contains: search, mode: "insensitive" } } },
      { dishTags: { some: { tag: { name: { contains: search, mode: "insensitive" } } } } }
    ];
  }

  if (categoryId) {
    where.categoryId = categoryId;
    console.log('Filtering by categoryId:', categoryId);
  }
  if (subcategoryId) {
    where.subcategoryId = subcategoryId;
    console.log('Filtering by subcategoryId:', subcategoryId);
  }
  if (isEggless === true) where.isVeg = true;
  if (isEggless === false) where.isVeg = false;
  if (inStock === true) where.isOutOfStock = false;
  if (hasDiscount === true) where.discountPercentage = { gt: 0 };
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  const includeClause = {
    shop: true,
    category: true,
    subcategory: true,
    timings: true,
    dishTags: {
      include: {
        tag: true
      }
    },
    favorites: userId ? { where: { userId } } : false,
    Reminder: userId ? { where: { userId, isActive: true } } : false,
    reviews: {
      select: {
        rating: true,
      },
    },
  };

  // Helper function to get current time slot
  const getCurrentTimeSlot = () => {
    const now = new Date();
    const hour = now.getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return null;
  };

  // Helper function to filter by serve time
  const filterByServeTime = (dishes: any[]) => {
    if (!serveTime || serveTime === 'all') return dishes;
    
    return dishes.filter(dish => {
      if (!dish.timings || dish.timings.length === 0) return false;
      
      if (serveTime === 'available-now') {
        const currentSlot = getCurrentTimeSlot();
        if (!currentSlot) return false;
        
        return dish.timings.some((timing: any) => {
          const serveFromHour = timing.servedFrom.hour;
          const serveUntilHour = timing.servedUntil.hour;
          const currentHour = new Date().getHours();
          
          return currentHour >= serveFromHour && currentHour <= serveUntilHour;
        });
      }
      
      return dish.timings.some((timing: any) => {
        const serveFromHour = timing.servedFrom.hour;
        
        switch (serveTime) {
          case 'morning':
            return serveFromHour >= 6 && serveFromHour < 12;
          case 'afternoon':
            return serveFromHour >= 12 && serveFromHour < 18;
          case 'evening':
            return serveFromHour >= 18 && serveFromHour < 22;
          default:
            return true;
        }
      });
    });
  };

  // Helper function to calculate average rating
  const calculateAverageRating = (reviews: any[]) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  // Helper function to sort dishes
  const sortDishes = (dishes: any[]) => {
    if (!sortBy || sortBy === 'newest') {
      return dishes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    switch (sortBy) {
      case 'rating':
        return dishes.sort((a, b) => {
          const avgA = calculateAverageRating(a.reviews || []);
          const avgB = calculateAverageRating(b.reviews || []);
          return avgB - avgA;
        });
      case 'reviews':
        return dishes.sort((a, b) => (b.reviews?.length || 0) - (a.reviews?.length || 0));
      case 'price-low':
        return dishes.sort((a, b) => a.price - b.price);
      case 'price-high':
        return dishes.sort((a, b) => b.price - a.price);
      default:
        return dishes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  };

  if (hasLocation) {
    console.log('Searching with location, where clause:', where);
    const allDishes = await prisma.dish.findMany({
      where: {},
      include: includeClause,
      orderBy: { createdAt: "desc" },
    });
    console.log('Found dishes before distance filter:', allDishes.length);

    console.log('Dishes with coordinates:', allDishes.filter(dish => dish.shop.coordinates).length);
    console.log('Dishes without coordinates:', allDishes.filter(dish => !dish.shop.coordinates).length);
    
    let dishesWithDistance = allDishes
      .filter((dish) => dish.shop.coordinates)
      .map((dish) => {
        const distance = calculateDistance(
          lat!,
          lng!,
          dish.shop.coordinates!.lat,
          dish.shop.coordinates!.lng
        );

        const isFavorite = userId ? dish.favorites.length > 0 : false;
        const isReminder = userId ? dish.Reminder.length > 0 : false;
        const avgRating = calculateAverageRating(dish.reviews || []);
        const { favorites, shop, Reminder, reviews, ...dishWithoutFavorites } = dish;
        const { coordinates, ...shopWithoutCoordinates } = shop;

        return {
          ...dishWithoutFavorites,
          shop: { ...shopWithoutCoordinates, distance },
          isFavorite,
          isReminder,
          avgRating,
          reviews: reviews || [],
        };
      })
      .filter((dish) => dish.shop.distance! <= radius);

    // Apply other filters after distance calculation
    if (search) {
      dishesWithDistance = dishesWithDistance.filter(dish => 
        dish.name.toLowerCase().includes(search.toLowerCase()) ||
        (dish.description && dish.description.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    if (categoryId) {
      dishesWithDistance = dishesWithDistance.filter(dish => dish.categoryId === categoryId);
    }
    
    if (subcategoryId) {
      dishesWithDistance = dishesWithDistance.filter(dish => dish.subcategoryId === subcategoryId);
    }
    
    if (isEggless === true) {
      dishesWithDistance = dishesWithDistance.filter(dish => dish.isVeg === true);
    } else if (isEggless === false) {
      dishesWithDistance = dishesWithDistance.filter(dish => dish.isVeg === false);
    }

    console.log('Dishes after distance filter (within', radius, 'km):', dishesWithDistance.length);
    if (dishesWithDistance.length > 0) {
      console.log('Sample distances:', dishesWithDistance.slice(0, 3).map(d => ({ name: d.name, distance: d.shop.distance })));
    }

    // Apply rating filter
    if (minRating && minRating > 0) {
      dishesWithDistance = dishesWithDistance.filter(dish => dish.avgRating >= minRating);
    }

    // Apply serve time filter
    dishesWithDistance = filterByServeTime(dishesWithDistance);

    // Apply sorting
    dishesWithDistance = sortDishes(dishesWithDistance);

    const total = dishesWithDistance.length;
    const pages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedDishes = dishesWithDistance.slice(offset, offset + limit);

    return {
      dishes: paginatedDishes,
      pagination: {
        total,
        page,
        limit,
        pages,
      },
    };
  }

  // No location provided - regular search
  console.log('Where clause:', where);
  const allDishes = await prisma.dish.findMany({
    where,
    include: includeClause,
    orderBy: { createdAt: "desc" },
  });

  const dishesWithMetadata = allDishes.map((dish) => {
    const isFavorite = userId ? dish.favorites.length > 0 : false;
    const isReminder = userId ? dish.Reminder.length > 0 : false;
    const avgRating = calculateAverageRating(dish.reviews || []);
    const { favorites, Reminder, reviews, shop, ...dishWithoutFavorites } = dish;

    return {
      ...dishWithoutFavorites,
      shop,
      isFavorite,
      isReminder,
      avgRating,
      reviews: reviews || [],
    };
  });

  let filteredDishes = dishesWithMetadata;

  // Apply rating filter
  if (minRating && minRating > 0) {
    filteredDishes = filteredDishes.filter(dish => dish.avgRating >= minRating);
  }

  // Apply serve time filter
  filteredDishes = filterByServeTime(filteredDishes);

  // Apply sorting
  filteredDishes = sortDishes(filteredDishes);

  // Use filtered count for pagination
  const total = filteredDishes.length;
  const pages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  
  // Apply pagination to filtered results
  const paginatedFilteredDishes = filteredDishes.slice(offset, offset + limit);

  return {
    dishes: paginatedFilteredDishes,
    pagination: {
      total,
      page,
      limit,
      pages,
    },
  };
}

export async function getCategories() {
  return await prisma.category.findMany({
    include: { subcategories: true },
    orderBy: { name: 'asc' },
  });
}