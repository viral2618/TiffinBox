"use client";

import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useOwnerRealtimeNotifications } from '@/hooks/use-owner-realtime-notifications';
import { useDishNotifications } from '@/hooks/use-dish-notifications';
import { useAuth } from '@/hooks/use-auth';

interface OwnerNotificationContextType {
  // Real-time notifications
  realtimeNotifications: any[];
  isConnected: boolean;
  
  // Combined notifications and stats
  notifications: any[];
  stats: any;
  loading: boolean;
  error: string | null;
  
  // Actions
  markAsRead: (ids?: string[]) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchStats: () => Promise<void>;
  clearNotifications: () => void;
}

const OwnerNotificationContext = createContext<OwnerNotificationContextType | undefined>(undefined);

export function OwnerNotificationProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const isOwner = session?.user?.role === 'owner';
  
  const {
    notifications: realtimeNotifications,
    isConnected,
    clearNotifications
  } = useOwnerRealtimeNotifications();
  
  const {
    notifications,
    stats,
    loading,
    error,
    markAsRead,
    fetchNotifications,
    fetchStats
  } = useDishNotifications();

  // Auto-refresh stats when new real-time notifications arrive
  useEffect(() => {
    if (realtimeNotifications.length > 0 && isConnected) {
      const timeoutId = setTimeout(() => {
        fetchStats();
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
    return undefined;
  }, [realtimeNotifications.length, isConnected, fetchStats]);

  if (!isOwner) {
    return <>{children}</>;
  }

  const contextValue: OwnerNotificationContextType = {
    realtimeNotifications,
    isConnected,
    notifications,
    stats,
    loading,
    error,
    markAsRead,
    fetchNotifications,
    fetchStats,
    clearNotifications,
  };

  return (
    <OwnerNotificationContext.Provider value={contextValue}>
      {children}
    </OwnerNotificationContext.Provider>
  );
}

export function useOwnerNotifications() {
  const context = useContext(OwnerNotificationContext);
  if (!context) {
    throw new Error('useOwnerNotifications must be used within OwnerNotificationProvider');
  }
  return context;
}