import { Suspense } from "react"
import { Metadata } from "next"
import ShopsClientWrapper from "@/components/shops/ShopsClientWrapper"
import { prisma } from "@/lib/prisma"

interface ShopsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ searchParams }: ShopsPageProps): Promise<Metadata> {
  const params = await searchParams
  const search = params.search as string
  const categoryId = params.categoryId as string
  
  let title = "Find Your Perfect Home Kitchen | TiffinBox"
  let description = "Discover fresh homemade food from local home kitchens in your area"
  
  if (search) {
    title = `Search Results: "${search}" | When Fresh`
    description = `Find home kitchens matching "${search}" - fresh homemade food delivered to your door`
  } else if (categoryId) {
    title = "Home Kitchens by Category | TiffinBox"
    description = "Browse home kitchens filtered by your selected category"
  }
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website'
    }
  }
}

async function ShopsPageContent({ searchParams }: ShopsPageProps) {
  const params = await searchParams
  
  // Fetch shops directly from DB (avoids HTTP self-call in SSR)
  const page = parseInt((params.page as string) || '1')
  const limit = 12
  const search = params.search as string | undefined
  const minRating = parseInt((params.minRating as string) || '0')
  const isOpen = params.isOpen === 'true'
  const tagIds = params.tagIds ? (Array.isArray(params.tagIds) ? params.tagIds : [params.tagIds]) : []
  const sortBy = (params.sortBy as string) || 'newest'

  const where: any = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (isOpen) where.isOpen = true
  if (tagIds.length > 0) where.shopTags = { some: { tagId: { in: tagIds } } }

  const orderBy: any = sortBy === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' }

  const [rawShops, totalCount] = await Promise.all([
    prisma.shop.findMany({
      where,
      include: {
        dishes: { take: 3, include: { category: true } },
        shopTags: { include: { tag: true } },
        shopReviews: { select: { rating: true, id: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.shop.count({ where }),
  ])

  let shops = rawShops.map((shop) => {
    const { shopReviews, ...rest } = shop
    const rating = shopReviews.length
      ? shopReviews.reduce((s, r) => s + r.rating, 0) / shopReviews.length
      : 0
    return {
      ...rest,
      coordinates: rest.coordinates ?? undefined,
      description: rest.description ?? undefined,
      bannerImage: rest.bannerImage ?? undefined,
      logoUrl: rest.logoUrl ?? undefined,
      contactPhone: rest.contactPhone ?? undefined,
      contactPhone2: rest.contactPhone2 ?? undefined,
      contactPhone3: rest.contactPhone3 ?? undefined,
      whatsapp: rest.whatsapp ?? undefined,
      schedule: rest.schedule ?? undefined,
      isFavorite: false,
      rating,
      reviewCount: shopReviews.length,
    }
  })

  // Apply minRating filter in memory (after rating calculation)
  if (minRating > 0) shops = shops.filter(s => (s.rating || 0) >= minRating)

  // Apply rating/reviews sort in memory
  if (sortBy === 'rating') shops.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  if (sortBy === 'reviews') shops.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))

  const pagination = {
    total: minRating > 0 ? shops.length : totalCount,
    page,
    limit,
    pages: Math.ceil((minRating > 0 ? shops.length : totalCount) / limit),
  }
  const isNearby = false
  
  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": params.search ? `Search Results: "${params.search}"` : "Find Your Perfect Home Kitchen",
    "description": "Discover fresh homemade food from local home kitchens in your area",
    "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://whenfresh.com'}/shops`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": pagination.total,
      "itemListElement": shops.map((shop: any, index: number) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "LocalBusiness",
          "@id": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://whenfresh.com'}/shops/${shop.slug}`,
          "name": shop.name,
          "description": shop.description,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": shop.address
          },
          "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://whenfresh.com'}/shops/${shop.slug}`
        }
      }))
    }
  }
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ShopsClientWrapper 
        initialShops={shops}
        initialPagination={pagination}
        initialIsNearby={isNearby}
        searchParams={params}
      />
    </>
  )
}

export default async function ShopsPage({ searchParams }: ShopsPageProps) {
  return (
    <Suspense fallback={<div className="container mx-auto py-24 px-4"><div className="text-center">Loading home kitchens...</div></div>}>
      <ShopsPageContent searchParams={searchParams} />
    </Suspense>
  )
}