import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'owner') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get owner details
    const owner = await prisma.owner.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        phone: true,
      },
    });

    if (!owner) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 });
    }

    // Count shops
    const totalShops = await prisma.shop.count({
      where: { ownerId: session.user.id },
    });

    // Count dishes across all shops
    const shops = await prisma.shop.findMany({
      where: { ownerId: session.user.id },
      select: { id: true },
    });

    const shopIds = shops.map(shop => shop.id);
    
    const totalDishes = await prisma.dish.count({
      where: { shopId: { in: shopIds } },
    });

    return NextResponse.json({
      name: owner.name,
      email: owner.email,
      phone: owner.phone,
      totalShops,
      totalDishes,
    });
  } catch (error) {
    console.error('Error fetching owner stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch owner stats' },
      { status: 500 }
    );
  }
}