import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCache } from "@/lib/cache";

async function getCategoriesHandler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { subcategories: { some: { name: { contains: search, mode: 'insensitive' } } } }
      ];
    }

    const [categories, totalCount] = await Promise.all([
      prisma.category.findMany({
        where,
        include: {
          subcategories: true
        },
        orderBy: {
          name: 'asc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.category.count({ where })
    ]);
    
    return NextResponse.json({ 
      categories,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export const GET = withCache(getCategoriesHandler);

// Handle mutations that should invalidate cache
export const POST = withCache(async (req: NextRequest) => {
  return NextResponse.json({ message: "Cache invalidated" }, { status: 200 });
});

export const PUT = withCache(async (req: NextRequest) => {
  return NextResponse.json({ message: "Cache invalidated" }, { status: 200 });
});

export const DELETE = withCache(async (req: NextRequest) => {
  return NextResponse.json({ message: "Cache invalidated" }, { status: 200 });
});