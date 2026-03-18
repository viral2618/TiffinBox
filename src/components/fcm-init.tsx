"use client";

import { useFCM } from '@/hooks/use-fcm';

export function FCMInitializer() {
  // This hook handles service worker registration and FCM token
  useFCM();
  
  return null;
}
