import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Save OTP to user
  const user = await prisma.user.update({
    where: { email },
    data: { emailVerificationOtp: otp },
  }).catch(() => null);

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Send OTP email
  await sendEmail({
    to: email,
    subject: 'Your Email Verification OTP',
    html: `<p>Your OTP is: <b>${otp}</b></p>`
  });

  return NextResponse.json({ message: 'OTP sent' });
}
