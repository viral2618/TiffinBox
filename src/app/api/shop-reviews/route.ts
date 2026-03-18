import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { sendNotification } from '@/lib/notifications'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')
    const skip = parseInt(searchParams.get('skip') || '0')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!shopId) {
      return NextResponse.json({ error: 'Shop ID is required' }, { status: 400 })
    }

    // Try to get shop reviews, but handle if the table doesn't exist
    try {
      const reviews = await prisma.shopReview.findMany({
        where: {
          shopId: shopId
        },
        include: {
          user: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      })

      const totalCount = await prisma.shopReview.count({
        where: {
          shopId: shopId
        }
      })

      const formattedReviews = reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
        user: {
          id: review.userId,
          name: review.user?.name || 'Anonymous'
        }
      }))

      // Calculate average rating
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0

      return NextResponse.json({
        reviews: formattedReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        totalCount,
        hasMore: skip + limit < totalCount,
        total: totalCount
      })
    } catch (dbError) {
      // If shop reviews table doesn't exist, return empty reviews
      console.log('Shop reviews table not found, returning empty reviews')
      return NextResponse.json({
        reviews: [],
        averageRating: 0,
        totalCount: 0,
        hasMore: false,
        total: 0
      })
    }

  } catch (error) {
    console.error('Error fetching shop reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { shopId, rating, comment } = await request.json()

    if (!shopId || !rating) {
      return NextResponse.json(
        { error: 'Shop ID and rating are required' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if shop exists
    const shop = await prisma.shop.findUnique({
      where: { id: shopId }
    })

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      )
    }

    // Check if user has already reviewed this shop
    const existingReview = await prisma.shopReview.findUnique({
      where: {
        userId_shopId: {
          userId: session.user.id,
          shopId: shopId
        }
      }
    })

    if (existingReview) {
      // Update existing review
      const updatedReview = await prisma.shopReview.update({
        where: {
          userId_shopId: {
            userId: session.user.id,
            shopId: shopId
          }
        },
        data: {
          rating,
          comment: comment || null
        }
      })

      return NextResponse.json({
        message: 'Review updated successfully',
        review: updatedReview
      })
    } else {
      // Create new review
      const newReview = await prisma.shopReview.create({
        data: {
          userId: session.user.id,
          shopId,
          rating,
          comment: comment || null
        },
        include: {
          user: {
            select: {
              name: true
            }
          },
          shop: {
            select: {
              name: true,
              ownerId: true
            }
          }
        }
      })

      // Send notification to shop owner
      try {
        await sendNotification({
          ownerId: newReview.shop.ownerId,
          title: 'New Shop Review',
          message: `${newReview.user.name} left a ${rating}-star review for your shop "${newReview.shop.name}"`,
          type: 'review',
          emailSubject: 'New Review on Your Shop'
        });
      } catch (notificationError) {
        console.error('Failed to send shop review notification:', notificationError);
      }

      return NextResponse.json({
        message: 'Review created successfully',
        review: newReview
      }, { status: 201 })
    }

  } catch (error) {
    console.error('Error creating/updating shop review:', error)
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    )
  }
}