import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateVerificationToken } from '@/lib/jwt-utils';
import { sendPasswordResetEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 });
    }

    let user;
    if (role === 'user') {
      user = await prisma.user.findUnique({ where: { email } });
    } else if (role === 'owner') {
      user = await prisma.owner.findUnique({ where: { email } });
    }

    if (!user) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    if (!user.emailVerified) {
      return NextResponse.json({ error: 'Please verify your email first' }, { status: 400 });
    }

    const token = generateVerificationToken({
      email,
      type: 'password_reset',
      role: role as 'user' | 'owner',
      userId: user.id
    });

    await sendPasswordResetEmail(email, token, user.name);

    return NextResponse.json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}