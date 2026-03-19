import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';



export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        dishes: [],
        shops: [],
        categories: [],
        totalHits: 0,
        processingTimeMs: 0,
      });
    }

    const startTime = Date.now();

    // Search dishes
    const dishes = await prisma.dish.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrls: true,
        slug: true,
        price: true,
        shop: { select: { name: true } },
        category: { select: { name: true } },
      },
      take: Math.min(limit, 50),
    });

    // Search shops
    const shops = await prisma.shop.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 5,
    });

    // Search categories
    const categories = await prisma.category.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
      },
      take: 5,
    });

    const processingTimeMs = Date.now() - startTime;

    const results = {
      dishes: dishes.map(dish => ({
        id: dish.id,
        type: 'dish' as const,
        title: dish.name,
        description: dish.description || '',
        image: dish.imageUrls?.[0] || '',
        slug: dish.slug,
        categoryName: dish.category?.name || '',
        shopName: dish.shop?.name || '',
        price: dish.price || 0,
        isAvailable: true,
      })),
      shops: shops.map(shop => ({
        id: shop.id,
        type: 'shop' as const,
        title: shop.name,
        description: shop.description || '',
        image: shop.imageUrls?.[0] || '',
        slug: shop.slug,
      })),
      categories: categories.map(category => ({
        id: category.id,
        type: 'category' as const,
        title: category.name,
        description: category.description || '',
        image: category.imageUrl || '',
        slug: category.slug,
      })),
      totalHits: dishes.length + shops.length + categories.length,
      processingTimeMs,
    };
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Fallback search error:', error);
    return NextResponse.json(
      { error: 'Search service unavailable' },
      { status: 500 }
    );
  }
}