import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendNotification } from '@/lib/notifications'
import { z } from 'zod'

const createReviewSchema = z.object({
  dishId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    console.log('Review API - Session:', { 
      hasSession: !!session, 
      userId: session?.user?.id, 
      userRole: session?.user?.role 
    })
    
    if (!session?.user?.id) {
      console.log('Review API - No session or user ID')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Only allow users (not owners) to create reviews
    if (session.user.role !== 'user') {
      console.log('Review API - Invalid role:', session.user.role)
      return NextResponse.json(
        { error: 'Only customers can leave reviews' },
        { status: 403 }
      )
    }

    const body = await request.json()
    console.log('Review API - Request body:', body)
    const { dishId, rating, comment } = createReviewSchema.parse(body)

    // Check if dish exists
    const dish = await prisma.dish.findUnique({
      where: { id: dishId }
    })

    if (!dish) {
      return NextResponse.json(
        { error: 'Dish not found' },
        { status: 404 }
      )
    }

    // Check if user already has a review for this dish
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_dishId: {
          userId: session.user.id,
          dishId: dishId
        }
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this dish and cannot change your review' },
        { status: 400 }
      )
    }

    // Create new review (only if no existing review)
    console.log('Review API - Creating review:', { userId: session.user.id, dishId, rating, comment })
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        dishId,
        rating,
        comment
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        dish: {
          select: {
            name: true,
            shop: {
              select: {
                ownerId: true,
                name: true
              }
            }
          }
        }
      }
    })
    console.log('Review API - Review created:', review.id)

    // Send notification to shop owner
    try {
      await sendNotification({
        ownerId: review.dish.shop.ownerId,
        title: 'New Review Received',
        message: `${review.user.name} left a ${rating}-star review for "${review.dish.name}" at ${review.dish.shop.name}`,
        type: 'review',
        emailSubject: 'New Review on Your Dish'
      });
    } catch (notificationError) {
      console.error('Failed to send review notification:', notificationError);
    }

    return NextResponse.json(review)
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dishId = searchParams.get('dishId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!dishId) {
      return NextResponse.json(
        { error: 'Dish ID is required' },
        { status: 400 }
      )
    }

    const skip = (page - 1) * limit

    const [reviews, totalCount, averageRating] = await Promise.all([
      prisma.review.findMany({
        where: { dishId },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.review.count({
        where: { dishId }
      }),
      prisma.review.aggregate({
        where: { dishId },
        _avg: {
          rating: true
        }
      })
    ])

    return NextResponse.json({
      reviews,
      totalCount,
      averageRating: averageRating._avg.rating || 0,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}