import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

export async function createUser(name: string, email: string, password: string, fcmToken?: string) {
  const hashedPassword = await hashPassword(password);
  
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      emailVerified: false,
    },
  });

  try {
    const notificationPreference = await prisma.userNotificationPreference.create({
      data: {
        general: true,
        emailAlerts: false,
        notificationAlert: true,
        userId: user.id,
      },
    });

    return {
      ...user,
      notificationPreference,
    };
  } catch (error) {
    // If notification preference creation fails, still return the user
    console.warn('Failed to create notification preference:', error);
    return {
      ...user,
      notificationPreference: null,
    };
  }
}