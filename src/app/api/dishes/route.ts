import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { withCache } from "@/lib/cache";

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  // Convert coordinates from degrees to radians
  const toRad = (value: number) => (value * Math.PI) / 180;

  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  // Return distance rounded to 1 decimal place
  return Math.round(distance * 10) / 10;
}

async function getDishesHandler(req: NextRequest) {
  try {
    const url = new URL(req.url);

    // Get query parameters
    const lat = parseFloat(url.searchParams.get("lat") || "0");
    const lng = parseFloat(url.searchParams.get("lng") || "0");
    const radius = parseFloat(url.searchParams.get("radius") || "5"); // Default radius is 5km
    const search = url.searchParams.get("search") || "";
    const categoryId = url.searchParams.get("categoryId") || undefined;
    const subcategoryId = url.searchParams.get("subcategoryId") || undefined;
    const sortBy = url.searchParams.get("sortBy") || "distance";
    const isEggless = url.searchParams.get("isEggless");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "12");

    console.log('API received params:', { 
      page, 
      limit, 
      search, 
      categoryId, 
      subcategoryId, 
      lat, 
      lng, 
      radius,
      hasLocation: !(lat === 0 && lng === 0) 
    });

    const hasLocation = !(lat === 0 && lng === 0);

    // Get user session to check if user is logged in
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Build the where clause for filtering
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (subcategoryId) {
      where.subcategoryId = subcategoryId;
    }

    if (isEggless === 'true') {
      where.isVeg = true;
    } else if (isEggless === 'false') {
      where.isVeg = false;
    }

    // For location-based queries, fetch all dishes to calculate distances
    // For non-location queries, use database pagination
    let allDishes = await prisma.dish.findMany({
        where: hasLocation ? {} : where, // When using location, ignore other filters in DB query
        include: {
          shop: {
            include: {
              shopReviews: {
                select: {
                  rating: true,
                  id: true
                }
              }
            }
          },
          category: true,
          subcategory: true,
          timings: true,
          favorites: userId
            ? {
                where: {
                  userId,
                },
              }
            : false,
          Reminder: userId
            ? {
                where: {
                  userId,
                  isActive: true,
                },
              }
            : false,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    interface DishWithDistance
      extends Omit<(typeof allDishes)[number], "favorites" | "shop" | "Reminder"> {
      shop: Omit<(typeof allDishes)[number]["shop"], "coordinates" | "shopReviews"> & {
        distance?: number;
        rating?: number;
        reviewCount?: number;
      };
      isFavorite: boolean;
      isReminder: boolean;
    }

    let dishesToReturn: DishWithDistance[] = [];
    let totalCount = 0;

    if (hasLocation) {
      let dishesWithDistance = allDishes
        .filter((dish) => dish.shop.coordinates)
        .map((dish) => {
          const distance = calculateDistance(
            lat,
            lng,
            dish.shop.coordinates!.lat,
            dish.shop.coordinates!.lng
          );

          const isFavorite = userId ? dish.favorites.length > 0 : false;
          const isReminder = userId ? dish.Reminder.length > 0 : false;
          const { favorites, shop, Reminder, ...dishWithoutFavorites } = dish;
          const { coordinates, shopReviews, ...shopWithoutCoordinates } = shop;
          
          // Calculate shop rating
          const rating = shopReviews?.length > 0 
            ? shopReviews.reduce((sum, review) => sum + review.rating, 0) / shopReviews.length 
            : 0;
          const reviewCount = shopReviews?.length || 0;

          return {
            ...dishWithoutFavorites,
            shop: {
              ...shopWithoutCoordinates,
              distance,
              rating,
              reviewCount
            },
            isFavorite,
            isReminder,
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
      
      if (isEggless === 'true') {
        dishesWithDistance = dishesWithDistance.filter(dish => dish.isVeg === true);
      } else if (isEggless === 'false') {
        dishesWithDistance = dishesWithDistance.filter(dish => dish.isVeg === false);
      }

      // Sort dishes
      dishesWithDistance.sort((a, b) => {
        switch (sortBy) {
          case 'distance':
            return (a.shop.distance || 0) - (b.shop.distance || 0);
          case 'rating':
            return 0; // No rating data available
          case 'rating-low':
            return 0; // No rating data available
          case 'reviews':
            return 0; // No review data available
          case 'relevance':
            return a.name.localeCompare(b.name);
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          default:
            return (a.shop.distance || 0) - (b.shop.distance || 0);
        }
      });
      
      totalCount = dishesWithDistance.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      dishesToReturn = dishesWithDistance.slice(startIndex, endIndex);

    } else {
      // No location filter - show all dishes with pagination
      let allDishesForPagination = allDishes.map((dish) => {
        const isFavorite = userId ? dish.favorites.length > 0 : false;
        const isReminder = userId ? dish.Reminder.length > 0 : false;
        const { favorites, shop, Reminder, ...dishWithoutFavorites } = dish;
        const { coordinates, shopReviews, ...shopWithoutCoordinates } = shop;
        
        // Calculate shop rating
        const rating = shopReviews?.length > 0 
          ? shopReviews.reduce((sum, review) => sum + review.rating, 0) / shopReviews.length 
          : 0;
        const reviewCount = shopReviews?.length || 0;

        return {
          ...dishWithoutFavorites,
          shop: {
            ...shopWithoutCoordinates,
            rating,
            reviewCount
          },
          isFavorite,
          isReminder,
        };
      });
      
      // Sort non-location dishes
      allDishesForPagination.sort((a, b) => {
        switch (sortBy) {
          case 'rating':
            return 0; // No rating data available
          case 'rating-low':
            return 0; // No rating data available
          case 'reviews':
            return 0; // No review data available
          case 'relevance':
            return a.name.localeCompare(b.name);
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
      
      totalCount = allDishesForPagination.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      dishesToReturn = allDishesForPagination.slice(startIndex, endIndex);
    }

    const result = {
      dishes: dishesToReturn,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    };
    
    console.log('API returning:', { dishesCount: dishesToReturn.length, pagination: result.pagination });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching dishes:", error);
    return NextResponse.json(
      { error: "Failed to fetch dishes" },
      { status: 500 }
    );
  }
}

export const GET = getDishesHandler; // Temporarily disable cache

export const POST = withCache(async (req: NextRequest) => {
  return NextResponse.json({ message: "Cache invalidated" }, { status: 200 });
});

export const PUT = withCache(async (req: NextRequest) => {
  return NextResponse.json({ message: "Cache invalidated" }, { status: 200 });
});

export const DELETE = withCache(async (req: NextRequest) => {
  return NextResponse.json({ message: "Cache invalidated" }, { status: 200 });
});