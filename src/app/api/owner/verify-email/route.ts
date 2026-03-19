import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';



export async function POST(req: NextRequest) {
  const { email, otp } = await req.json();
  
  if (!email || !otp) {
    return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
  }

  // Find owner by email
  const owner = await prisma.owner.findUnique({
    where: { email },
  });

  if (!owner) {
    return NextResponse.json({ error: 'Owner not found' }, { status: 404 });
  }

  // Check if OTP matches
  if (owner.emailVerificationOtp !== otp) {
    return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
  }

  // Update owner to mark email as verified
  await prisma.owner.update({
    where: { id: owner.id },
    data: {
      emailVerified: true,
      emailVerificationOtp: null,
    },
  });

  return NextResponse.json({ message: 'Email verified successfully' });
}