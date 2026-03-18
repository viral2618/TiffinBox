"use client"

import { Eye } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { QuickViewPopup } from "@/components/ui/quick-view-popup"

interface QuickViewModalProps {
  isOpen: boolean
  onClose: () => void
  dish: {
    id: string
    name: string
    slug: string
    description?: string
    imageUrls?: string[]
    price: number
    originalPrice?: number
    discountPercentage?: number
    timings?: Array<{
      preparedAt: { hour: number; minute: number }
      servedFrom: { hour: number; minute: number }
      servedUntil: { hour: number; minute: number }
    }>
    shop: {
      name: string
      logoUrl?: string
      distance?: number
    }
  }
}

export function QuickViewModal({ isOpen, onClose, dish }: QuickViewModalProps) {
  const actions = (
    <>
      {/* <Button className="flex-1 bg-primary hover:bg-primary/80 text-white py-3">
        Order Now
      </Button> */}
      <Link href={`/dishes/${dish.slug}`} className="flex-1">
        <Button variant="outline" className="w-1/2 py-3 flex items-center gap-2">
          <Eye className="w-4 h-4" />
          VIEW
        </Button>
      </Link>
    </>
  )

  return (
    <QuickViewPopup
      isOpen={isOpen}
      onClose={onClose}
      item={dish}
      actions={actions}
      showShopInfo={true}
    />
  )
}