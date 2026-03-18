import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET owner notification preferences
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'owner') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const preferences = await prisma.ownerNotificationPreference.upsert({
      where: { ownerId: session.user.id },
      update: {},
      create: {
        general: true,
        emailAlerts: false,
        notificationAlert: true,
        ownerId: session.user.id,
      },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification preferences' },
      { status: 500 }
    );
  }
}

// Update owner notification preferences
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  console.log('PUT /api/owner/notification-preferences - Session:', {
    hasSession: !!session,
    userId: session?.user?.id,
    role: session?.user?.role
  });
  
  if (!session?.user?.id || session.user.role !== 'owner') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    console.log('Request body:', body);
    
    const { general, emailAlerts, notificationAlert } = body;

    const preferences = await prisma.ownerNotificationPreference.upsert({
      where: { ownerId: session.user.id },
      update: {
        general: general ?? true,
        emailAlerts: emailAlerts ?? false,
        notificationAlert: notificationAlert ?? false,
      },
      create: {
        general: general ?? true,
        emailAlerts: emailAlerts ?? false,
        notificationAlert: notificationAlert ?? false,
        ownerId: session.user.id,
      },
    });
    
    console.log('Updated preferences:', preferences);
    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update notification preferences', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}