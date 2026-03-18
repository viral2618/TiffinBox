import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/push-notifications';
import { SocketServer } from '@/lib/socket-server';
import { redis } from '@/lib/redis';
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

/**
 * Production-grade notification service for dish stage tracking
 * Designed for BullMQ and Redis integration
 */
export class DishNotificationService {
  private static readonly NOTIFICATION_TYPES = {
    STAGE_UPDATE: 'dish_stage',
    READY: 'dish_ready', 
    DELAYED: 'dish_delayed',
    URGENT: 'dish_urgent'
  } as const;

  /**
   * Create stage notification when dish status changes
   */
  static async createStageNotification(
    ownerId: string,
    orderItem: any,
    previousStage?: OrderStatus
  ): Promise<void> {
    try {
      const notification = await this.buildNotificationPayload(orderItem, previousStage);
      
      // Store notification in database
      const dbNotification = await prisma.notification.create({
        data: {
          ownerId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          isRead: false,
        }
      });

      // Send real-time notification via Socket.IO
      await this.emitRealtimeNotification(ownerId, {
        ...dbNotification,
        data: notification.data
      });

      // Send push notification if owner has FCM token
      await this.sendPushNotificationToOwner(ownerId, notification);

      // Future: Queue for BullMQ processing
      // await this.queueNotification(notification);

    } catch (error) {
      console.error('Error creating stage notification:', error);
      throw error;
    }
  }

  /**
   * Create urgent notification for time-sensitive orders
   */
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

      // Send real-time notification via Socket.IO
      await this.emitRealtimeNotification(ownerId, {
        ...dbNotification,
        data: notification.data
      });

      await this.sendPushNotificationToOwner(ownerId, notification);

    } catch (error) {
      console.error('Error creating urgent notification:', error);
      throw error;
    }
  }

  /**
   * Create delay notification when order is delayed
   */
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

      // Send real-time notification via Socket.IO
      await this.emitRealtimeNotification(ownerId, {
        ...dbNotification,
        data: notification.data
      });

      await this.sendPushNotificationToOwner(ownerId, notification);

    } catch (error) {
      console.error('Error creating delay notification:', error);
      throw error;
    }
  }

  /**
   * Build notification payload based on order status
   */
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

  /**
   * Generate stage-specific messages
   */
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

  /**
   * Generate urgent notification messages
   */
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

  /**
   * Send push notification to owner
   */
  private static async sendPushNotificationToOwner(
    ownerId: string,
    notification: NotificationPayload
  ): Promise<void> {
    try {
      const owner = await prisma.owner.findUnique({
        where: { id: ownerId },
        select: { fcmToken: true }
      });

      if (owner?.fcmToken) {
        await sendPushNotification(
          owner.fcmToken,
          notification.title,
          notification.message,
          notification.data
        );
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
      // Don't throw - notification should still be stored even if push fails
    }
  }

  /**
   * Get notification statistics for dashboard
   */
  static async getNotificationStats(ownerId: string): Promise<{
    unreadCount: number;
    urgentCount: number;
    todayCount: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [unreadCount, urgentCount, todayCount] = await Promise.all([
      prisma.notification.count({
        where: { ownerId, isRead: false }
      }),
      prisma.notification.count({
        where: { 
          ownerId, 
          type: this.NOTIFICATION_TYPES.URGENT,
          isRead: false 
        }
      }),
      prisma.notification.count({
        where: { 
          ownerId, 
          createdAt: { gte: today }
        }
      })
    ]);

    return { unreadCount, urgentCount, todayCount };
  }

  /**
   * Mark notifications as read
   */
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

    // Update cache as well
    await OwnerNotificationCache.markCachedAsRead(ownerId, notificationIds);
  }

  /**
   * Future: Queue notification for BullMQ processing
   * This method is prepared for Redis/BullMQ integration
   */
  private static async queueNotification(notification: NotificationPayload): Promise<void> {
    // TODO: Implement BullMQ queue
    // const queue = getNotificationQueue();
    // await queue.add('process-notification', notification, {
    //   priority: notification.type === 'dish_urgent' ? 10 : 5,
    //   delay: 0,
    //   attempts: 3,
    //   backoff: 'exponential'
    // });
  }

  /**
   * Emit real-time notification via Socket.IO and cache in Redis
   */
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

      // Emit via Socket.IO
      await SocketServer.emitToOwner(ownerId, 'dish-notification', realtimePayload);

      // Cache in Redis for offline users
      await OwnerNotificationCache.cacheNotification(ownerId, realtimePayload);
    } catch (error) {
      console.error('Error emitting realtime notification:', error);
    }
  }

  /**
   * Future: Process queued notifications
   * This method will be called by BullMQ workers
   */
  static async processQueuedNotification(notification: NotificationPayload): Promise<void> {
    // TODO: Implement notification processing logic
    // This could include:
    // - Batch processing
    // - Rate limiting
    // - Delivery confirmation
    // - Retry logic
  }
}

export default DishNotificationService;