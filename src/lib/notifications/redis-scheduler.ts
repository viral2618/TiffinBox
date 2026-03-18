import { redis } from '../redis';
import { RealtimeNotificationService } from './realtime-service';

export class RedisScheduler {
  private static intervalId: NodeJS.Timeout | null = null;

  static start() {
    if (!redis) {
      console.log('Redis not available');
      return;
    }
    
    if (this.intervalId) return;

    this.intervalId = setInterval(async () => {
      try {
        await this.processExpiredReminders();
      } catch (error) {
        console.error('Redis scheduler error:', error);
      }
    }, 10000); // Check every 10 seconds

    console.log('Redis scheduler started');
  }

  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  static async scheduleReminder(userId: string, dishId: string, dishName: string, reminderTime: Date, remindBefore: number) {
    if (!redis) return;
    
    try {
      const expireAt = Math.floor(reminderTime.getTime() / 1000);
      const now = Math.floor(Date.now() / 1000);
      
      console.log(`Scheduling reminder: ${dishName}, Time: ${reminderTime.toISOString()}, Score: ${expireAt}, Now: ${now}`);
      
      await redis.zadd('scheduled_reminders', expireAt, JSON.stringify({
        userId,
        dishId,
        dishName,
        reminderTime: reminderTime.toISOString(),
        remindBefore
      }));

      console.log(`Successfully scheduled reminder for ${dishName}`);
    } catch (error) {
      console.warn('Redis scheduling failed:', error instanceof Error ? error.message : String(error));
    }
  }

  private static async processExpiredReminders() {
    if (!redis) return;
    
    try {
      const now = Math.floor(Date.now() / 1000);
      
      const expiredReminders = await redis.zrangebyscore('scheduled_reminders', 0, now);
      
      if (expiredReminders.length === 0) return;

      for (const reminderData of expiredReminders) {
        const reminder = JSON.parse(reminderData);
        console.log(`Processing reminder for ${reminder.dishName} at ${reminder.reminderTime}`);
        
        await RealtimeNotificationService.sendReminderNotification({
          id: `redis_${Date.now()}`,
          userId: reminder.userId,
          dishId: reminder.dishId,
          dishName: reminder.dishName,
          message: `${reminder.dishName} will be ready in ${reminder.remindBefore} minutes!`,
          type: 'reminder',
          scheduledTime: new Date(reminder.reminderTime),
        });

        await redis.zrem('scheduled_reminders', reminderData);
      }

      console.log(`Processed ${expiredReminders.length} expired reminders`);
    } catch (error) {
      console.error('Error processing expired reminders:', error);
    }
  }
}