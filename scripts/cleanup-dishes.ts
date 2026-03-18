import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Checking for dishes with invalid shop references...\n')
  
  const allDishes = await prisma.dish.findMany({
    select: { id: true, name: true, shopId: true }
  })

  const validShops = await prisma.shop.findMany({
    select: { id: true }
  })
  const validShopIds = new Set(validShops.map(s => s.id))

  const orphanedDishes = allDishes.filter(dish => !validShopIds.has(dish.shopId))

  console.log('Dishes with invalid shop references:')
  orphanedDishes.forEach((dish, index) => {
    console.log(`${index + 1}. ${dish.name} (ID: ${dish.id}, ShopID: ${dish.shopId})`)
  })
  console.log(`\nTotal: ${orphanedDishes.length} dishes\n`)

  if (orphanedDishes.length > 0) {
    console.log('Deleting orphaned dishes...\n')
    
    const dishIds = orphanedDishes.map(d => d.id)
    
    await prisma.$transaction(async (tx) => {
      await tx.dishTag.deleteMany({ where: { dishId: { in: dishIds } } })
      await tx.review.deleteMany({ where: { dishId: { in: dishIds } } })
      await tx.reminder.deleteMany({ where: { dishId: { in: dishIds } } })
      await tx.dish.deleteMany({ where: { id: { in: dishIds } } })
    })
    
    console.log(`✓ Deleted ${dishIds.length} dishes`)
  } else {
    console.log('✓ No orphaned dishes found!')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
