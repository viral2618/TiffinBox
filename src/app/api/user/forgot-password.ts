import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: 'No account found with this email address' }, { status: 404 });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Store reset token and code in database (expires in 15 minutes)
    await prisma.user.update({
      where: { email },
      data: {
        forgotPasswordToken: resetToken,
        emailVerificationOtp: verificationCode,
        updatedAt: new Date()
      }
    });

    // For demo purposes, return the code (in production, send via email)
    return NextResponse.json({
      message: 'Verification code generated',
      resetToken,
      verificationCode // Remove this in production
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
