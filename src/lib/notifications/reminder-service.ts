import { prisma } from "@/lib/prisma"
import { RealtimeNotificationService } from "./realtime-service"

interface CreateReminderNotificationParams {
  userId: string
  dishId: string
  dishName: string
  reminderType: 'immediate' | 'scheduled'
  scheduledTime?: Date
}

export class ReminderNotificationService {
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

      await RealtimeNotificationService.sendReminderNotification({
        id: notification.id,
        userId,
        dishId,
        dishName,
        message: notification.message,
        type: 'reminder',
        scheduledTime
      })

      return notification
    } catch (error) {
      console.error('Error creating reminder notification:', error)
      throw error
    }
  }

  static async processScheduledReminders() {
    try {
      const now = new Date()

      const reminders = await prisma.reminder.findMany({
        where: {
          isActive: true,
          OR: [
            { isRecurring: false, reminderTime: { lte: now } },
            {
              isRecurring: true,
              recurringDays: {
                has: now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
              }
            }
          ]
        },
        include: {
          dish: { select: { name: true, timings: true } },
          user: { select: { id: true } }
        }
      })

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
