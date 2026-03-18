"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface NotificationsResponse {
  notifications: Notification[];
  pagination: PaginationData;
}

export function useNotifications() {
  const { session, status, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });

  const userType = session?.user?.role === 'owner' ? 'owner' : 'user';

  const fetchNotifications = useCallback(async (page = 1, limit = 10) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/${userType}/notifications?page=${page}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data: NotificationsResponse = await response.json();
      setNotifications(data.notifications);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, userType]);

  const fetchUnreadCount = useCallback(async (bypassCache = false) => {
    if (!isAuthenticated) return;
    
    try {
      const url = bypassCache 
        ? `/api/${userType}/notifications/count?t=${Date.now()}`
        : `/api/${userType}/notifications/count`;
      
      const response = await fetch(url, {
        cache: bypassCache ? 'no-cache' : 'default'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch unread count');
      }
      
      const data = await response.json();
      setUnreadCount(data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [isAuthenticated, userType]);

  const markAsRead = useCallback(async (ids?: string[]) => {
    if (!isAuthenticated) return;
    
    try {
      const response = await fetch(`/api/${userType}/notifications`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ids ? { ids } : { all: true }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notifications as read');
      }
      
      // Update local state
      if (ids) {
        setNotifications(prev => 
          prev.map(notification => 
            ids.includes(notification.id) 
              ? { ...notification, isRead: true } 
              : notification
          )
        );
      } else {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        );
      }
      
      // Refresh unread count
      fetchUnreadCount();
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  }, [isAuthenticated, userType, fetchUnreadCount]);

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

  // Removed polling - now using real-time notifications via Socket.IO

  return {
    notifications,
    unreadCount,
    loading,
    error,
    pagination,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
  };
}