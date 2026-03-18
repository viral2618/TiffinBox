const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCategories() {
  const categories = await prisma.category.findMany({
    include: { subcategories: true }
  });
  
  console.log(`Found ${categories.length} categories`);
  
  if (categories.length > 0) {
    console.log('First category:', categories[0].name);
    console.log('First subcategory:', categories[0].subcategories[0]?.name || 'None');
  }
  
  await prisma.$disconnect();
}

checkCategories().catch(console.error);