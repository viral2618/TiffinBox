import { redis } from '../redis';

interface CachedNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  data?: any;
  createdAt: string;
  isRead: boolean;
}

export class OwnerNotificationCache {
  private static readonly CACHE_KEY_PREFIX = 'owner:notifications:';
  private static readonly CACHE_TTL = 86400; // 24 hours
  private static readonly MAX_CACHED_NOTIFICATIONS = 100;

  /**
   * Cache notification for offline users
   */
  static async cacheNotification(ownerId: string, notification: CachedNotification): Promise<void> {
    try {
      if (!redis) {
        console.warn('Redis not available, skipping notification cache');
        return;
      }
      
      const cacheKey = `${this.CACHE_KEY_PREFIX}${ownerId}`;
      
      await redis.lpush(cacheKey, JSON.stringify(notification));
      await redis.ltrim(cacheKey, 0, this.MAX_CACHED_NOTIFICATIONS - 1);
      await redis.expire(cacheKey, this.CACHE_TTL);
      
      console.log(`Cached notification for owner ${ownerId}`);
    } catch (error) {
      console.warn('Failed to cache owner notification:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Get cached notifications for owner
   */
  static async getCachedNotifications(ownerId: string): Promise<CachedNotification[]> {
    try {
      if (!redis) {
        return [];
      }
      
      const cacheKey = `${this.CACHE_KEY_PREFIX}${ownerId}`;
      const cachedData = await redis.lrange(cacheKey, 0, -1);
      
      return cachedData.map(data => JSON.parse(data));
    } catch (error) {
      console.warn('Failed to get cached notifications:', error instanceof Error ? error.message : String(error));
      return [];
    }
  }

  /**
   * Clear cached notifications for owner
   */
  static async clearCache(ownerId: string): Promise<void> {
    try {
      if (!redis) {
        return;
      }
      
      const cacheKey = `${this.CACHE_KEY_PREFIX}${ownerId}`;
      await redis.del(cacheKey);
    } catch (error) {
      console.warn('Failed to clear notification cache:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Mark cached notifications as read
   */
  static async markCachedAsRead(ownerId: string, notificationIds?: string[]): Promise<void> {
    try {
      if (!redis) {
        return;
      }
      
      const cacheKey = `${this.CACHE_KEY_PREFIX}${ownerId}`;
      const cachedData = await redis.lrange(cacheKey, 0, -1);
      
      const updatedNotifications = cachedData.map(data => {
        const notification = JSON.parse(data);
        if (!notificationIds || notificationIds.includes(notification.id)) {
          notification.isRead = true;
        }
        return JSON.stringify(notification);
      });

      // Replace the entire list
      await redis.del(cacheKey);
      if (updatedNotifications.length > 0) {
        await redis.lpush(cacheKey, ...updatedNotifications);
        await redis.expire(cacheKey, this.CACHE_TTL);
      }
    } catch (error) {
      console.warn('Failed to mark cached notifications as read:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Get unread count from cache
   */
  static async getCachedUnreadCount(ownerId: string): Promise<number> {
    try {
      const notifications = await this.getCachedNotifications(ownerId);
      return notifications.filter(n => !n.isRead).length;
    } catch (error) {
      console.warn('Failed to get cached unread count:', error instanceof Error ? error.message : String(error));
      return 0;
    }
  }
}