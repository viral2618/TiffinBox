import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import DishNotificationService from '@/lib/services/dish-notification.service';
import { SocketServer } from '@/lib/socket-server';

// GET owner notifications
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'owner') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const page = parseInt(url.searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true';

    // Build where clause
    const where = {
      ownerId: session.user.id,
      ...(unreadOnly ? { isRead: false } : {}),
    };

    // Get owner's notifications
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const totalCount = await prisma.notification.count({ where });

    return NextResponse.json({
      notifications,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// Create a new notification
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, message, type } = await req.json();

    if (!title || !message || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        ownerId: session.user.id,
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// Mark notifications as read
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'owner') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { ids, all } = await req.json();

    if (all) {
      // Mark all notifications as read using service
      await DishNotificationService.markNotificationsAsRead(session.user.id);
      
      // Emit real-time update
      await SocketServer.emitToOwner(session.user.id, 'notification-read', { all: true });
      
      return NextResponse.json({ message: 'All notifications marked as read' });
    } else if (ids && ids.length > 0) {
      // Mark specific notifications as read using service
      await DishNotificationService.markNotificationsAsRead(session.user.id, ids);
      
      // Emit real-time update
      await SocketServer.emitToOwner(session.user.id, 'notification-read', { ids });
      
      return NextResponse.json({ message: 'Notifications marked as read' });
    } else {
      return NextResponse.json(
        { error: 'No notifications specified' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}