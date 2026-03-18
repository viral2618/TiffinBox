import { NextRequest, NextResponse } from 'next/server';
import { meilisearchService } from '@/lib/services/meilisearch.service';
import { prisma } from '@/lib/prisma';
import { SEARCH_INDEXES } from '@/lib/meilisearch';

export async function POST(request: NextRequest) {
  try {
    // Check if Meilisearch is configured
    if (!process.env.MEILI_SEARCH_URL || !process.env.MEILI_SEARCH_API_KEY) {
      return NextResponse.json(
        { error: 'Meilisearch is not configured' },
        { status: 503 }
      );
    }

    console.log('Starting search initialization...');
    
    // Check for authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.MEILI_SEARCH_API_KEY}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Initialize indexes
    console.log('Initializing Meilisearch indexes...');
    await meilisearchService.initializeIndexes();
    
    // Index dishes
    console.log('Indexing dishes...');
    const dishes = await prisma.dish.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        imageUrls: true,
        slug: true,
        price: true,
        shop: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        subcategory: { select: { id: true, name: true } },
      },
    });
    
    const dishDocuments = dishes.map(dish => ({
      id: dish.id,
      name: dish.name,
      description: dish.description || '',
      image: dish.imageUrls?.[0] || '',
      slug: dish.slug,
      categoryName: dish.category?.name || '',
      shopName: dish.shop?.name || '',
      price: dish.price || 0,
      isAvailable: true,
      searchableText: [
        dish.name,
        dish.description || '',
        dish.category?.name || '',
        dish.subcategory?.name || '',
        dish.shop?.name || '',
      ].filter(Boolean).join(' ').toLowerCase(),
    }));
    
    if (dishDocuments.length > 0) {
      await meilisearchService.indexDocuments(SEARCH_INDEXES.DISHES, dishDocuments);
      console.log(`Indexed ${dishDocuments.length} dishes`);
    }
    
    return NextResponse.json({
      success: true,
      message: `Search indexes initialized successfully. Indexed ${dishDocuments.length} dishes.`,
    });
  } catch (error) {
    console.error('Search initialization error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initialize search indexes',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Check if Meilisearch is configured
  if (!process.env.MEILI_SEARCH_URL || !process.env.MEILI_SEARCH_API_KEY) {
    return NextResponse.json({
      message: 'Search initialization endpoint (Meilisearch not configured)',
      configured: false
    });
  }

  return NextResponse.json({
    message: 'Search initialization endpoint. Use POST to initialize indexes.',
    configured: true,
    endpoints: {
      initialize: 'POST /api/search/init',
      reindex: 'POST /api/search/reindex',
    }
  });
}