import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword, currentPassword } = await req.json();

    // Handle password reset with token (forgot password flow)
    if (token && newPassword && !currentPassword) {
      if (newPassword.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
      }

      // Find user with matching reset token
      const user = await prisma.user.findFirst({
        where: { forgotPasswordToken: token }
      });

      if (!user) {
        return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
      }

      // Check if token is not too old (15 minutes)
      const tokenAge = Date.now() - user.updatedAt.getTime();
      const fifteenMinutes = 15 * 60 * 1000;
      
      if (tokenAge > fifteenMinutes) {
        return NextResponse.json({ error: 'Reset token has expired' }, { status: 400 });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password and clear reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          forgotPasswordToken: null,
          updatedAt: new Date()
        }
      });

      return NextResponse.json({ message: 'Password reset successfully' });
    }

    // Handle authenticated password change
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}