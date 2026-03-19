"use client"
import { Suspense } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Hero from "@/components/user/hero"
import CategoriesSection from "@/components/user/categories-section"
import PromoSection from "@/components/user/promo-section"
import FeaturedShopsSection from "@/components/user/featured-shops-section"
import FreshDishesSection from "@/components/user/fresh-dishes-section"
import CallToActionSection from "@/components/user/cta-section"




function HomeContent() {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8])

  return (
    <div className="homepage-section pb-24 md:pb-0">

      <motion.div style={{ opacity }}>
        <Hero />
      </motion.div>
      <main className="relative space-y-4 sm:space-y-6 lg:space-y-8">
        <CategoriesSection />
        <FreshDishesSection />
        <FeaturedShopsSection />

        
      </main>

    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background animate-pulse" />}>
      <HomeContent />
    </Suspense>
  )
}
