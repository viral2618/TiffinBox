import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const {slug} = await params;
    
    // Get user session to check if user is logged in
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // Get shop by slug
    const shop = await prisma.shop.findUnique({
      where: {
        slug
      },
      include: {
        dishes: {
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
            } : false
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
        } : false
      }
    });
    
    if (!shop) {
      return NextResponse.json(
        { error: "Shop not found" },
        { status: 404 }
      );
    }
    
    // Add isFavorite field to shop
    const isFavorite = userId ? shop.favorites.length > 0 : false;
    
    // Add isFavorite field to each dish
    const dishesWithFavorites = shop.dishes.map(dish => {
      const isDishFavorite = userId ? dish.favorites.length > 0 : false;
      const { favorites, ...dishWithoutFavorites } = dish;
      return {
        ...dishWithoutFavorites,
        isFavorite: isDishFavorite
      };
    });
    
    // Remove favorites from response to avoid sending unnecessary data
    const { favorites, ...shopWithoutFavorites } = shop;
    
    return NextResponse.json({
      shop: {
        ...shopWithoutFavorites,
        dishes: dishesWithFavorites,
        isFavorite
      }
    });
  } catch (error) {
    console.error("Error fetching shop:", error);
    return NextResponse.json(
      { error: "Failed to fetch shop" },
      { status: 500 }
    );
  }
}