import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// Get user's saved location
export async function GET(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id as string;
    
    // Get user with location
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { location: true }
    });
    
    if (!user || !user.location) {
      return NextResponse.json(
        { error: "No saved location found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ location: user.location });
  } catch (error) {
    console.error("Error fetching user location:", error);
    return NextResponse.json(
      { error: "Failed to fetch user location" },
      { status: 500 }
    );
  }
}

// Update user's location
export async function PUT(req: NextRequest) {
  try {
    const { lat, lng } = await req.json();
    
    // Validate coordinates
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json(
        { error: "Invalid coordinates" },
        { status: 400 }
      );
    }
    
    // Get user session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id as string;
    
    // Update user's location
    await prisma.user.update({
      where: { id: userId },
      data: {
        location: {
          lat,
          lng
        }
      }
    });
    
    return NextResponse.json({ 
      success: true,
      location: { lat, lng }
    });
  } catch (error) {
    console.error("Error updating user location:", error);
    return NextResponse.json(
      { error: "Failed to update user location" },
      { status: 500 }
    );
  }
}