# Background Notifications - Testing Guide

## ✅ Changes Made

### 1. **Fixed next.config.ts**
- Removed `publicExcludes` and `buildExcludes` that were preventing Firebase service worker from working
- This allows both PWA and Firebase messaging to coexist properly

### 2. **Enhanced firebase-messaging-sw.js**
- Added notification click handler to open app when notification is clicked
- Added vibration pattern for better UX
- Added data payload support for custom actions
- Improved logging for debugging

### 3. **Added Foreground Message Handler**
- Created `initializeForegroundMessaging()` in firebase.ts
- Shows notifications even when app is open in foreground
- Automatically initialized via `FirebaseMessagingInit` component in root layout

### 4. **Added FirebaseMessagingInit Component**
- Automatically initializes foreground messaging on app load
- Integrated into root layout for global coverage

---

## 🧪 How to Test Background Notifications

### Step 1: Rebuild the App
```bash
npm run build
npm start
```
Or for development:
```bash
npm run dev
```

### Step 2: Grant Notification Permission
1. Open your app in browser
2. When prompted, click "Allow" for notifications
3. Check browser console for "FCM token obtained successfully"

### Step 3: Test Background Notifications
1. **Minimize or switch to another tab** (app must be in background)
2. Send a test notification from your backend or Firebase Console
3. You should see a notification appear even when app is not active

### Step 4: Test Foreground Notifications
1. Keep the app **open and active**
2. Send a test notification
3. You should see a notification appear even though app is in foreground

### Step 5: Test Notification Click
1. Click on any notification
2. App should open/focus and navigate to the relevant page (if URL is provided in data payload)

---

## 🔍 Debugging

### Check Service Worker Registration
Open DevTools → Application → Service Workers
- You should see `firebase-messaging-sw.js` registered
- Status should be "activated and running"

### Check Console Logs
Look for these messages:
- ✅ "Service worker registered successfully"
- ✅ "FCM token obtained successfully"
- ✅ "Foreground message received:" (when app is open)
- ✅ "[firebase-messaging-sw.js] Background message:" (when app is closed)

### Common Issues

**Issue: No notifications appearing**
- Check if notification permission is granted
- Verify FCM token is being saved to database
- Check browser console for errors

**Issue: Only foreground OR background works**
- Clear browser cache and service workers
- Rebuild the app
- Re-register service worker

**Issue: Service worker conflicts**
- Make sure only one service worker is active
- Unregister old service workers from DevTools

---

## 📱 Testing on Mobile

### Android (Chrome)
1. Open app in Chrome
2. Add to Home Screen
3. Close Chrome completely
4. Send notification - should appear even when app is closed

### iOS (Safari)
Note: iOS Safari has limited PWA notification support. Use Chrome or Edge on iOS for better results.

---

## 🚀 Production Checklist

- [ ] Environment variables are set correctly
- [ ] Firebase project is configured
- [ ] VAPID key is added to .env
- [ ] Service worker is being served correctly
- [ ] HTTPS is enabled (required for notifications)
- [ ] Notification permission is requested at appropriate time
- [ ] FCM tokens are being saved to database
- [ ] Backend is sending notifications with correct payload format

---

## 📋 Notification Payload Format

When sending notifications from backend, use this format:

```javascript
{
  token: "user_fcm_token",
  notification: {
    title: "New Order",
    body: "You have a new order!"
  },
  data: {
    notificationId: "123",
    url: "/orders/123",
    type: "order"
  }
}
```

The `data` object will be available in the notification click handler.
