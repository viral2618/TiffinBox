import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { withCache } from "@/lib/cache";

const prisma = new PrismaClient();

// GET unread notification count for user
async function getNotificationCountHandler(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'user') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Count unread notifications
    const count = await prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false,
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error counting notifications:', error);
    return NextResponse.json(
      { error: 'Failed to count notifications' },
      { status: 500 }
    );
  }
}

export const GET = withCache(getNotificationCountHandler);