"use client"

import { Suspense } from "react"
import FeaturedShopsSection from "./featured-shops-section"

export default function FeaturedShopsWrapper() {
  return (
    <Suspense fallback={<div className="py-24 h-96 bg-gray-100 animate-pulse" />}>
      <FeaturedShopsSection />
    </Suspense>
  )
}