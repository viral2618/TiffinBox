import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email, code, newPassword } = await req.json();
    
    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    // Find user with matching email and verification code
    const user = await prisma.user.findFirst({
      where: {
        email,
        forgotPasswordToken: code
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid reset session' }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password and clear reset tokens
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        forgotPasswordToken: null,
        emailVerificationOtp: null,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}