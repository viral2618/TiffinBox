// scripts/migrate-dishes.ts
// Run this script to migrate existing dishes after schema update
// Usage: npx ts-node scripts/migrate-dishes.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateDishes() {
  console.log('Starting dish migration...');

  try {
    // Get all dishes
    const dishes = await prisma.dish.findMany({
      select: {
        id: true,
        name: true,
        // Old fields that were removed
        // quantity, isOutOfStock, isMarketingEnabled
      }
    });

    console.log(`Found ${dishes.length} dishes to check`);

    // Note: Since we removed quantity, isOutOfStock, and isMarketingEnabled
    // from the schema, they are automatically removed from the database
    // No data migration needed - just informational

    console.log('\n✅ Migration complete!');
    console.log('\nNext steps:');
    console.log('1. Vendors can now add prep time to their dishes');
    console.log('2. Edit each dish to set prepTimeMinutes (optional)');
    console.log('3. Use the preparation toggle system for dishes with prep time set');

    // Optional: Set default prep time for specific categories
    // Uncomment and modify as needed
    /*
    const bakeryCategory = await prisma.category.findFirst({
      where: { name: 'Bakery' }
    });

    if (bakeryCategory) {
      await prisma.dish.updateMany({
        where: { categoryId: bakeryCategory.id },
        data: { prepTimeMinutes: 90 } // Default 90 minutes for bakery items
      });
      console.log('Set default prep time for bakery items');
    }
    */

  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateDishes();
