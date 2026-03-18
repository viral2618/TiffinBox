import { MetadataRoute } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Get all shops for sitemap
    const shops = await prisma.shop.findMany({
      select: { slug: true },
      take: 1000
    })
    
    const shopUrls = shops.map((shop) => ({
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://whenfresh.com'}/shops/${shop.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    return [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://whenfresh.com'}/shops`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      ...shopUrls,
    ]
  } catch (error) {
    console.error('Error generating shops sitemap:', error)
    return [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://whenfresh.com'}/shops`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
    ]
  }
}