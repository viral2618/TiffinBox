"use client";

import { useEffect, useState } from 'react';
import { useAuth } from './use-auth';
import { getFCMToken } from '@/lib/firebase';

export const useFCM = () => {
  const { session, isAuthenticated, status } = useAuth();
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeFCM = async () => {
      // Skip FCM if explicitly disabled
      if (process.env.NEXT_PUBLIC_SKIP_FCM === 'true') {
        console.log('FCM is disabled via environment variable');
        return;
      }
      
      if (isAuthenticated && session?.user?.id) {
        try {
          setError(null);
          
          // Get FCM token (service worker registration happens inside)
          const token = await getFCMToken();
          
          if (token) {
            setFcmToken(token);
            
            // Determine which API endpoint to use based on user role
            const endpoint = session.user.role === 'owner' 
              ? '/api/owner/update-fcm-token' 
              : '/api/user/update-fcm-token';
            
            // Update FCM token on server
            try {
              const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fcmToken: token }),
              });
              
              if (!response.ok) {
                console.warn(`FCM token update failed: ${response.status}`);
              } else {
                console.log('FCM token updated successfully on server');
              }
            } catch (fetchError) {
              console.warn('FCM token update request failed:', fetchError);
            }
          } else {
            setError('Failed to get FCM token');
          }
        } catch (error) {
          console.error('Error initializing FCM:', error);
          setError(error instanceof Error ? error.message : 'Unknown FCM error');
        }
      }
    };

    if (status === 'authenticated') {
      initializeFCM();
    }
  }, [isAuthenticated, session?.user?.id, session?.user?.role, status]);

  return { fcmToken, error };
};
