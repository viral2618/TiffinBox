import { prisma } from '@/lib/prisma';
import { SocketServer } from '@/lib/socket-server';
import { OwnerNotificationCache } from '@/lib/notifications/owner-notification-cache';
import { OrderStatus, OrderPriority } from '@prisma/client';

export interface DishStageNotification {
  id: string;
  dishId: string;
  dishName: string;
  orderId: string;
  stage: OrderStatus;
  previousStage?: OrderStatus;
  estimatedCompletion?: Date;
  isDelayed: boolean;
  delayReason?: string;
  priority: OrderPriority;
  timestamp: Date;
}

export interface NotificationPayload {
  title: string;
  message: string;
  type: 'dish_stage' | 'dish_ready' | 'dish_delayed' | 'dish_urgent';
  data: {
    orderId: string;
    dishId: string;
    stage: OrderStatus;
    priority: OrderPriority;
  };
}

export class DishNotificationService {
  private static readonly NOTIFICATION_TYPES = {
    STAGE_UPDATE: 'dish_stage',
    READY: 'dish_ready',
    DELAYED: 'dish_delayed',
    URGENT: 'dish_urgent'
  } as const;

  static async createStageNotification(
    ownerId: string,
    orderItem: any,
    previousStage?: OrderStatus
  ): Promise<void> {
    try {
      const notification = await this.buildNotificationPayload(orderItem, previousStage);

      const dbNotification = await prisma.notification.create({
        data: {
          ownerId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          isRead: false,
        }
      });

      await this.emitRealtimeNotification(ownerId, {
        ...dbNotification,
        data: notification.data
      });
    } catch (error) {
      console.error('Error creating stage notification:', error);
      throw error;
    }
  }

  static async createUrgentNotification(
    ownerId: string,
    orderItem: any,
    reason: 'behind_schedule' | 'high_priority' | 'customer_waiting'
  ): Promise<void> {
    try {
      const notification: NotificationPayload = {
        title: '🚨 Urgent Order Alert',
        message: this.getUrgentMessage(orderItem.dish.name, reason),
        type: this.NOTIFICATION_TYPES.URGENT,
        data: {
          orderId: orderItem.id,
          dishId: orderItem.dishId,
          stage: orderItem.status,
          priority: orderItem.priority
        }
      };

      const dbNotification = await prisma.notification.create({
        data: {
          ownerId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          isRead: false,
        }
      });

      await this.emitRealtimeNotification(ownerId, {
        ...dbNotification,
        data: notification.data
      });
    } catch (error) {
      console.error('Error creating urgent notification:', error);
      throw error;
    }
  }

  static async createDelayNotification(
    ownerId: string,
    orderItem: any,
    delayReason: string,
    delayMinutes: number
  ): Promise<void> {
    try {
      const notification: NotificationPayload = {
        title: '⏰ Order Delayed',
        message: `${orderItem.dish.name} delayed by ${delayMinutes} minutes. Reason: ${delayReason}`,
        type: this.NOTIFICATION_TYPES.DELAYED,
        data: {
          orderId: orderItem.id,
          dishId: orderItem.dishId,
          stage: orderItem.status,
          priority: orderItem.priority
        }
      };

      const dbNotification = await prisma.notification.create({
        data: {
          ownerId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          isRead: false,
        }
      });

      await this.emitRealtimeNotification(ownerId, {
        ...dbNotification,
        data: notification.data
      });
    } catch (error) {
      console.error('Error creating delay notification:', error);
      throw error;
    }
  }

  private static buildNotificationPayload(
    orderItem: any,
    previousStage?: OrderStatus
  ): NotificationPayload {
    const dishName = orderItem.dish.name;
    const stage = orderItem.status;
    const isReady = stage === OrderStatus.READY;

    return {
      title: isReady ? '✅ Dish Ready!' : '📋 Stage Update',
      message: this.getStageMessage(dishName, stage, previousStage),
      type: isReady ? this.NOTIFICATION_TYPES.READY : this.NOTIFICATION_TYPES.STAGE_UPDATE,
      data: {
        orderId: orderItem.id,
        dishId: orderItem.dishId,
        stage,
        priority: orderItem.priority
      }
    };
  }

  private static getStageMessage(
    dishName: string,
    stage: OrderStatus,
    previousStage?: OrderStatus
  ): string {
    const stageMessages = {
      [OrderStatus.QUEUED]: `${dishName} is queued for preparation`,
      [OrderStatus.PREP]: `${dishName} preparation started`,
      [OrderStatus.BAKING]: `${dishName} is now baking`,
      [OrderStatus.COOLING]: `${dishName} is cooling down`,
      [OrderStatus.READY]: `${dishName} is ready to serve!`,
      [OrderStatus.SERVED]: `${dishName} has been served`,
      [OrderStatus.CANCELLED]: `${dishName} order was cancelled`
    };

    return stageMessages[stage] || `${dishName} status updated to ${stage}`;
  }

  private static getUrgentMessage(
    dishName: string,
    reason: 'behind_schedule' | 'high_priority' | 'customer_waiting'
  ): string {
    const urgentMessages = {
      behind_schedule: `${dishName} is behind schedule and needs immediate attention`,
      high_priority: `High priority order: ${dishName} requires urgent processing`,
      customer_waiting: `Customer is waiting for ${dishName} - please prioritize`
    };

    return urgentMessages[reason];
  }

  static async getNotificationStats(ownerId: string): Promise<{
    unreadCount: number;
    urgentCount: number;
    todayCount: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [unreadCount, urgentCount, todayCount] = await Promise.all([
      prisma.notification.count({ where: { ownerId, isRead: false } }),
      prisma.notification.count({
        where: { ownerId, type: this.NOTIFICATION_TYPES.URGENT, isRead: false }
      }),
      prisma.notification.count({ where: { ownerId, createdAt: { gte: today } } })
    ]);

    return { unreadCount, urgentCount, todayCount };
  }

  static async markNotificationsAsRead(
    ownerId: string,
    notificationIds?: string[]
  ): Promise<void> {
    const whereClause = notificationIds
      ? { ownerId, id: { in: notificationIds } }
      : { ownerId, isRead: false };

    await prisma.notification.updateMany({
      where: whereClause,
      data: { isRead: true }
    });

    await OwnerNotificationCache.markCachedAsRead(ownerId, notificationIds);
  }

  private static async emitRealtimeNotification(
    ownerId: string,
    notification: any
  ): Promise<void> {
    try {
      const realtimePayload = {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        data: notification.data,
        createdAt: notification.createdAt,
        isRead: notification.isRead
      };

      await SocketServer.emitToOwner(ownerId, 'dish-notification', realtimePayload);
      await OwnerNotificationCache.cacheNotification(ownerId, realtimePayload);
    } catch (error) {
      console.error('Error emitting realtime notification:', error);
    }
  }

  static async processQueuedNotification(notification: NotificationPayload): Promise<void> {
    // TODO: Implement notification processing logic
  }
}

export default DishNotificationService;
