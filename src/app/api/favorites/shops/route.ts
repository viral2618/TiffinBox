import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Get user's favorite shops
export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Get user ID from session
    const userId = session.user.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found" },
        { status: 400 }
      );
    }
    
    // Get pagination parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Get user's favorite shops
    const favoriteShops = await prisma.userFavoriteShop.findMany({
      where: {
        userId
      },
      include: {
        shop: {
          include: {
            shopTags: {
              include: {
                tag: true
              }
            }
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
    const shops = favoriteShops.map(favorite => ({
      ...favorite.shop,
      isFavorite: true
    }));
    
    // Get total count for pagination
    const totalFavorites = await prisma.userFavoriteShop.count({
      where: { userId }
    });
    
    return NextResponse.json({
      shops,
      pagination: {
        total: totalFavorites,
        page,
        limit,
        pages: Math.ceil(totalFavorites / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching favorite shops:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorite shops" },
      { status: 500 }
    );
  }
}

// POST: Add a shop to favorites
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Get user ID from session
    const userId = session.user.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found" },
        { status: 400 }
      );
    }
    
    // Get shop ID from request body
    const { shopId } = await req.json();
    
    if (!shopId) {
      return NextResponse.json(
        { error: "Shop ID is required" },
        { status: 400 }
      );
    }
    
    // Check if shop exists
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
    });
    
    if (!shop) {
      return NextResponse.json(
        { error: "Shop not found" },
        { status: 404 }
      );
    }
    
    // Check if already favorited
    const existingFavorite = await prisma.userFavoriteShop.findUnique({
      where: {
        userId_shopId: {
          userId,
          shopId,
        },
      },
    });
    
    if (existingFavorite) {
      return NextResponse.json(
        { message: "Shop already in favorites" },
        { status: 200 }
      );
    }
    
    // Add to favorites
    await prisma.userFavoriteShop.create({
      data: {
        userId,
        shopId,
      },
    });
    
    return NextResponse.json(
      { message: "Shop added to favorites" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding shop to favorites:", error);
    return NextResponse.json(
      { error: "Failed to add shop to favorites" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a shop from favorites
export async function DELETE(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Get user ID from session
    const userId = session.user.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found" },
        { status: 400 }
      );
    }
    
    // Get shop ID from query parameters
    const url = new URL(req.url);
    const shopId = url.searchParams.get("shopId");
    
    if (!shopId) {
      return NextResponse.json(
        { error: "Shop ID is required" },
        { status: 400 }
      );
    }
    
    // Remove from favorites
    await prisma.userFavoriteShop.deleteMany({
      where: {
        userId,
        shopId,
      },
    });
    
    return NextResponse.json(
      { message: "Shop removed from favorites" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing shop from favorites:", error);
    return NextResponse.json(
      { error: "Failed to remove shop from favorites" },
      { status: 500 }
    );
  }
}