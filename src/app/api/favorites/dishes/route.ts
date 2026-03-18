import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Get user's favorite dishes
export async function GET(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id as string;
    
    // Get pagination parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Get user's favorite dishes
    const favoriteDishes = await prisma.userFavoriteDish.findMany({
      where: {
        userId
      },
      include: {
        dish: {
          include: {
            shop: true,
            category: true,
            subcategory: true,
            dishTags: {
              include: {
                tag: true
              }
            },
            timings: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        id: 'desc'
      }
    });
    
    // Format the response
    const dishes = favoriteDishes.map(favorite => ({
      ...favorite.dish,
      isFavorite: true
    }));
    
    // Get total count for pagination
    const totalFavorites = await prisma.userFavoriteDish.count({
      where: { userId }
    });
    
    return NextResponse.json({
      dishes,
      pagination: {
        total: totalFavorites,
        page,
        limit,
        pages: Math.ceil(totalFavorites / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching favorite dishes:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorite dishes" },
      { status: 500 }
    );
  }
}

// Add a dish to favorites
export async function POST(req: NextRequest) {
  try {
    const { dishId } = await req.json();
    
    // Get user session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id as string;
    
    // Check if dish exists
    const dish = await prisma.dish.findUnique({
      where: { id: dishId }
    });
    
    if (!dish) {
      return NextResponse.json(
        { error: "Dish not found" },
        { status: 404 }
      );
    }
    
    // Check if already favorited
    const existingFavorite = await prisma.userFavoriteDish.findFirst({
      where: {
        userId,
        dishId
      }
    });
    
    if (existingFavorite) {
      return NextResponse.json(
        { error: "Dish already in favorites" },
        { status: 400 }
      );
    }
    
    // Add to favorites
    await prisma.userFavoriteDish.create({
      data: {
        userId,
        dishId
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding dish to favorites:", error);
    return NextResponse.json(
      { error: "Failed to add dish to favorites" },
      { status: 500 }
    );
  }
}

// Remove a dish from favorites
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const dishId = url.searchParams.get('dishId');
    
    if (!dishId) {
      return NextResponse.json(
        { error: "Dish ID is required" },
        { status: 400 }
      );
    }
    
    // Get user session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id as string;
    
    // Remove from favorites
    await prisma.userFavoriteDish.deleteMany({
      where: {
        userId,
        dishId
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing dish from favorites:", error);
    return NextResponse.json(
      { error: "Failed to remove dish from favorites" },
      { status: 500 }
    );
  }
}