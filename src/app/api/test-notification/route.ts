import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendPushNotification } from '@/lib/push-notifications';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, message } = await req.json();

    // Get FCM token based on user role
    let fcmToken: string | null = null;
    
    if (session.user.role === 'owner') {
      const owner = await prisma.owner.findUnique({
        where: { id: session.user.id },
        select: { fcmToken: true }
      });
      fcmToken = owner?.fcmToken || null;
    } else {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { fcmToken: true }
      });
      fcmToken = user?.fcmToken || null;
    }

    if (!fcmToken) {
      return NextResponse.json({ error: 'No FCM token found' }, { status: 400 });
    }

    // Send push notification
    await sendPushNotification(
      fcmToken,
      title || 'Test Notification',
      message || 'This is a test notification',
      { type: 'test', timestamp: new Date().toISOString() }
    );

    return NextResponse.json({ success: true, message: 'Notification sent' });
  } catch (error) {
    console.error('Test notification error:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
