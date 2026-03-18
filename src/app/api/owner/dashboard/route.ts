import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    // Get the authenticated session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const ownerId = session.user.id;

    // Fetch the owner from the database
    const owner = await prisma.owner.findUnique({ where: { id: ownerId } });
    if (!owner) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 });
    }

    // Get all shops for this owner with their tags
    const shops = await prisma.shop.findMany({
      where: { ownerId: owner.id },
      include: {
        shopTags: {
          include: {
            tag: true
          }
        }
      }
    });
    
    // Get dish counts for each shop
    const shopWithDishCounts = await Promise.all(shops.map(async (shop) => {
      const dishCount = await prisma.dish.count({
        where: { shopId: shop.id }
      });
      
      return {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        address: shop.address,
        logoUrl: shop.logoUrl,
        dishCount,
        tags: shop.shopTags.map(st => ({
          id: st.tag.id,
          name: st.tag.name
        }))
      };
    }));
    
    // Get overall stats
    const totalDishes = await prisma.dish.count({
      where: { shop: { ownerId: owner.id } }
    });
    
    const vegDishes = await prisma.dish.count({
      where: { 
        shop: { ownerId: owner.id },
        isVeg: true
      }
    });
    
    // Get recent dishes
    const recentDishes = await prisma.dish.findMany({
      where: { shop: { ownerId: owner.id } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { shop: true }
    });
    
    const formattedRecentDishes = recentDishes.map(dish => ({
      id: dish.id,
      name: dish.name,
      shopName: dish.shop.name,
      price: dish.price,
      currency: dish.currency,
      imageUrl: dish.imageUrls[0] || null,
      createdAt: dish.createdAt.toISOString(),
      isVeg: dish.isVeg
    }));
    
    const dashboardData = {
      owner: {
        id: owner.id,
        name: owner.name,
        email: owner.email,
        isOnboarded: owner.isOnboarded
      },
      shops: shopWithDishCounts,
      stats: {
        totalShops: shops.length,
        totalDishes,
        vegDishes,
        premiumDishes: 0,
        specialToday: 0
      },
      recentDishes: formattedRecentDishes
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}