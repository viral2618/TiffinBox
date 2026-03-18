import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt-utils';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.type !== 'password_reset') {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const { email, role } = payload;
    const hashedPassword = await bcrypt.hash(password, 12);

    if (role === 'user') {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      });
    } else if (role === 'owner') {
      const owner = await prisma.owner.findUnique({ where: { email } });
      if (!owner) {
        return NextResponse.json({ error: 'Owner not found' }, { status: 404 });
      }

      await prisma.owner.update({
        where: { email },
        data: { password: hashedPassword }
      });
    } else {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}