"use client";

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './use-auth';
import { toast } from 'sonner';

interface RealtimeNotification {
  id: string;
  title: string;
  message: string;
  dishId?: string;
  dishName?: string;
  createdAt: string;
}

export function useRealtimeNotifications() {
  const { session, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const connectSocket = useCallback(() => {
    if (!isAuthenticated || !session?.user?.id) return;

    const newSocket = io({
      path: '/api/socket/io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join-user', session.user.id);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('reminder-notification', (notification: RealtimeNotification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 49)]);
      toast.success(notification.title, {
        description: notification.message,
        duration: 5000,
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, session?.user?.id]);

  useEffect(() => {
    const cleanup = connectSocket();
    return cleanup;
  }, [connectSocket]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    socket,
    notifications,
    isConnected,
    clearNotifications,
  };
}