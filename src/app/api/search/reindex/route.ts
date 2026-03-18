import { NextRequest, NextResponse } from 'next/server';
import { searchIndexingService } from '@/lib/services/search-indexing.service';

export async function POST(request: NextRequest) {
  try {
    // Check for authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.MEILI_SEARCH_API_KEY}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await searchIndexingService.reindexAll();
    
    return NextResponse.json({
      success: true,
      message: 'All search indexes reindexed successfully',
    });
  } catch (error) {
    console.error('Search reindex error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to reindex search data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}