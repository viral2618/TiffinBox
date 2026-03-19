import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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
    
    // Fetch the shop with the given ID
    const shop = await prisma.shop.findUnique({
      where: {
        id,
        ownerId // Ensure the shop belongs to the authenticated owner
      },
      include: {
        shopTags: {
          include: {
            tag: true
          }
        }
      }
    });
    
    // If shop not found or doesn't belong to the owner
    if (!shop) {
      return NextResponse.json(
        { error: "Shop not found" },
        { status: 404 }
      );
    }
    
    // Return the shop details
    return NextResponse.json({ shop });
  } catch (error) {
    console.error("Error fetching shop details:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await req.json();
    
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
    
    // Check if the shop exists and belongs to the owner
    const existingShop = await prisma.shop.findUnique({
      where: {
        id,
        ownerId
      }
    });
    
    if (!existingShop) {
      return NextResponse.json(
        { error: "Shop not found or you don't have permission to update it" },
        { status: 404 }
      );
    }
    
    // Extract fields from the request data
    const { 
      name, 
      description, 
      address, 
      contactPhone,
      contactPhone2,
      contactPhone3,
      whatsapp, 
      establishedYear,
      openingHours,
      logoUrl,
      bannerImage,
      imageUrls
    } = data;
    
    // Prepare update data
    const updateData: any = {};
    
    // Only include fields that are provided
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (address !== undefined) updateData.address = address;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
    if (contactPhone2 !== undefined) updateData.contactPhone2 = contactPhone2;
    if (contactPhone3 !== undefined) updateData.contactPhone3 = contactPhone3;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (establishedYear !== undefined) updateData.establishedYear = establishedYear;
    if (openingHours !== undefined) updateData.openingHours = openingHours;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (bannerImage !== undefined) updateData.bannerImage = bannerImage;
    if (imageUrls !== undefined) updateData.imageUrls = imageUrls;
    
    // Update the shop
    const updatedShop = await prisma.shop.update({
      where: {
        id
      },
      data: updateData
    });
    
    return NextResponse.json({
      message: "Shop updated successfully",
      shop: updatedShop
    });
  } catch (error) {
    console.error("Error updating shop:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}