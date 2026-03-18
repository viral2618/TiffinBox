import { NextRequest, NextResponse } from 'next/server';
import { RealtimeNotificationService } from '@/lib/notifications/realtime-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, dishId, dishName, message, type = 'reminder' } = body;

    if (!userId || !dishId || !dishName || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const notification = await RealtimeNotificationService.sendReminderNotification({
      id: `${Date.now()}`,
      userId,
      dishId,
      dishName,
      message,
      type,
    });

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error('Error triggering reminder:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}