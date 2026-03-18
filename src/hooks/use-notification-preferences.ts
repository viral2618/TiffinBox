"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';

interface NotificationPreferences {
  general: boolean;
  emailAlerts: boolean;
  notificationAlert: boolean;
}

export function useNotificationPreferences() {
  const { session, status, isAuthenticated } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    general: true,
    emailAlerts: false,
    notificationAlert: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userType = session?.user?.role === 'owner' ? 'owner' : 'user';

  const fetchPreferences = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/${userType}/notification-preferences`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch notification preferences');
      }
      
      const data = await response.json();
      setPreferences({
        general: data.general,
        emailAlerts: data.emailAlerts,
        notificationAlert: data.notificationAlert,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, userType]);

  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedPreferences = { ...preferences, ...newPreferences };
      
      const response = await fetch(`/api/${userType}/notification-preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPreferences),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update notification preferences');
      }
      
      setPreferences(updatedPreferences);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, userType, preferences]);

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchPreferences();
    }
  }, [isAuthenticated, fetchPreferences]);

  return {
    preferences,
    loading,
    error,
    fetchPreferences,
    updatePreferences,
  };
}