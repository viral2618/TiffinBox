import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const activePolicy = await prisma.privacyPolicy.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })

    if (!activePolicy) {
      return NextResponse.json(
        { error: 'No active privacy policy found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ policy: activePolicy })
  } catch (error) {
    console.error('Error fetching privacy policy:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "owner") {
      return NextResponse.json({
        status: 401,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    const { title, content, version, effectiveDate } = await request.json()

    if (!title || !content || !version || !effectiveDate) {
      return NextResponse.json(
        { error: 'Title, content, version, and effective date are required' },
        { status: 400 }
      )
    }

    // Deactivate current active policy
    await prisma.privacyPolicy.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    })

    const policy = await prisma.privacyPolicy.create({
      data: {
        title,
        content,
        version,
        effectiveDate: new Date(effectiveDate),
        isActive: true
      }
    })

    return NextResponse.json({ 
      message: 'Privacy policy created successfully',
      policy 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating privacy policy:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "owner") {
      return NextResponse.json({
        status: 401,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    const { id, title, content, version, effectiveDate, isActive } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Policy ID is required' },
        { status: 400 }
      )
    }

    if (isActive) {
      await prisma.privacyPolicy.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      })
    }

    const policy = await prisma.privacyPolicy.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(version && { version }),
        ...(effectiveDate && { effectiveDate: new Date(effectiveDate) }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json({
      message: 'Privacy policy updated successfully',
      policy
    })
  } catch (error) {
    console.error('Error updating privacy policy:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}