import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      fullName,
      email,
      contactNumber,
      preferredBakery,
      feedbackCategory,
      feedback,
      experienceRating,
      allowFollowUp,
      userEmail
    } = body

    const feedbackData = await prisma.feedback.create({
      data: {
        fullName,
        email,
        contactNumber,
        preferredBakery,
        feedbackCategory,
        feedback,
        experienceRating: parseInt(experienceRating),
        allowFollowUp: allowFollowUp === 'yes',
        userId: null // Store without user association for now
      }
    })

    // Create notification for feedback submission
    if (userEmail) {
      const user = await prisma.user.findUnique({ where: { email: userEmail } })
      if (user) {
        await prisma.notification.create({
          data: {
            title: 'Feedback Submitted',
            message: `Your feedback for ${feedbackCategory} has been submitted successfully. Thank you for your input!`,
            type: 'feedback',
            userId: user.id
          }
        })
      }
    }

    return NextResponse.json({ success: true, feedback: feedbackData })
  } catch (error) {
    console.error('Error creating feedback:', error)
    return NextResponse.json({ error: 'Failed to create feedback' }, { status: 500 })
  }
}