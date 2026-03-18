import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updates = await request.json();
    const resolvedParams = await params;
    const productId = resolvedParams.id;

    // Verify product ownership
    const dish = await prisma.dish.findFirst({
      where: {
        id: productId,
        shop: {
          ownerId: session.user.id,
        },
      },
    });

    if (!dish) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Update the product
    const updatedDish = await prisma.dish.update({
      where: { id: productId },
      data: {
        ...(updates.price !== undefined && { price: updates.price }),
        ...(updates.quantity !== undefined && { quantity: updates.quantity }),
        ...(updates.isOutOfStock !== undefined && { isOutOfStock: updates.isOutOfStock }),
        ...(updates.isMarketingEnabled !== undefined && { isMarketingEnabled: updates.isMarketingEnabled }),
      },
    });

    return NextResponse.json(updatedDish);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}