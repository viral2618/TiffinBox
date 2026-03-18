import { PrismaClient } from '@prisma/client';
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

    const notification = await prisma.notification.create({
      data: { title, message, type, userId, ownerId },
    });

    const preferences = userId
      ? await prisma.userNotificationPreference.findUnique({ where: { userId } })
      : await prisma.ownerNotificationPreference.findUnique({ where: { ownerId } });

    if (!preferences || !preferences.general) {
      return notification;
    }

    const recipient = userId
      ? await prisma.user.findUnique({ where: { id: userId }, select: { email: true } })
      : await prisma.owner.findUnique({ where: { id: ownerId }, select: { email: true } });

    if (!recipient) {
      throw new Error('Recipient not found');
    }

    if (preferences.emailAlerts && recipient.email) {
      await sendEmail({
        to: recipient.email,
        subject: emailSubject || title,
        html: `<h1>${title}</h1><p>${message}</p>`,
      });
    }

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}
