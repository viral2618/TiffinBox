"use client"

import { motion, AnimatePresence } from "framer-motion"
import { MapPin, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import SearchInput from "@/components/search/SearchInput"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Dish {
  id: string
  name: string
  slug: string
  price: number
  isVeg: boolean
  imageUrls?: string[]
  shop: { name: string; slug: string; logoUrl?: string }
}

interface Shop {
  id: string
  name: string
  slug: string
  logoUrl?: string
  address: string
}

const CATEGORIES = [
  { label: "Thali",   img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=120&q=80" },
  { label: "Paratha", img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=120&q=80" },
  { label: "Biryani", img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=120&q=80" },
  { label: "Snacks",  img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=120&q=80" },
  { label: "Sweets",  img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&q=80" },
  { label: "Soup",    img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=120&q=80" },
  { label: "Dessert", img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=120&q=80" },
  { label: "Rice",    img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=120&q=80" },
]

export default function Hero() {
  const [dishes, setDishes]         = useState<Dish[]>([])
  const [shops, setShops]           = useState<Shop[]>([])
  const [idx, setIdx]               = useState(0)
  const [ready, setReady]           = useState(false)
  const router  = useRouter()

  /* fetch real data */
  useEffect(() => {
    ;(async () => {
      try {
        const [dr, sr] = await Promise.all([
          fetch("/api/dishes?limit=8"),
          fetch("/api/shops?limit=6"),
        ])
        if (dr.ok) {
          const d = await dr.json()
          setDishes((d.dishes ?? []).filter((x: Dish) => x.imageUrls?.length))
        }
        if (sr.ok) {
          const s = await sr.json()
          setShops(s.shops ?? [])
        }
      } catch (_) {}
      setReady(true)
    })()
  }, [])

  const slides = dishes.slice(0, 5)

  /* auto-advance */
  useEffect(() => {
    if (slides.length < 2) return
    const t = setInterval(() => setIdx(p => (p + 1) % slides.length), 5000)
    return () => clearInterval(t)
  }, [slides.length])

  const handleSearchSubmit = (q: string) => {
    if (q.trim()) router.push(`/dishes?search=${encodeURIComponent(q.trim())}`)
  }

  const active = slides[idx]

  return (
    <div className="w-full bg-white">

      {/* ════════════════════════════════════════
          HERO BANNER  (full-width image + overlay)
      ════════════════════════════════════════ */}
      <div className="relative w-full overflow-hidden" style={{ height: "clamp(420px, 56vw, 620px)" }}>

        {/* Slide images */}
        <AnimatePresence mode="wait">
          {ready && active ? (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={active.imageUrls![0]}
                alt={active.name}
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
            </motion.div>
          ) : (
            /* skeleton while loading */
            <div className="absolute inset-0 animate-pulse" style={{ background: "#ccfbf1" }} />
          )}
        </AnimatePresence>

        {/* Gradient overlay — bottom-heavy so text pops */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.10) 35%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.82) 100%)",
          }}
        />

        {/* ── Top: location bar ── */}
        <div className="absolute top-0 left-0 right-0 pt-20 lg:pt-24 px-4 lg:px-10">
          <button className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-2 hover:bg-white/25 transition-colors">
            <MapPin className="w-3.5 h-3.5 text-white" />
            <span className="text-white text-sm font-medium">Delivering to</span>
            <span className="text-white/80 text-sm">Your Location</span>
            <ChevronDown className="w-3.5 h-3.5 text-white/70" />
          </button>
        </div>

        {/* ── Centre: headline + search ── */}
        <div className="absolute inset-x-0 bottom-0 px-4 lg:px-10 pb-6 sm:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-2xl mx-auto text-center mb-4"
          >
            <h1 className="text-white font-extrabold leading-tight tracking-tight"
              style={{ fontSize: "clamp(1.3rem, 4vw, 2.8rem)", textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
              Ghar ka khana,{" "}
              <span style={{ color: "#5eead4" }}>delivered fresh</span>
            </h1>
            <p className="text-white/75 mt-1.5 text-xs sm:text-base">
              Order from home cooks near you — wholesome &amp; made with love
            </p>
          </motion.div>

          {/* Search bar — shared SearchInput component */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto"
            style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.20))" }}
          >
            <SearchInput
              placeholder='Search "Dal Makhani", "Paratha", "Biryani"…'
              onSubmit={handleSearchSubmit}
              showDropdown={true}
            />
          </motion.div>
        </div>

        {/* Slide arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={() => setIdx(p => (p - 1 + slides.length) % slides.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => setIdx(p => (p + 1) % slides.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </>
        )}

        {/* Slide dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-[6rem] sm:bottom-[7rem] left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === idx ? "22px" : "7px",
                  height: "7px",
                  background: i === idx ? "#fff" : "rgba(255,255,255,0.4)",
                }}
              />
            ))}
          </div>
        )}

        {/* Active dish label — bottom-left */}
        {ready && active && (
          <motion.div
            key={active.id + "-label"}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute bottom-[6rem] sm:bottom-[7rem] left-4 lg:left-10 flex items-center gap-2"
          >
            {active.shop.logoUrl && (
              <Image
                src={active.shop.logoUrl}
                alt={active.shop.name}
                width={28}
                height={28}
                className="rounded-full border-2 border-white/50 object-cover"
              />
            )}
            <span className="text-white/80 text-xs font-medium bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
              {active.shop.name}
            </span>
          </motion.div>
        )}
      </div>

      {/* ════════════════════════════════════════
          CATEGORY PILLS
      ════════════════════════════════════════ */}
      <div className="w-full border-b" style={{ borderColor: "#f0fdfa", background: "#fff" }}>
        <div className="container mx-auto px-4 lg:px-10 py-5">
          <div
            className="flex items-center gap-4 overflow-x-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <Link
                  href="/categories"
                  className="flex-shrink-0 flex flex-col items-center gap-2 group"
                >
                  <div
                    className="w-16 h-16 rounded-full overflow-hidden border-2 transition-all duration-200 group-hover:border-teal-400 group-hover:shadow-md group-hover:scale-105"
                    style={{ borderColor: "#e4f7f5" }}
                  >
                    <Image
                      src={cat.img}
                      alt={cat.label}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span
                    className="text-xs font-semibold whitespace-nowrap transition-colors group-hover:text-teal-600"
                    style={{ color: "#374151" }}
                  >
                    {cat.label}
                  </span>
                </Link>
              </motion.div>
            ))}

            {/* View all */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: CATEGORIES.length * 0.04 }}
            >
              <Link href="/categories" className="flex-shrink-0 flex flex-col items-center gap-2 group">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-200 group-hover:border-teal-400 group-hover:scale-105"
                  style={{ borderColor: "#e4f7f5", background: "#f0fdfa" }}
                >
                  <span className="text-xl font-bold" style={{ color: "#0d9488" }}>+</span>
                </div>
                <span className="text-xs font-semibold whitespace-nowrap" style={{ color: "#374151" }}>
                  See All
                </span>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          FEATURED DISHES GRID  (3 cards)
      ════════════════════════════════════════ */}
      {ready && dishes.length >= 3 && (
        <div className="w-full" style={{ background: "#f9fafb" }}>
          <div className="container mx-auto px-4 lg:px-10 py-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ color: "#111827" }}>
                Featured Today
              </h2>
              <Link
                href="/dishes"
                className="text-sm font-semibold flex items-center gap-1 hover:underline"
                style={{ color: "#0d9488" }}
              >
                See all
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dishes.slice(0, 3).map((dish, i) => (
                <motion.div
                  key={dish.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <Link
                    href={`/dishes/${dish.slug}`}
                    className="group block rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-lg"
                    style={{ border: "1px solid #f0fdfa", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden" style={{ height: "180px" }}>
                      <Image
                        src={dish.imageUrls![0]}
                        alt={dish.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      {/* Veg dot */}
                      <div className="absolute top-3 left-3">
                        <div
                          className="w-5 h-5 rounded-sm border-2 flex items-center justify-center bg-white"
                          style={{ borderColor: dish.isVeg ? "#16a34a" : "#dc2626" }}
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: dish.isVeg ? "#16a34a" : "#dc2626" }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <p className="font-bold text-sm truncate" style={{ color: "#111827" }}>{dish.name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5">
                          {dish.shop.logoUrl ? (
                            <Image
                              src={dish.shop.logoUrl}
                              alt={dish.shop.name}
                              width={18}
                              height={18}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div
                              className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                              style={{ background: "#0d9488" }}
                            >
                              {dish.shop.name.charAt(0)}
                            </div>
                          )}
                          <span className="text-xs truncate max-w-[100px]" style={{ color: "#6b7280" }}>
                            {dish.shop.name}
                          </span>
                        </div>
                        <span className="text-sm font-bold" style={{ color: "#0d9488" }}>₹{dish.price}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          POPULAR KITCHENS STRIP
      ════════════════════════════════════════ */}
      {ready && shops.length > 0 && (
        <div className="w-full bg-white border-t" style={{ borderColor: "#f0fdfa" }}>
          <div className="container mx-auto px-4 lg:px-10 py-7">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: "#111827" }}>Popular Home Kitchens</h2>
              <Link
                href="/shops"
                className="text-sm font-semibold flex items-center gap-1 hover:underline"
                style={{ color: "#0d9488" }}
              >
                See all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {shops.map((shop, i) => (
                <motion.div
                  key={shop.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                  className="flex-shrink-0"
                >
                  <Link
                    href={`/shops/${shop.slug}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-150 hover:shadow-md hover:-translate-y-0.5"
                    style={{
                      background: "#fff",
                      border: "1.5px solid #e5e7eb",
                      minWidth: "200px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div
                      className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 border-2"
                      style={{ borderColor: "#e4f7f5" }}
                    >
                      {shop.logoUrl ? (
                        <Image
                          src={shop.logoUrl}
                          alt={shop.name}
                          width={44}
                          height={44}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-base font-bold text-white"
                          style={{ background: "#0d9488" }}
                        >
                          {shop.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: "#111827" }}>{shop.name}</p>
                      <p className="text-xs truncate mt-0.5" style={{ color: "#9ca3af" }}>{shop.address}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
