import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { withCache } from "@/lib/cache";



async function getAboutHandler() {
  try {
    const about = await prisma.about.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({
      status: 200,
      data: about,
      message: about ? 'About content retrieved successfully' : 'No about content found'
    });
  } catch (error) {
    console.error('Error fetching about:', error);
    return NextResponse.json({
      status: 500,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export const GET = withCache(getAboutHandler);

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
    
    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json({
        status: 400,
        message: 'Title and content are required'
      }, { status: 400 });
    }

    // Deactivate existing about content
    await prisma.about.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    // Create new about content
    const about = await prisma.about.create({
      data: {
        title,
        content,
        isActive: true
      }
    });

    return NextResponse.json({
      status: 201,
      data: about,
      message: 'About content created successfully'
    });
  } catch (error) {
    console.error('Error creating about:', error);
    return NextResponse.json({
      status: 500,
      message: 'Internal server error'
    }, { status: 500 });
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
    
    const { id, title, content } = await request.json();

    if (!id || !title || !content) {
      return NextResponse.json({
        status: 400,
        message: 'ID, title and content are required'
      }, { status: 400 });
    }

    const about = await prisma.about.update({
      where: { id },
      data: {
        title,
        content,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      status: 200,
      data: about,
      message: 'About content updated successfully'
    });
  } catch (error) {
    console.error('Error updating about:', error);
    return NextResponse.json({
      status: 500,
      message: 'Internal server error'
    }, { status: 500 });
  }
}