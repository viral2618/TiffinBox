import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { OwnerNotificationCache } from '@/lib/notifications/owner-notification-cache';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ownerId = session.user.id;
    if (!ownerId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }
    
    const cachedNotifications = await OwnerNotificationCache.getCachedNotifications(ownerId);
    const unreadCount = await OwnerNotificationCache.getCachedUnreadCount(ownerId);

    return NextResponse.json({
      notifications: cachedNotifications,
      unreadCount,
      cached: true
    });
  } catch (error) {
    console.error('Error fetching cached notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}