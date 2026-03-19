import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { cache } from '@/lib/cache';
import { RedisScheduler } from '@/lib/notifications/redis-scheduler';



export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { dishId, reminderTime, isRecurring, recurringDays, remindBefore } = await req.json();

  if (!dishId) {
    return NextResponse.json({ error: 'Missing dishId' }, { status: 400 });
  }

  // For recurring reminders, we need days
  if (isRecurring && (!recurringDays || recurringDays.length === 0)) {
    return NextResponse.json({ error: 'Missing recurring days' }, { status: 400 });
  }

  // For non-recurring reminders, we need a specific time
  if (!isRecurring && !reminderTime) {
    return NextResponse.json({ error: 'Missing reminderTime for non-recurring reminder' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get dish details with timing for calculating reminder time
    const dish = await prisma.dish.findUnique({
      where: { id: dishId },
      select: { 
        name: true,
        timings: {
          select: {
            servedFrom: true
          }
        }
      }
    });

    if (!dish) {
      return NextResponse.json({ error: 'Dish not found' }, { status: 404 });
    }

    let calculatedReminderTime: Date | null = null;
    
    if (!isRecurring && reminderTime) {
      calculatedReminderTime = new Date(reminderTime);
    } else if (remindBefore && remindBefore <= 2) {
      // For testing: immediate reminder (1-2 minutes)
      calculatedReminderTime = new Date(Date.now() + remindBefore * 60 * 1000);
    } else if (dish.timings.length > 0) {
      // Calculate reminder time based on dish serving time and remindBefore
      const today = new Date();
      const timing = dish.timings[0];
      const serveTime = new Date(today);
      serveTime.setHours(timing.servedFrom.hour, timing.servedFrom.minute, 0, 0);
      
      // Set reminder time to be remindBefore minutes before serving time
      calculatedReminderTime = new Date(serveTime.getTime() - (remindBefore || 15) * 60 * 1000);
      
      // If calculated time is in the past, set for tomorrow
      if (calculatedReminderTime <= new Date()) {
        calculatedReminderTime.setDate(calculatedReminderTime.getDate() + 1);
      }
    }

    // Create the reminder
    const reminder = await prisma.reminder.create({
      data: {
        dishId,
        userId: session.user.id,
        reminderTime: calculatedReminderTime,
        isRecurring: isRecurring || false,
        recurringDays: recurringDays || [],
        remindBefore: remindBefore || 15,
        message: `Reminder for ${dish.name}`,
        isActive: true
      },
    });

    // Schedule in Redis
    if (calculatedReminderTime) {
      await RedisScheduler.scheduleReminder(
        session.user.id,
        dishId,
        dish.name,
        calculatedReminderTime,
        remindBefore || 15
      );
    }

    // Create notification in database
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: 'Reminder Set!',
        message: isRecurring
          ? `You'll be reminded about ${dish.name} on ${recurringDays.join(', ')}`
          : `Your reminder for ${dish.name} has been set`,
        type: 'reminder',
        isRead: false,
      },
    });

    // Invalidate notification cache to ensure count updates immediately
    cache.invalidatePattern('/api/user/notifications');

    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    console.error('Error creating reminder:', error);
    return NextResponse.json({ error: 'Failed to create reminder' }, { status: 500 });
  }
}