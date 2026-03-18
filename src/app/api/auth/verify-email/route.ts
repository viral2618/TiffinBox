import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt-utils';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.type !== 'email_verification') {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const { email, role } = payload;

    if (role === 'user') {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      if (user.emailVerified) {
        return NextResponse.json({ message: 'Email already verified' });
      }

      await prisma.user.update({
        where: { email },
        data: { emailVerified: true }
      });
    } else if (role === 'owner') {
      const owner = await prisma.owner.findUnique({ where: { email } });
      if (!owner) {
        return NextResponse.json({ error: 'Owner not found' }, { status: 404 });
      }

      if (owner.emailVerified) {
        return NextResponse.json({ message: 'Email already verified' });
      }

      await prisma.owner.update({
        where: { email },
        data: { emailVerified: true }
      });
    } else {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}