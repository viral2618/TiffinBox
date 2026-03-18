"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { useOwnerRealtimeNotifications } from './use-owner-realtime-notifications';

interface DishNotification {
  id: string;
  title: string;
  message: string;
  type: 'dish_stage' | 'dish_ready' | 'dish_delayed' | 'dish_urgent';
  isRead: boolean;
  createdAt: string;
  data?: {
    orderId: string;
    dishId: string;
    stage: string;
    priority: string;
  };
}

interface NotificationStats {
  unreadCount: number;
  urgentCount: number;
  todayCount: number;
}

/**
 * Hook for managing dish stage notifications for owners
 * Provides real-time updates and notification management
 */
export function useDishNotifications() {
  const { session, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<DishNotification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    unreadCount: 0,
    urgentCount: 0,
    todayCount: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = session?.user?.role === 'owner';
  const {
    notifications: realtimeNotifications,
    unreadCount: realtimeUnreadCount,
    markAsReadLocally,
    isConnected
  } = useOwnerRealtimeNotifications();

  const fetchNotifications = useCallback(async (limit = 20) => {
    if (!isAuthenticated || !isOwner) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/owner/notifications?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      
      // Fallback to cached notifications if API fails
      try {
        const cachedResponse = await fetch('/api/owner/notifications/cached');
        if (cachedResponse.ok) {
          const cachedData = await cachedResponse.json();
          setNotifications(cachedData.notifications || []);
          setError('Using cached data (offline mode)');
        }
      } catch (cacheErr) {
        console.warn('Failed to fetch cached notifications:', cacheErr);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isOwner]);

  const fetchStats = useCallback(async () => {
    if (!isAuthenticated || !isOwner) return;
    
    try {
      const response = await fetch('/api/owner/notifications/stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch notification stats');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching notification stats:', err);
    }
  }, [isAuthenticated, isOwner]);

  const markAsRead = useCallback(async (notificationIds?: string[]) => {
    if (!isAuthenticated || !isOwner) return;
    
    try {
      const response = await fetch('/api/owner/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationIds ? { ids: notificationIds } : { all: true }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notifications as read');
      }
      
      // Update local state
      if (notificationIds) {
        setNotifications(prev => 
          prev.map(notification => 
            notificationIds.includes(notification.id) 
              ? { ...notification, isRead: true } 
              : notification
          )
        );
      } else {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        );
      }
      
      // Update real-time notifications locally
      markAsReadLocally(notificationIds);
      
      // Refresh stats
      fetchStats();
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  }, [isAuthenticated, isOwner, fetchStats, markAsReadLocally]);

  const getUrgentNotifications = useCallback(() => {
    return notifications.filter(n => n.type === 'dish_urgent' && !n.isRead);
  }, [notifications]);

  const getReadyNotifications = useCallback(() => {
    return notifications.filter(n => n.type === 'dish_ready' && !n.isRead);
  }, [notifications]);

  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.isRead);
  }, [notifications]);

  // Merge real-time notifications with fetched notifications
  useEffect(() => {
    if (realtimeNotifications.length > 0) {
      setNotifications(prev => {
        const existingIds = new Set(prev.map(n => n.id));
        const newNotifications = realtimeNotifications.filter(n => !existingIds.has(n.id));
        return [...newNotifications, ...prev];
      });
    }
  }, [realtimeNotifications]);

  // Update stats with real-time unread count
  useEffect(() => {
    if (isConnected && realtimeUnreadCount > 0) {
      setStats(prev => ({
        ...prev,
        unreadCount: Math.max(prev.unreadCount, realtimeUnreadCount)
      }));
    }
  }, [realtimeUnreadCount, isConnected]);

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated && isOwner) {
      fetchNotifications();
      fetchStats();
    }
  }, [isAuthenticated, isOwner, fetchNotifications, fetchStats]);

  // Listen for order status changes to refresh notifications
  useEffect(() => {
    const handleOrderUpdate = () => {
      // Refresh notifications when orders are updated
      setTimeout(() => {
        fetchNotifications();
        fetchStats();
      }, 1000); // Small delay to ensure backend processing is complete
    };

    window.addEventListener('orderStatusUpdated', handleOrderUpdate);
    return () => window.removeEventListener('orderStatusUpdated', handleOrderUpdate);
  }, [fetchNotifications, fetchStats]);

  return {
    notifications,
    stats,
    loading,
    error,
    fetchNotifications,
    fetchStats,
    markAsRead,
    getUrgentNotifications,
    getReadyNotifications,
    getUnreadNotifications,
    isOwner,
    isConnected
  };
}

export default useDishNotifications;