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

    const { day, field, value } = await request.json();
    const resolvedParams = await params;
    const shopId = resolvedParams.id;

    // Verify shop ownership
    const shop = await prisma.shop.findFirst({
      where: {
        id: shopId,
        ownerId: session.user.id,
      },
    });

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    // Get current schedule or create default
    let currentSchedule = shop.schedule ? JSON.parse(shop.schedule as string) : {
      monday: { isOpen: false, openTime: "09:00", closeTime: "17:00" },
      tuesday: { isOpen: false, openTime: "09:00", closeTime: "17:00" },
      wednesday: { isOpen: false, openTime: "09:00", closeTime: "17:00" },
      thursday: { isOpen: false, openTime: "09:00", closeTime: "17:00" },
      friday: { isOpen: false, openTime: "09:00", closeTime: "17:00" },
      saturday: { isOpen: false, openTime: "09:00", closeTime: "17:00" },
      sunday: { isOpen: false, openTime: "09:00", closeTime: "17:00" },
    };

    // Update the specific day and field
    if (!currentSchedule[day]) {
      currentSchedule[day] = { isOpen: false, openTime: "09:00", closeTime: "17:00" };
    }
    currentSchedule[day][field] = value;

    // Update in database
    await prisma.shop.update({
      where: { id: shopId },
      data: {
        schedule: JSON.stringify(currentSchedule),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}