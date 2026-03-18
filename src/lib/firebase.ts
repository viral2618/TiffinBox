import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
import type { FirebaseApp } from 'firebase/app';

let app: FirebaseApp | undefined;
if (typeof window !== 'undefined') {
  try {
    app = initializeApp(firebaseConfig);
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

// Initialize foreground message handler
export function initializeForegroundMessaging() {
  if (typeof window === 'undefined' || !app) return;
  
  isSupported().then((supported) => {
    if (!supported) return;
    
    const messaging = getMessaging(app!);
    
    onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      
      // Don't manually show notification - let service worker handle it
      // This prevents duplicate notifications
    });
  }).catch(console.error);
}

// Get FCM token
export async function getFCMToken() {
  try {
    if (typeof window === 'undefined' || !app) return null;
    
    const isMessagingSupported = await isSupported();
    if (!isMessagingSupported) {
      console.log('Firebase messaging is not supported in this browser');
      return null;
    }
    
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/'
        });
        
        await navigator.serviceWorker.ready;
        
        const messaging = getMessaging(app);
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: registration
          });
          
          console.log('FCM token obtained successfully');
          return token;
        } else {
          console.log('Notification permission denied');
          return null;
        }
      } catch (swError) {
        console.error('Service worker registration failed:', swError);
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error('Error in getFCMToken:', error);
    return null;
  }
}