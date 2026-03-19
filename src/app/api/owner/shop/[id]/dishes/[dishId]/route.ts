import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Helper function to verify shop ownership
async function verifyShopOwnership(shopId: string, ownerId: string | undefined) {
  if (!ownerId) return false;
  const shop = await prisma.shop.findUnique({
    where: {
      id: shopId,
      ownerId
    },
    select: { id: true }
  });
  
  return shop !== null;
}

export async function GET(
  req: NextRequest,
  {params}: { params: Promise<{ id: string, dishId: string }> }
) {
  try {
    const {id: shopId, dishId} = await params;
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
    
    // Verify shop ownership
    const hasAccess = await verifyShopOwnership(shopId, ownerId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Shop not found" },
        { status: 404 }
      );
    }
    
    // Fetch the dish
    const dish = await prisma.dish.findUnique({
      where: {
        id: dishId,
        shopId
      },
      include: {
        category: true,
        subcategory: true,
        dishTags: {
          include: {
            tag: true
          }
        }
      }
    });
    
    if (!dish) {
      return NextResponse.json(
        { error: "Dish not found" },
        { status: 404 }
      );
    }
    
    // Return the dish
    return NextResponse.json({ dish });
  } catch (error) {
    console.error("Error fetching dish:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}