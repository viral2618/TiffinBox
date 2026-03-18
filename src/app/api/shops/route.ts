import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { withCache } from "@/lib/cache";

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  // Convert coordinates from degrees to radians
  const toRad = (value: number) => value * Math.PI / 180;
  
  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  
  // Return distance rounded to 1 decimal place
  return Math.round(distance * 10) / 10;
}

async function getShopsHandler(req: NextRequest) {
  try {
    const url = new URL(req.url);
    
    // Get query parameters
    const lat = parseFloat(url.searchParams.get('lat') || '0');
    const lng = parseFloat(url.searchParams.get('lng') || '0');
    const radius = parseFloat(url.searchParams.get('radius') || '50');
    const search = url.searchParams.get('search') || '';
    const tagIds = url.searchParams.getAll('tagIds');
    const minRating = parseInt(url.searchParams.get('minRating') || '0');
    const isOpen = url.searchParams.get('isOpen') === 'true';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const sortBy = (url.searchParams.get('sortBy') as 'newest' | 'oldest' | 'nearest' | 'rating' | 'reviews' | 'distance' | 'relevance') || 'newest';
    
    // We'll allow requests without location coordinates
    // and just return shops without distance filtering in that case
    const hasLocation = !(lat === 0 && lng === 0);
    
    // Get user session to check if user is logged in
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // Build the where clause for filtering
    const where: any = {};
    
    // Add search filter if provided
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Add tag filter if provided
    if (tagIds.length > 0) {
      where.shopTags = {
        some: {
          tagId: { in: tagIds }
        }
      };
    }
    
    // Add isOpen filter if provided
    if (isOpen) {
      where.isOpen = true;
    }
    
    // For location-based queries, we need to fetch all shops to filter by distance
    // For non-location queries, we can use pagination at the database level
    const needsMemorySorting = sortBy === 'rating' || sortBy === 'reviews';
    const skip = (hasLocation || needsMemorySorting) ? 0 : (page - 1) * limit;
    const take = (hasLocation || needsMemorySorting) ? undefined : limit;
    
    // Get shops with coordinates
    const shops = await prisma.shop.findMany({
      where,
      include: {
        dishes: {
          take: 3, // Include just a few dishes for preview
          include: {
            category: true
          }
        },
        shopTags: {
          include: {
            tag: true
          }
        },
        favorites: userId ? {
          where: {
            userId
          }
        } : false,
        shopReviews: {
          select: {
            rating: true,
            id: true
          }
        }
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc' // Default ordering by newest first
      }
    });
    
    // Process shops based on whether location is provided
    interface ShopWithDistance extends Omit<typeof shops[number], 'favorites' | 'shopReviews'> {
      distance?: number;
      isFavorite: boolean;
      rating?: number;
      reviewCount?: number;
    }
    
    let shopsToReturn: ShopWithDistance[] = [];
    let isNearby = false;
    
    if (hasLocation) {
      // Filter shops by distance and add distance field
      let shopsWithDistance = shops
        .filter(shop => shop.coordinates)
        .map(shop => {
          const distance = calculateDistance(
            lat, 
            lng, 
            shop.coordinates!.lat, 
            shop.coordinates!.lng
          );
          
          const isFavorite = userId ? shop.favorites.length > 0 : false;
          const rating = shop.shopReviews?.length > 0 
            ? shop.shopReviews.reduce((sum, review) => sum + review.rating, 0) / shop.shopReviews.length 
            : 0;
          const reviewCount = shop.shopReviews?.length || 0;
          
          // Filter by minRating
          if (minRating > 0 && rating < minRating) return null;
          
          const { favorites, shopReviews, ...shopWithoutFavorites } = shop;
          
          return {
            ...shopWithoutFavorites,
            distance,
            isFavorite,
            rating,
            reviewCount
          };
        })
        .filter(shop => shop !== null) as ShopWithDistance[];
      // For distance sorting, always show nearest shops regardless of radius
      if (sortBy === 'distance') {
        shopsWithDistance = shops
          .filter(shop => shop.coordinates)
          .map(shop => {
            const distance = calculateDistance(
              lat, 
              lng, 
              shop.coordinates!.lat, 
              shop.coordinates!.lng
            );
            
            const isFavorite = userId ? shop.favorites.length > 0 : false;
            const rating = shop.shopReviews?.length > 0 
              ? shop.shopReviews.reduce((sum, review) => sum + review.rating, 0) / shop.shopReviews.length 
              : 0;
            const reviewCount = shop.shopReviews?.length || 0;
            
            // Filter by minRating
            if (minRating > 0 && rating < minRating) return null;
            
            const { favorites, shopReviews, ...shopWithoutFavorites } = shop;
            
            return {
              ...shopWithoutFavorites,
              distance,
              isFavorite,
              rating,
              reviewCount
            };
          })
          .filter(shop => shop !== null)
          .sort((a, b) => (a!.distance || 0) - (b!.distance || 0)) as ShopWithDistance[];
      } else {
        // For other sorting, filter by radius first
        shopsWithDistance = shopsWithDistance.filter(shop => shop.distance! <= radius);
      }
      
      // Sort based on sortBy parameter
      shopsWithDistance.sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'nearest':
            return (a.distance || 0) - (b.distance || 0);
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'reviews':
            return (b.reviewCount || 0) - (a.reviewCount || 0);
          case 'relevance':
            return a.name.localeCompare(b.name);
          case 'distance':
            return (a.distance || 0) - (b.distance || 0);
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
      
      // Apply pagination to the filtered shops
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      shopsToReturn = shopsWithDistance.slice(startIndex, endIndex);
      
      // If no shops found within radius, return empty result instead of all shops
      if (shopsToReturn.length === 0) {
        // Only return closest shops if radius is large (>50km) or no radius filter applied
        if (radius > 50) {
          const allShopsWithDistance = shops
            .filter(shop => shop.coordinates)
            .map(shop => {
              const distance = calculateDistance(
                lat, 
                lng, 
                shop.coordinates!.lat, 
                shop.coordinates!.lng
              );
              
              const isFavorite = userId ? shop.favorites.length > 0 : false;
              const rating = shop.shopReviews?.length > 0 
                ? shop.shopReviews.reduce((sum, review) => sum + review.rating, 0) / shop.shopReviews.length 
                : 0;
              const reviewCount = shop.shopReviews?.length || 0;
              
              // Filter by minRating
              if (minRating > 0 && rating < minRating) return null;
              
              const { favorites, shopReviews, ...shopWithoutFavorites } = shop;
              
              return {
                ...shopWithoutFavorites,
                distance,
                isFavorite,
                rating,
                reviewCount
              };
            })
            .filter(shop => shop !== null)
            .sort((a, b) => (a!.distance || 0) - (b!.distance || 0)) as ShopWithDistance[];
          
          // Take the closest shops up to the limit
          shopsToReturn = allShopsWithDistance.slice(startIndex, endIndex);
        }
      }
      
      isNearby = shopsToReturn.length > 0;
    } else {
      // For non-location queries, format the response with isFavorite field
      let processedShops = shops
        .map(shop => {
          const isFavorite = userId ? shop.favorites.length > 0 : false;
          const rating = shop.shopReviews?.length > 0 
            ? shop.shopReviews.reduce((sum, review) => sum + review.rating, 0) / shop.shopReviews.length 
            : 0;
          const reviewCount = shop.shopReviews?.length || 0;
          
          // Filter by minRating
          if (minRating > 0 && rating < minRating) return null;
          
          const { favorites, shopReviews, ...shopWithoutFavorites } = shop;
          
          return {
            ...shopWithoutFavorites,
            isFavorite,
            rating,
            reviewCount
          };
        })
        .filter(shop => shop !== null) as ShopWithDistance[];
      
      // Sort non-location shops based on sortBy parameter
      processedShops.sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'reviews':
            return (b.reviewCount || 0) - (a.reviewCount || 0);
          case 'relevance':
            return a.name.localeCompare(b.name);
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
      
      // Apply pagination after sorting (only if we did memory sorting)
      if (needsMemorySorting) {
        shopsToReturn = processedShops.slice((page - 1) * limit, page * limit);
      } else {
        shopsToReturn = processedShops;
      }
      
      isNearby = false;
    }
    
    // Calculate total count for pagination
    let totalCount = 0;
    
    if (hasLocation) {
      // For location-based queries, count based on sorting type
      if (sortBy === 'distance') {
        // For distance sorting, count all shops with coordinates
        totalCount = shops.filter(shop => shop.coordinates).length;
      } else {
        // For other sorting, count shops within radius
        totalCount = shops
          .filter(shop => shop.coordinates)
          .filter(shop => {
            const distance = calculateDistance(
              lat, 
              lng, 
              shop.coordinates!.lat, 
              shop.coordinates!.lng
            );
            return distance <= radius;
          }).length;
        
        // If no shops found within radius, don't count distant shops for small radius
        if (totalCount === 0 && radius > 50) {
          totalCount = shops.filter(shop => shop.coordinates).length;
        }
      }
    } else {
      // Count all shops that match the filters
      totalCount = await prisma.shop.count({ where });
    }
    
    // Return the response with pagination info
    return NextResponse.json({
      shops: shopsToReturn,
      isNearby,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching shops:", error);
    return NextResponse.json(
      { error: "Failed to fetch shops" },
      { status: 500 }
    );
  }
}

export const GET = withCache(getShopsHandler);

export const POST = withCache(async (req: NextRequest) => {
  return NextResponse.json({ message: "Cache invalidated" }, { status: 200 });
});

export const PUT = withCache(async (req: NextRequest) => {
  return NextResponse.json({ message: "Cache invalidated" }, { status: 200 });
});

export const DELETE = withCache(async (req: NextRequest) => {
  return NextResponse.json({ message: "Cache invalidated" }, { status: 200 });
});