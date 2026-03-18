"use client";

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './use-auth';
import { toast } from 'sonner';

interface OwnerRealtimeNotification {
  id: string;
  title: string;
  message: string;
  type: 'dish_stage' | 'dish_ready' | 'dish_delayed' | 'dish_urgent';
  data?: {
    orderId: string;
    dishId: string;
    stage: string;
    priority: string;
  };
  createdAt: string;
  isRead: boolean;
}

export function useOwnerRealtimeNotifications() {
  const { session, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<OwnerRealtimeNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isOwner = session?.user?.role === 'owner';

  const connectSocket = useCallback(() => {
    if (!isAuthenticated || !isOwner || !session?.user?.id) return;

    const newSocket = io({
      path: '/api/socket/io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join-owner', session.user.id);
      console.log('Owner connected to Socket.IO');
    });

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('Owner disconnected from Socket.IO:', reason);
    });

    newSocket.on('connect_error', (error) => {
      setIsConnected(false);
      console.warn('Socket.IO connection error:', error.message);
    });

    newSocket.on('dish-notification', (notification: OwnerRealtimeNotification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 49)]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification based on type
      const toastConfig = {
        duration: notification.type === 'dish_urgent' ? 10000 : 5000,
      };

      switch (notification.type) {
        case 'dish_urgent':
          toast.error(notification.title, {
            description: notification.message,
            ...toastConfig,
          });
          break;
        case 'dish_ready':
          toast.success(notification.title, {
            description: notification.message,
            ...toastConfig,
          });
          break;
        case 'dish_delayed':
          toast.warning(notification.title, {
            description: notification.message,
            ...toastConfig,
          });
          break;
        default:
          toast.info(notification.title, {
            description: notification.message,
            ...toastConfig,
          });
      }
    });

    newSocket.on('notification-read', (data: { ids?: string[], all?: boolean }) => {
      if (data.all) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      } else if (data.ids) {
        setNotifications(prev => 
          prev.map(n => 
            data.ids!.includes(n.id) ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - data.ids!.length));
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, isOwner, session?.user?.id]);

  useEffect(() => {
    const cleanup = connectSocket();
    return cleanup;
  }, [connectSocket]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const markAsReadLocally = useCallback((notificationIds?: string[]) => {
    if (notificationIds) {
      setNotifications(prev => 
        prev.map(n => 
          notificationIds.includes(n.id) ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
    } else {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    }
  }, []);

  return {
    socket,
    notifications,
    isConnected,
    unreadCount,
    clearNotifications,
    markAsReadLocally,
    isOwner,
  };
}