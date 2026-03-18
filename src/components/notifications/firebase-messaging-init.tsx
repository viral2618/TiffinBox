"use client";

import { useEffect } from 'react';
import { initializeForegroundMessaging } from '@/lib/firebase';

export default function FirebaseMessagingInit() {
  useEffect(() => {
    initializeForegroundMessaging();
  }, []);

  return null;
}
