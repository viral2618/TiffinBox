import { prisma } from "@/lib/prisma"
import { sendPushNotification } from "@/lib/push-notifications"
import { RealtimeNotificationService } from "./realtime-service"

interface CreateReminderNotificationParams {
  userId: string
  dishId: string
  dishName: string
  reminderType: 'immediate' | 'scheduled'
  scheduledTime?: Date
}

export class ReminderNotificationService {
  /**
   * Creates a reminder notification in the database
   */
  static async createReminderNotification({
    userId,
    dishId,
    dishName,
    reminderType,
    scheduledTime
  }: CreateReminderNotificationParams) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          title: "Dish Reminder",
          message: reminderType === 'immediate' 
            ? `${dishName} is available now!`
            : `Reminder: ${dishName} will be available soon`,
          type: "reminder",
          isRead: false,
        }
      })

      // Get user's FCM token for push notification
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { fcmToken: true }
      })

      // Send realtime notification
      await RealtimeNotificationService.sendReminderNotification({
        id: notification.id,
        userId,
        dishId,
        dishName,
        message: notification.message,
        type: 'reminder',
        scheduledTime
      })

      // Send push notification if user has FCM token
      if (user?.fcmToken) {
        await sendPushNotification(
          user.fcmToken,
          notification.title,
          notification.message
        )
      }

      return notification
    } catch (error) {
      console.error('Error creating reminder notification:', error)
      throw error
    }
  }

  /**
   * Processes scheduled reminders (would be called by a cron job)
   */
  static async processScheduledReminders() {
    try {
      const now = new Date()
      
      // Find active reminders that should be triggered
      const reminders = await prisma.reminder.findMany({
        where: {
          isActive: true,
          OR: [
            // One-time reminders
            {
              isRecurring: false,
              reminderTime: {
                lte: now
              }
            },
            // Recurring reminders (simplified logic)
            {
              isRecurring: true,
              recurringDays: {
                has: now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
              }
            }
          ]
        },
        include: {
          dish: {
            select: {
              name: true,
              timings: true
            }
          },
          user: {
            select: {
              id: true,
              fcmToken: true
            }
          }
        }
      })

      // Process each reminder
      for (const reminder of reminders) {
        await RealtimeNotificationService.sendReminderNotification({
          id: reminder.id,
          userId: reminder.userId,
          dishId: reminder.dishId,
          dishName: reminder.dish.name,
          message: `${reminder.dish.name} is available now!`,
          type: 'reminder',
          scheduledTime: reminder.reminderTime || undefined
        })

        // Deactivate one-time reminders after triggering
        if (!reminder.isRecurring) {
          await prisma.reminder.update({
            where: { id: reminder.id },
            data: { isActive: false }
          })
        }
      }

      return reminders.length
    } catch (error) {
      console.error('Error processing scheduled reminders:', error)
      throw error
    }
  }
}