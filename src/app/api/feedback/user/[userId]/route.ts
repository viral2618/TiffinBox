import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    if (!userId || userId === 'undefined') {
      return NextResponse.json({ feedbacks: [] })
    }

    // Get feedback by email for now
    const feedbacks = await prisma.feedback.findMany({
      where: {
        email: decodeURIComponent(userId)
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ feedbacks })
  } catch (error) {
    console.error('Error fetching user feedback:', error)
    return NextResponse.json({ feedbacks: [] })
  }
}