import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { withCache } from "@/lib/cache";



async function getFaqsHandler(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const categoryId = url.searchParams.get('categoryId');
    
    const where = {
      isActive: true,
      ...(categoryId && { categoryId })
    };

    const faqs = await prisma.faq.findMany({
      where,
      include: { category: true },
      orderBy: [
        { category: { order: 'asc' } },
        { order: 'asc' }
      ]
    });

    return NextResponse.json({ faqs });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withCache(getFaqsHandler);

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
    
    const { question, answer, categoryId, order, isActive } = await request.json();

    if (!question || !answer || !categoryId) {
      return NextResponse.json(
        { error: 'Question, answer, and category ID are required' },
        { status: 400 }
      );
    }

    // Check if category exists
    const categoryExists = await prisma.faqCategory.findUnique({
      where: { id: categoryId }
    });

    if (!categoryExists) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const faq = await prisma.faq.create({
      data: {
        question,
        answer,
        categoryId,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true
      },
      include: { category: true }
    });

    return NextResponse.json({ 
      message: 'FAQ created successfully',
      faq 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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
    
    const { id, question, answer, categoryId, order, isActive } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'FAQ ID is required' },
        { status: 400 }
      );
    }

    // If categoryId is provided, check if it exists
    if (categoryId) {
      const categoryExists = await prisma.faqCategory.findUnique({
        where: { id: categoryId }
      });

      if (!categoryExists) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }
    }

    const faq = await prisma.faq.update({
      where: { id },
      data: {
        ...(question && { question }),
        ...(answer && { answer }),
        ...(categoryId && { categoryId }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive })
      },
      include: { category: true }
    });

    return NextResponse.json({
      message: 'FAQ updated successfully',
      faq
    });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check if user is authenticated and has appropriate role
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "owner") {
      return NextResponse.json({
        status: 401,
        message: 'Unauthorized'
      }, { status: 401 });
    }
    
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'FAQ ID is required' },
        { status: 400 }
      );
    }

    await prisma.faq.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}