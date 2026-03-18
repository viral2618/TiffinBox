import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // Get the authenticated session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an owner
    if (!session || !session.user || session.user.role !== "owner" || !session.user.id) {
      return NextResponse.json(
        { error: "Not authenticated or not authorized" },
        { status: 401 }
      );
    }
    
    const ownerId = session.user.id as string;
    
    // Fetch all shops belonging to the owner
    const shops = await prisma.shop.findMany({
      where: {
        ownerId
      },
      include: {
        shopTags: {
          include: {
            tag: true
          }
        }
      }
    });
    
    // Return the shops
    return NextResponse.json({ shops });
  } catch (error) {
    console.error("Error fetching owner shops:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get the authenticated session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an owner
    if (!session || !session.user || session.user.role !== "owner" || !session.user.id) {
      return NextResponse.json(
        { error: "Not authenticated or not authorized" },
        { status: 401 }
      );
    }
    
    const ownerId = session.user.id as string;
    const data = await req.json();
    
    // Extract shop data including opening hours
    const { name, slug, description, address, coordinates, bannerImage, logoUrl, imageUrls, contactPhone, whatsapp, openingHours } = data;
    
    // Create the shop with opening hours
    const shop = await prisma.shop.create({
      data: {
        name,
        slug,
        description,
        address,
        coordinates,
        bannerImage,
        logoUrl,
        imageUrls: imageUrls || [],
        contactPhone,
        whatsapp,
        openingHours,
        owner: {
          connect: { id: ownerId }
        }
      }
    });
    
    return NextResponse.json({
      message: "Shop created successfully",
      shop
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating shop:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}