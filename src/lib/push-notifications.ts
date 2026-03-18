import admin from './firebase-admin';

export const sendPushNotification = async (
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
) => {
  try {
    const message: any = {
      token,
      notification: {
        title: title || 'Notification',
        body: body || '',
      },
      data: data || {},
      android: {
        collapseKey: data?.notificationId || 'default', // Prevents duplicate notifications
        priority: 'high',
      },
      apns: {
        headers: {
          'apns-collapse-id': data?.notificationId || 'default', // iOS equivalent
        },
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
      webpush: {
        headers: {
          Urgency: 'high',
        },
        notification: {
          tag: data?.notificationId || 'default', // Web notification deduplication
        },
      },
    };

    await admin.messaging().send(message);
    console.log('Push notification sent successfully to token:', token.substring(0, 20) + '...');
  } catch (error: any) {
    if (error.code === 'messaging/registration-token-not-registered') {
      console.warn('FCM token is no longer valid:', token.substring(0, 20) + '...');
      // TODO: Remove invalid token from database
    } else {
      console.error('Error sending push notification:', error.message);
    }
  }
};