import { PrismaClient } from '@prisma/client';
import { sendPushNotification } from '@/lib/push-notifications';
import { sendEmail } from '@/lib/email';

const prisma = new PrismaClient();

interface SendNotificationOptions {
  userId?: string;
  ownerId?: string;
  title: string;
  message: string;
  type: string;
  emailSubject?: string;
}

/**
 * Send a notification to a user or owner based on their notification preferences
 */
export async function sendNotification({
  userId,
  ownerId,
  title,
  message,
  type,
  emailSubject,
}: SendNotificationOptions) {
  try {
    if (!userId && !ownerId) {
      throw new Error('Either userId or ownerId must be provided');
    }

    // Create notification record
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        userId,
        ownerId,
      },
    });

    // Get notification preferences
    const preferences = userId
      ? await prisma.userNotificationPreference.findUnique({
          where: { userId },
        })
      : await prisma.ownerNotificationPreference.findUnique({
          where: { ownerId },
        });

    if (!preferences) {
      return notification;
    }

    console.log('📋 Preferences:', preferences);

    // Check if general notifications are enabled
    if (!preferences.general) {
      console.log('🔕 General notifications disabled');
      return notification;
    }

    console.log('✅ General notifications enabled');

    // Get user or owner data
    const recipient = userId
      ? await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true },
        })
      : await prisma.owner.findUnique({
          where: { id: ownerId },
          select: { email: true },
        });

    if (!recipient) {
      throw new Error('Recipient not found');
    }

    console.log('👤 Recipient found:', recipient.email);

    // Send push notification to all devices
    if (preferences.notificationAlert) {
      console.log('🔔 Push notifications enabled, fetching tokens...');
      
      const deviceTokens = await prisma.deviceToken.findMany({
        where: userId ? { userId } : { ownerId },
        select: { token: true },
      });

      console.log(`📱 Found ${deviceTokens.length} device token(s)`);

      if (deviceTokens.length > 0) {
        const results = await Promise.allSettled(
          deviceTokens.map(({ token }) => {
            console.log('📤 Sending push to:', token.substring(0, 20) + '...');
            return sendPushNotification(token, title, message, {
              type,
              notificationId: notification.id,
            });
          })
        );
        
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        console.log(`✅ Push notifications: ${successful} sent, ${failed} failed`);
        
        if (failed > 0) {
          results.forEach((result, index) => {
            if (result.status === 'rejected') {
              console.error(`❌ Failed to send to token ${index}:`, result.reason);
            }
          });
        }
      } else {
        console.log('⚠️ No device tokens registered for this user/owner');
      }
    } else {
      console.log('🔕 Push notifications disabled in preferences');
    }

    // Send email notification if enabled
    if (preferences.emailAlerts && recipient.email) {
      await sendEmail({
        to: recipient.email,
        subject: emailSubject || title,
        html: `
          <h1>${title}</h1>
          <p>${message}</p>
        `,
      });
    }

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}