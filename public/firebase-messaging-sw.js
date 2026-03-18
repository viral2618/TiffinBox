importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

try {
  firebase.initializeApp({
    apiKey: "AIzaSyDPavoJpf-ZFSFCuMwe6oxfBGlpB9AqJp0",
    authDomain: "when-fresh.firebaseapp.com",
    projectId: "when-fresh",
    storageBucket: "when-fresh.firebasestorage.app",
    messagingSenderId: "454565914957",
    appId: "1:454565914957:web:46bbafeee76e12327aaf04"
  });

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Background message received:', JSON.stringify(payload, null, 2));
    
    const notificationTitle = payload.notification?.title || 'New Notification';
    const notificationOptions = {
      body: payload.notification?.body || '',
      icon: '/icons/icon-192x192.svg',
      badge: '/icons/icon-72x72.svg',
      tag: payload.data?.notificationId || Date.now().toString(), // Use unique tag to prevent duplicates
      data: payload.data,
      requireInteraction: false,
      vibrate: [200, 100, 200]
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  });

  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  });
} catch (error) {
  console.error('Firebase initialization error in service worker:', error);
}