import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';



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
    
    // Store verification code in database
    await prisma.user.update({
      where: { email },
      data: {
        forgotPasswordToken: verificationCode,
        updatedAt: new Date()
      }
    });

    try {
      await sendEmail({
        to: email,
        subject: 'Password Reset Code - Sweet Bakery',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #fc7c7c;">Password Reset Request</h2>
            <p>Hello ${user.name},</p>
            <p>You requested to reset your password. Use this verification code:</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #fef7ed; border: 2px solid #fc7c7c; padding: 20px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 3px; color: #451a03;">${verificationCode}</div>
            </div>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>Best regards,<br><strong>Sweet Bakery Team</strong></p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return NextResponse.json({
        message: 'Email failed to send',
        verificationCode // Fallback when email fails
      });
    }

    return NextResponse.json({
      message: 'Verification code sent to your email'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}