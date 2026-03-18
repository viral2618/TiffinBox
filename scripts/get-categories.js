const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log('All Categories:');
    console.log('================');
    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name} (ID: ${category.id}, Slug: ${category.slug})`);
    });

    console.log('\nTotal categories:', categories.length);
    
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getCategories();