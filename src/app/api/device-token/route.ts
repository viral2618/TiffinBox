import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { token, userId, ownerId, deviceInfo } = await req.json();

    if (!token || (!userId && !ownerId)) {
      return NextResponse.json({ error: 'Token and userId/ownerId required' }, { status: 400 });
    }

    const deviceToken = await prisma.deviceToken.upsert({
      where: { token },
      update: { lastUsed: new Date(), deviceInfo },
      create: { token, userId, ownerId, deviceInfo },
    });

    return NextResponse.json({ success: true, deviceToken });
  } catch (error) {
    console.error('Error saving device token:', error);
    return NextResponse.json({ error: 'Failed to save token' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { token } = await req.json();

    await prisma.deviceToken.delete({ where: { token } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting device token:', error);
    return NextResponse.json({ error: 'Failed to delete token' }, { status: 500 });
  }
}
