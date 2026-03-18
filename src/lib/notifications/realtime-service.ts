import { SocketServer } from '../socket-server';
import { redis } from '../redis';
import { prisma } from '../prisma';

interface ReminderNotification {
  id: string;
  userId: string;
  dishId: string;
  dishName: string;
  message: string;
  type: 'reminder';
  scheduledTime?: Date;
}

export class RealtimeNotificationService {
  static async sendReminderNotification(notification: ReminderNotification) {
    try {
      // Store in database
      const dbNotification = await prisma.notification.create({
        data: {
          userId: notification.userId,
          title: 'Dish Reminder',
          message: notification.message,
          type: 'reminder',
          isRead: false,
        }
      });

      // Send via Socket.IO
      await SocketServer.emitToUser(notification.userId, 'reminder-notification', {
        id: dbNotification.id,
        title: dbNotification.title,
        message: dbNotification.message,
        dishId: notification.dishId,
        dishName: notification.dishName,
        createdAt: dbNotification.createdAt,
      });

      // Try to cache in Redis (fail silently if Redis is unavailable)
      if (redis) {
        try {
          await redis.lpush(
            `user:${notification.userId}:notifications`,
            JSON.stringify({
              id: dbNotification.id,
              title: dbNotification.title,
              message: dbNotification.message,
              dishId: notification.dishId,
              dishName: notification.dishName,
              createdAt: dbNotification.createdAt,
            })
          );
          await redis.ltrim(`user:${notification.userId}:notifications`, 0, 49);
        } catch (redisError) {
          console.warn('Redis caching failed, continuing without cache:', redisError instanceof Error ? redisError.message : String(redisError));
        }
      }

      return dbNotification;
    } catch (error) {
      console.error('Error sending realtime notification:', error);
      throw error;
    }
  }

  static async scheduleReminder(userId: string, dishId: string, reminderTime: Date) {
    if (!redis) return;
    
    try {
      const key = `reminder:${userId}:${dishId}:${reminderTime.getTime()}`;
      const delay = reminderTime.getTime() - Date.now();

      if (delay > 0) {
        await redis.setex(key, Math.ceil(delay / 1000), JSON.stringify({
          userId,
          dishId,
          reminderTime: reminderTime.toISOString(),
        }));
      }
    } catch (error) {
      console.warn('Redis scheduling failed, using database only:', error instanceof Error ? error.message : String(error));
    }
  }

  static async processScheduledReminders() {
    try {
      // Get all active reminders from database that are due
      const dueReminders = await prisma.reminder.findMany({
        where: {
          isActive: true,
          reminderTime: {
            lte: new Date()
          }
        },
        include: {
          dish: true,
          user: true
        }
      });

      for (const reminder of dueReminders) {
        // Send notification
        await this.sendReminderNotification({
          id: reminder.id,
          userId: reminder.userId,
          dishId: reminder.dishId,
          dishName: reminder.dish.name,
          message: reminder.message || `Reminder: ${reminder.dish.name} is ready!`,
          type: 'reminder'
        });

        // Deactivate the reminder if it's not recurring
        if (!reminder.isRecurring) {
          await prisma.reminder.update({
            where: { id: reminder.id },
            data: { isActive: false }
          });
        } else {
          // For recurring reminders, calculate next reminder time
          // This is a simplified implementation - you might want to make it more sophisticated
          const nextReminderTime = new Date(reminder.reminderTime!);
          nextReminderTime.setDate(nextReminderTime.getDate() + 1); // Next day for simplicity
          
          await prisma.reminder.update({
            where: { id: reminder.id },
            data: { reminderTime: nextReminderTime }
          });
        }
      }
    } catch (error) {
      console.error('Error processing scheduled reminders:', error);
    }
  }
}