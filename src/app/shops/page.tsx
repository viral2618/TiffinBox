import { Suspense } from "react"
import { Metadata } from "next"
import ShopsClientWrapper from "@/components/shops/ShopsClientWrapper"

interface ShopsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ searchParams }: ShopsPageProps): Promise<Metadata> {
  const params = await searchParams
  const search = params.search as string
  const categoryId = params.categoryId as string
  
  let title = "Find Your Perfect Bakery | When Fresh"
  let description = "Discover fresh baked goods from local bakeries in your area"
  
  if (search) {
    title = `Search Results: "${search}" | When Fresh`
    description = `Find bakeries matching "${search}" - fresh baked goods delivered to your door`
  } else if (categoryId) {
    title = "Bakeries by Category | When Fresh"
    description = "Browse bakeries filtered by your selected category"
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
  
  // Build API URL with query parameters
  const apiParams = new URLSearchParams()
  if (params.search) apiParams.set('search', params.search as string)
  if (params.categoryId) apiParams.set('categoryId', params.categoryId as string)
  if (params.subcategoryId) apiParams.set('subcategoryId', params.subcategoryId as string)
  if (params.lat) apiParams.set('lat', params.lat as string)
  if (params.lng) apiParams.set('lng', params.lng as string)
  if (params.radius) apiParams.set('radius', params.radius as string)
  else if (params.lat && params.lng) apiParams.set('radius', '5')
  if (params.page) apiParams.set('page', params.page as string)
  else apiParams.set('page', '1')
  apiParams.set('limit', '12')
  if (params.minRating) apiParams.set('minRating', params.minRating as string)
  if (params.serveTime) apiParams.set('serveTime', params.serveTime as string)
  if (params.sortBy) apiParams.set('sortBy', params.sortBy as string)
  
  // Fetch data from API route
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const apiUrl = `${baseUrl}/api/shops?${apiParams.toString()}`
  console.log('🔥 API Call:', apiUrl)
  
  const response = await fetch(apiUrl, {
    cache: 'no-store' // Ensure fresh data
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch shops data')
  }
  
  const { shops, isNearby, pagination } = await response.json()
  
  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": params.search ? `Search Results: "${params.search}"` : "Find Your Perfect Bakery",
    "description": "Discover fresh baked goods from local bakeries in your area",
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
    <Suspense fallback={<div className="container mx-auto py-24 px-4"><div className="text-center">Loading bakeries...</div></div>}>
      <ShopsPageContent searchParams={searchParams} />
    </Suspense>
  )
}