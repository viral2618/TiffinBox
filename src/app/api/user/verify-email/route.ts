import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';



export async function POST(req: NextRequest) {
  const { email, otp } = await req.json();
  
  if (!email || !otp) {
    return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Check if OTP matches
  if (user.emailVerificationOtp !== otp) {
    return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
  }

  // Update user to mark email as verified
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationOtp: null,
    },
  });

  return NextResponse.json({ message: 'Email verified successfully' });
}