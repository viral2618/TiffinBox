"use client"

import dynamic from 'next/dynamic'

interface ShopData {
  id: string
  name: string
  slug: string
  description?: string
  address: string
  coordinates?: {
    lat: number
    lng: number
  }
  bannerImage?: string
  logoUrl?: string
  imageUrls: string[]
  contactPhone?: string
  whatsapp?: string
  distance?: number
  isFavorite: boolean
  rating?: number
  reviewCount?: number
  dishes: any[]
  shopTags: {
    tag: {
      id: string
      name: string
    }
  }[]
}

const ShopsClient = dynamic(() => import('./ShopsClient'), {
  ssr: false,
  loading: () => <div className="container mx-auto py-24 px-4"><div className="text-center">Loading bakeries...</div></div>
})

interface ShopsClientWrapperProps {
  initialShops: ShopData[]
  initialPagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
  initialIsNearby: boolean
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function ShopsClientWrapper(props: ShopsClientWrapperProps) {
  return <ShopsClient {...props} />
}