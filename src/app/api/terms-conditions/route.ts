import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const activeTerms = await prisma.termsConditions.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    if (!activeTerms) {
      return NextResponse.json(
        { error: 'No active terms and conditions found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ terms: activeTerms });
  } catch (error) {
    console.error('Error fetching terms and conditions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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
    
    const { title, content, version, effectiveDate } = await request.json();

    if (!title || !content || !version || !effectiveDate) {
      return NextResponse.json(
        { error: 'Title, content, version, and effective date are required' },
        { status: 400 }
      );
    }

    // Deactivate current active terms
    await prisma.termsConditions.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    const terms = await prisma.termsConditions.create({
      data: {
        title,
        content,
        version,
        effectiveDate: new Date(effectiveDate),
        isActive: true
      }
    });

    return NextResponse.json({ 
      message: 'Terms and conditions created successfully',
      terms 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating terms and conditions:', error);
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
    
    const { id, title, content, version, effectiveDate, isActive } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Terms ID is required' },
        { status: 400 }
      );
    }

    if (isActive) {
      await prisma.termsConditions.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    const terms = await prisma.termsConditions.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(version && { version }),
        ...(effectiveDate && { effectiveDate: new Date(effectiveDate) }),
        ...(isActive !== undefined && { isActive })
      }
    });

    return NextResponse.json({
      message: 'Terms and conditions updated successfully',
      terms
    });
  } catch (error) {
    console.error('Error updating terms and conditions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}