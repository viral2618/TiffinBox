"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications';

interface RealtimeContextType {
  notifications: any[];
  isConnected: boolean;
  clearNotifications: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { notifications, isConnected, clearNotifications } = useRealtimeNotifications();

  return (
    <RealtimeContext.Provider value={{ notifications, isConnected, clearNotifications }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within RealtimeProvider');
  }
  return context;
}