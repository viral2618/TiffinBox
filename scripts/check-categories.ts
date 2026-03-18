import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking existing categories and subcategories...\n');

  const categories = await prisma.category.findMany({
    include: { subcategories: true }
  });

  if (categories.length === 0) {
    console.log('❌ No categories found in database');
    return;
  }

  categories.forEach(category => {
    console.log(`📂 Category: ${category.name}`);
    if (category.subcategories.length > 0) {
      category.subcategories.forEach(sub => {
        console.log(`   └── ${sub.name}`);
      });
    } else {
      console.log('   └── No subcategories');
    }
    console.log('');
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());