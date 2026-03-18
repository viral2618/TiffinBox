import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding missing fields to all shops...');

  const shops = await prisma.shop.findMany();
  console.log(`Found ${shops.length} shops in database\n`);

  if (shops.length === 0) {
    console.log('No shops to update');
    return;
  }

  for (const shop of shops) {
    await prisma.shop.update({
      where: { id: shop.id },
      data: {
        contactPhone2: (shop as any).contactPhone2 ?? null,
        contactPhone3: (shop as any).contactPhone3 ?? null,
        establishedYear: (shop as any).establishedYear ?? null
      }
    });
    console.log(`✓ Updated shop: ${shop.name}`);
  }

  console.log(`\n✓ Migration complete! Updated ${shops.length} shops`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
