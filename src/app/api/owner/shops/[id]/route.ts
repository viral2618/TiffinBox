import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { isOpen, name, description, address, contactPhone, whatsapp, coordinates } = body;
    const resolvedParams = await params;
    const shopId = resolvedParams.id;
    const ownerId = session.user.id;

    // Verify shop ownership
    const shop = await prisma.shop.findFirst({
      where: {
        id: shopId,
        ownerId: ownerId
      }
    });

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    // Build update data object
    const updateData: any = {};
    if (isOpen !== undefined) updateData.isOpen = isOpen;
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (address) updateData.address = address;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (coordinates && coordinates.lat && coordinates.lng) {
      updateData.coordinates = { lat: coordinates.lat, lng: coordinates.lng };
    }

    // Update shop
    const updatedShop = await prisma.shop.update({
      where: { id: shopId },
      data: updateData
    });

    return NextResponse.json(updatedShop);
  } catch (error) {
    console.error('Error updating shop:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}