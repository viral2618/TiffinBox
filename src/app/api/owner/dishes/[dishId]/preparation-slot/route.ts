import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Toggle ON - Create new preparation slot
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ dishId: string }> }
) {
  try {
    const { dishId } = await params;

    // Get dish with prep time
    const dish = await prisma.dish.findUnique({
      where: { id: dishId },
      select: { prepTimeMinutes: true }
    });

    if (!dish || !dish.prepTimeMinutes) {
      return NextResponse.json(
        { error: 'Dish not found or prep time not set' },
        { status: 404 }
      );
    }

    const now = new Date();
    const servingStartsAt = new Date(now.getTime() + dish.prepTimeMinutes * 60000);

    // Generate slot ID (date-based with counter)
    const dateStr = now.toISOString().split('T')[0];
    const todaySlots = await prisma.dishPreparationSlot.count({
      where: {
        dishId,
        startedAt: {
          gte: new Date(dateStr + 'T00:00:00Z'),
          lt: new Date(new Date(dateStr).getTime() + 86400000)
        }
      }
    });

    const slotId = `${dateStr}-${String(todaySlots + 1).padStart(2, '0')}`;

    const slot = await prisma.dishPreparationSlot.create({
      data: {
        dishId,
        slotId,
        startedAt: now,
        prepTimeMinutes: dish.prepTimeMinutes,
        servingStartsAt,
        status: 'PREPARING'
      }
    });

    return NextResponse.json({ slot });
  } catch (error) {
    console.error('Error creating preparation slot:', error);
    return NextResponse.json(
      { error: 'Failed to create preparation slot' },
      { status: 500 }
    );
  }
}

// Toggle OFF - Mark current slot as sold out
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ dishId: string }> }
) {
  try {
    const { dishId } = await params;

    // Find active slot
    const activeSlot = await prisma.dishPreparationSlot.findFirst({
      where: {
        dishId,
        status: { in: ['PREPARING', 'SERVING'] }
      },
      orderBy: { startedAt: 'desc' }
    });

    if (!activeSlot) {
      return NextResponse.json(
        { error: 'No active slot found' },
        { status: 404 }
      );
    }

    const updatedSlot = await prisma.dishPreparationSlot.update({
      where: { id: activeSlot.id },
      data: {
        endedAt: new Date(),
        status: 'SOLD_OUT'
      }
    });

    return NextResponse.json({ slot: updatedSlot });
  } catch (error) {
    console.error('Error updating preparation slot:', error);
    return NextResponse.json(
      { error: 'Failed to update preparation slot' },
      { status: 500 }
    );
  }
}

// Get current slot status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dishId: string }> }
) {
  try {
    const { dishId } = await params;

    const activeSlot = await prisma.dishPreparationSlot.findFirst({
      where: {
        dishId,
        status: { in: ['PREPARING', 'SERVING'] }
      },
      orderBy: { startedAt: 'desc' }
    });

    if (!activeSlot) {
      return NextResponse.json({ slot: null, status: 'INACTIVE' });
    }

    // Auto-determine status based on time
    const now = new Date();
    const currentStatus = now >= activeSlot.servingStartsAt ? 'SERVING' : 'PREPARING';

    // Update status if changed
    if (currentStatus !== activeSlot.status) {
      await prisma.dishPreparationSlot.update({
        where: { id: activeSlot.id },
        data: { status: currentStatus }
      });
      activeSlot.status = currentStatus as any;
    }

    return NextResponse.json({ slot: activeSlot, status: currentStatus });
  } catch (error) {
    console.error('Error fetching preparation slot:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preparation slot' },
      { status: 500 }
    );
  }
}
