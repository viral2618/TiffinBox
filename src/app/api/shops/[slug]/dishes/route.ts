import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const {slug }= await params;
    const url = new URL(req.url);
    
    // Get query parameters
    const search = url.searchParams.get('search') || '';
    const categoryId = url.searchParams.get('categoryId') || undefined;
    const subcategoryId = url.searchParams.get('subcategoryId') || undefined;
    const tagId = url.searchParams.get('tagId') || undefined;
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Get user session to check if user is logged in
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // Find shop by slug
    const shop = await prisma.shop.findUnique({
      where: { slug },
      select: { id: true }
    });
    
    if (!shop) {
      return NextResponse.json(
        { error: "Shop not found" },
        { status: 404 }
      );
    }
    
    // Build the where clause for filtering
    const where: any = {
      shopId: shop.id
    };
    
    // Add search filter if provided
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Add category filter if provided
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    // Add subcategory filter if provided
    if (subcategoryId) {
      where.subcategoryId = subcategoryId;
    }
    
    // Add tag filter if provided
    if (tagId) {
      where.dishTags = {
        some: {
          tagId
        }
      };
    }
    
    // Get dishes with filters
    const dishes = await prisma.dish.findMany({
      where,
      include: {
        category: true,
        subcategory: true,
        dishTags: {
          include: {
            tag: true
          }
        },
        timings: true,
        favorites: userId ? {
          where: {
            userId
          }
        } : false,
        Reminder: userId ? {
          where: {
            userId,
            isActive: true
          }
        } : false
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Add isFavorite and isReminder fields to each dish
    const dishesWithFavorites = dishes.map(dish => {
      const isFavorite = userId ? dish.favorites.length > 0 : false;
      const isReminder = userId ? dish.Reminder.length > 0 : false;
      const { favorites, Reminder, ...dishWithoutFavorites } = dish;
      return {
        ...dishWithoutFavorites,
        isFavorite,
        isReminder
      };
    });
    
    // Get total count for pagination
    const totalDishes = await prisma.dish.count({ where });
    
    return NextResponse.json({
      dishes: dishesWithFavorites,
      pagination: {
        total: totalDishes,
        page,
        limit,
        pages: Math.ceil(totalDishes / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching dishes:", error);
    return NextResponse.json(
      { error: "Failed to fetch dishes" },
      { status: 500 }
    );
  }
}