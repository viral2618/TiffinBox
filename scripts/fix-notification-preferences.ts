import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixNotificationPreferences() {
  console.log('Starting notification preferences cleanup...');

  try {
    // Delete orphaned owner notification preferences
    const allOwnerPrefs = await prisma.ownerNotificationPreference.findMany();
    console.log(`Found ${allOwnerPrefs.length} owner notification preferences`);

    for (const pref of allOwnerPrefs) {
      const owner = await prisma.owner.findUnique({ where: { id: pref.ownerId } });
      if (!owner) {
        console.log(`⚠️  Deleting orphaned preference for non-existent owner: ${pref.ownerId}`);
        await prisma.ownerNotificationPreference.delete({ where: { id: pref.id } });
      }
    }

    // Delete orphaned user notification preferences
    const allUserPrefs = await prisma.userNotificationPreference.findMany();
    console.log(`Found ${allUserPrefs.length} user notification preferences`);

    for (const pref of allUserPrefs) {
      const user = await prisma.user.findUnique({ where: { id: pref.userId } });
      if (!user) {
        console.log(`⚠️  Deleting orphaned preference for non-existent user: ${pref.userId}`);
        await prisma.userNotificationPreference.delete({ where: { id: pref.id } });
      }
    }

    // Get all owners
    const owners = await prisma.owner.findMany({
      select: { id: true, email: true }
    });

    console.log(`\nFound ${owners.length} owners`);

    for (const owner of owners) {
      const existingPref = await prisma.ownerNotificationPreference.findUnique({
        where: { ownerId: owner.id }
      });

      if (!existingPref) {
        await prisma.ownerNotificationPreference.create({
          data: {
            general: true,
            emailAlerts: false,
            notificationAlert: true,
            ownerId: owner.id,
          }
        });
        console.log(`✓ Created notification preference for owner: ${owner.email}`);
      } else {
        console.log(`✓ Notification preference already exists for owner: ${owner.email}`);
      }
    }

    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true, email: true }
    });

    console.log(`\nFound ${users.length} users`);

    for (const user of users) {
      const existingPref = await prisma.userNotificationPreference.findUnique({
        where: { userId: user.id }
      });

      if (!existingPref) {
        await prisma.userNotificationPreference.create({
          data: {
            general: true,
            emailAlerts: false,
            notificationAlert: true,
            userId: user.id,
          }
        });
        console.log(`✓ Created notification preference for user: ${user.email}`);
      } else {
        console.log(`✓ Notification preference already exists for user: ${user.email}`);
      }
    }

    console.log('\n✅ Notification preferences cleanup completed!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

fixNotificationPreferences()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
