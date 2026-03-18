import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fcmToken, deviceInfo } = await req.json();

    if (!fcmToken) {
      return NextResponse.json({ error: 'Missing fcmToken' }, { status: 400 });
    }

    // Save to DeviceToken table for multi-device support
    await prisma.deviceToken.upsert({
      where: { token: fcmToken },
      update: { 
        lastUsed: new Date(),
        deviceInfo,
        userId: session.user.id,
        ownerId: null // Clear ownerId if it was previously an owner token
      },
      create: { 
        token: fcmToken,
        userId: session.user.id,
        deviceInfo
      },
    });

    console.log('✅ FCM token saved to DeviceToken table for user:', session.user.id);

    return NextResponse.json({ message: 'FCM token updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating FCM token:', error);
    return NextResponse.json({ error: 'Failed to update FCM token' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}