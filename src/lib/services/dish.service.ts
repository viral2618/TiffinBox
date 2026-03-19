import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

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
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const emptyResponse = (page: number, limit: number): DishesResponse => ({
  dishes: [],
  pagination: { total: 0, page, limit, pages: 0 },
});

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

  try {
    const hasLocation = lat !== undefined && lng !== undefined && lat !== 0 && lng !== 0;

    let userId: string | undefined;
    try {
      const session = await getServerSession(authOptions);
      userId = session?.user?.id;
    } catch {
      userId = undefined;
    }

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { shop: { name: { contains: search, mode: "insensitive" } } },
        { shop: { address: { contains: search, mode: "insensitive" } } },
        { category: { name: { contains: search, mode: "insensitive" } } },
        { subcategory: { name: { contains: search, mode: "insensitive" } } },
        { dishTags: { some: { tag: { name: { contains: search, mode: "insensitive" } } } } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (subcategoryId) where.subcategoryId = subcategoryId;
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
      dishTags: { include: { tag: true } },
      favorites: userId ? { where: { userId } } : false,
      Reminder: userId ? { where: { userId, isActive: true } } : false,
      reviews: { select: { rating: true } },
    };

    const calculateAverageRating = (reviews: any[]) => {
      if (!reviews?.length) return 0;
      return reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    };

    const filterByServeTime = (dishes: any[]) => {
      if (!serveTime || serveTime === "all") return dishes;
      return dishes.filter((dish) => {
        if (!dish.timings?.length) return false;
        if (serveTime === "available-now") {
          const currentHour = new Date().getHours();
          return dish.timings.some((t: any) => currentHour >= t.servedFrom.hour && currentHour <= t.servedUntil.hour);
        }
        return dish.timings.some((t: any) => {
          const h = t.servedFrom.hour;
          if (serveTime === "morning") return h >= 6 && h < 12;
          if (serveTime === "afternoon") return h >= 12 && h < 18;
          if (serveTime === "evening") return h >= 18 && h < 22;
          return true;
        });
      });
    };

    const sortDishes = (dishes: any[]) => {
      switch (sortBy) {
        case "rating": return dishes.sort((a, b) => calculateAverageRating(b.reviews) - calculateAverageRating(a.reviews));
        case "reviews": return dishes.sort((a, b) => (b.reviews?.length || 0) - (a.reviews?.length || 0));
        case "price-low": return dishes.sort((a, b) => a.price - b.price);
        case "price-high": return dishes.sort((a, b) => b.price - a.price);
        default: return dishes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    };

    if (hasLocation) {
      const allDishes = await prisma.dish.findMany({
        where: {},
        include: includeClause,
        orderBy: { createdAt: "desc" },
      });

      let dishesWithDistance = allDishes
        .filter((dish) => dish.shop.coordinates)
        .map((dish) => {
          const distance = calculateDistance(lat!, lng!, dish.shop.coordinates!.lat, dish.shop.coordinates!.lng);
          const isFavorite = userId ? dish.favorites.length > 0 : false;
          const isReminder = userId ? dish.Reminder.length > 0 : false;
          const avgRating = calculateAverageRating(dish.reviews || []);
          const { favorites, shop, Reminder, reviews, ...rest } = dish;
          const { coordinates, ...shopRest } = shop;
          return { ...rest, shop: { ...shopRest, distance }, isFavorite, isReminder, avgRating, reviews: reviews || [] };
        })
        .filter((dish) => dish.shop.distance! <= radius);

      if (search) dishesWithDistance = dishesWithDistance.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()) || (d.description && d.description.toLowerCase().includes(search.toLowerCase())));
      if (categoryId) dishesWithDistance = dishesWithDistance.filter((d) => d.categoryId === categoryId);
      if (subcategoryId) dishesWithDistance = dishesWithDistance.filter((d) => d.subcategoryId === subcategoryId);
      if (isEggless === true) dishesWithDistance = dishesWithDistance.filter((d) => d.isVeg === true);
      if (isEggless === false) dishesWithDistance = dishesWithDistance.filter((d) => d.isVeg === false);
      if (minRating && minRating > 0) dishesWithDistance = dishesWithDistance.filter((d) => d.avgRating >= minRating);
      dishesWithDistance = filterByServeTime(dishesWithDistance);
      dishesWithDistance = sortDishes(dishesWithDistance);

      const total = dishesWithDistance.length;
      const offset = (page - 1) * limit;
      return { dishes: dishesWithDistance.slice(offset, offset + limit), pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
    }

    const allDishes = await prisma.dish.findMany({ where, include: includeClause, orderBy: { createdAt: "desc" } });

    let filteredDishes = allDishes.map((dish) => {
      const isFavorite = userId ? dish.favorites.length > 0 : false;
      const isReminder = userId ? dish.Reminder.length > 0 : false;
      const avgRating = calculateAverageRating(dish.reviews || []);
      const { favorites, Reminder, reviews, shop, ...rest } = dish;
      return { ...rest, shop, isFavorite, isReminder, avgRating, reviews: reviews || [] };
    });

    if (minRating && minRating > 0) filteredDishes = filteredDishes.filter((d) => d.avgRating >= minRating);
    filteredDishes = filterByServeTime(filteredDishes);
    filteredDishes = sortDishes(filteredDishes);

    const total = filteredDishes.length;
    const offset = (page - 1) * limit;
    return { dishes: filteredDishes.slice(offset, offset + limit), pagination: { total, page, limit, pages: Math.ceil(total / limit) } };

  } catch (error) {
    console.error("getDishes error:", error);
    return emptyResponse(page, limit);
  }
}

export async function getCategories() {
  try {
    return await prisma.category.findMany({
      include: { subcategories: true },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("getCategories error:", error);
    return [];
  }
}
