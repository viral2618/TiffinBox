import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';



export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  // Generate a secure token
  const token = crypto.randomBytes(32).toString('hex');

  // Save token to owner
  const owner = await prisma.owner.update({
    where: { email },
    data: { forgotPasswordToken: token },
  }).catch(() => null);

  if (!owner) {
    return NextResponse.json({ error: 'Owner not found' }, { status: 404 });
  }

  // Send forgot password email
  const resetUrl = `${process.env.NEXTAUTH_URL || ''}/owner/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Reset Your Password',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`
  });

  return NextResponse.json({ message: 'Password reset email sent' });
}
