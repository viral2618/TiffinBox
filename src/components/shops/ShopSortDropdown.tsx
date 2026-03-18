"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ShopSortDropdownProps {
  currentSort?: string
}

export default function ShopSortDropdown({ currentSort }: ShopSortDropdownProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value && value !== 'newest') {
      params.set('sortBy', value)
    } else {
      params.delete('sortBy')
    }
    params.delete('page')
    router.push(`/shops?${params.toString()}`)
  }

  return (
    <Select value={currentSort || 'newest'} onValueChange={handleSortChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">Newest</SelectItem>
        <SelectItem value="oldest">Oldest</SelectItem>
        <SelectItem value="nearest">Nearest</SelectItem>
        <SelectItem value="rating">Top Rated</SelectItem>
        <SelectItem value="reviews">Most Reviews</SelectItem>
      </SelectContent>
    </Select>
  )
}