import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";



export async function GET() {
  try {
    const categories = await prisma.faqCategory.findMany({
      where: { isActive: true },
      include: {
        faqs: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching FAQ categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and has appropriate role
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "owner") {
      return NextResponse.json({
        status: 401,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const { name, description, order } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    const category = await prisma.faqCategory.create({
      data: {
        name,
        description,
        order: order || 0
      }
    })

    return NextResponse.json({ 
      message: 'FAQ category created successfully',
      category 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating FAQ category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check if user is authenticated and has appropriate role
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "owner") {
      return NextResponse.json({
        status: 401,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const { id, name, description, order, isActive } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    const category = await prisma.faqCategory.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json({
      message: 'FAQ category updated successfully',
      category
    })
  } catch (error) {
    console.error('Error updating FAQ category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}