import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCachedSearch, setCachedSearch } from '@/lib/search-cache';

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

    // Check cache first
    const cached = await getCachedSearch(query);
    if (cached) {
      return NextResponse.json(cached);
    }

    const startTime = Date.now();
    const searchTerm = query.trim();

    const [dishes, shops, categories] = await Promise.all([
      // Optimized dish search
      prisma.dish.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { description: { contains: searchTerm, mode: "insensitive" } },
            { category: { name: { contains: searchTerm, mode: "insensitive" } } },
            { shop: { name: { contains: searchTerm, mode: "insensitive" } } },
          ],
        },
        take: limit,
        include: {
          shop: { select: { name: true } },
          category: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Shop search
      prisma.shop.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { description: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        take: 5,
        orderBy: { name: 'asc' },
      }),

      // Category search
      prisma.category.findMany({
        where: { name: { contains: searchTerm, mode: "insensitive" } },
        take: 5,
        orderBy: { name: 'asc' },
      }),
    ]);

    const result = {
      dishes: dishes.map(dish => ({
        id: dish.id,
        type: 'dish' as const,
        title: dish.name,
        description: dish.description || '',
        image: dish.imageUrls?.[0] || '',
        slug: dish.slug,
        categoryName: dish.category?.name,
        shopName: dish.shop?.name,
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
      processingTimeMs: Date.now() - startTime,
    };

    // Cache results
    await setCachedSearch(query, result);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}