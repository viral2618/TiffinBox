import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const exclude = searchParams.get('exclude')
    const categoryId = searchParams.get('categoryId')
    const shopId = searchParams.get('shopId')
    const limit = parseInt(searchParams.get('limit') || '4')

    if (!exclude) {
      return NextResponse.json({ error: 'Missing exclude parameter' }, { status: 400 })
    }

    // Build where clause for related dishes
    const whereClause: any = {
      id: { not: exclude }
    }

    // Prioritize dishes from same category or shop
    if (categoryId) {
      whereClause.categoryId = categoryId
    } else if (shopId) {
      whereClause.shopId = shopId
    }

    let dishes = await prisma.dish.findMany({
      where: whereClause,
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true
          }
        },
        timings: true
      },
      take: limit * 2, // Get more dishes to randomize
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Randomize and limit the results
    dishes = dishes.sort(() => Math.random() - 0.5).slice(0, limit)

    // If we don't have enough dishes from same category/shop, get random dishes
    if (dishes.length < limit) {
      const remainingCount = limit - dishes.length
      const excludeIds = [exclude, ...dishes.map(d => d.id)]
      
      const additionalDishes = await prisma.dish.findMany({
        where: {
          id: { notIn: excludeIds }
        },
        include: {
          shop: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true
            }
          },
          timings: true
        },
        take: remainingCount * 3, // Get more dishes to randomize
        orderBy: {
          createdAt: 'desc'
        }
      })

      // Randomize additional dishes
      const randomizedAdditional = additionalDishes.sort(() => Math.random() - 0.5).slice(0, remainingCount)

      dishes = [...dishes, ...randomizedAdditional]
    }

    // Transform dishes to match DishCard interface
    const transformedDishes = dishes.map(dish => ({
      id: dish.id,
      name: dish.name,
      slug: dish.slug,
      description: dish.description,
      imageUrls: dish.imageUrls,
      price: dish.price,
      originalPrice: dish.originalPrice,
      discountPercentage: dish.discountPercentage,
      isVeg: dish.isVeg,
      shop: {
        id: dish.shop.id,
        name: dish.shop.name,
        slug: dish.shop.slug,
        logoUrl: dish.shop.logoUrl
      },
      isFavorite: false, // Will be updated by client-side logic
      isReminder: false, // Will be updated by client-side logic
      timings: dish.timings.map(timing => ({
        preparedAt: timing.preparedAt,
        servedFrom: timing.servedFrom,
        servedUntil: timing.servedUntil
      }))
    }))

    return NextResponse.json({ dishes: transformedDishes })
  } catch (error) {
    console.error('Error fetching related dishes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}