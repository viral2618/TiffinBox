"use client"

import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { UtensilsCrossed, Star, Clock, ArrowRight, ChevronLeft, ChevronRight as ChevronRightIcon } from "lucide-react"
import { useState, useEffect } from "react"

interface HeroSectionProps {
  title?: string
  subtitle?: string
  primaryButtonText?: string
  onPrimaryClick?: () => void
}

const SLIDES = [
  {
    bg: "linear-gradient(145deg, #f0fdfa 0%, #ccfbf1 100%)",
    emoji: "🍛",
    label: "Dal Makhani Thali",
    sub: "Slow-cooked, full of love",
    accent: "#0d9488",
  },
  {
    bg: "linear-gradient(145deg, #fffbeb 0%, #fef3c7 100%)",
    emoji: "🥘",
    label: "Rajma Chawal",
    sub: "North Indian comfort food",
    accent: "#f59e0b",
  },
  {
    bg: "linear-gradient(145deg, #fdf2f8 0%, #fce7f3 100%)",
    emoji: "🫓",
    label: "Stuffed Paratha",
    sub: "Crispy, buttery & fresh",
    accent: "#ec4899",
  },
  {
    bg: "linear-gradient(145deg, #eff6ff 0%, #dbeafe 100%)",
    emoji: "🍲",
    label: "Sambar Rice",
    sub: "South Indian home style",
    accent: "#3b82f6",
  },
]

const STATS = [
  { icon: UtensilsCrossed, value: "500+", label: "Home Kitchens" },
  { icon: Star, value: "4.8", label: "Average Rating" },
  { icon: Clock, value: "30 min", label: "Avg. Delivery" },
]

export default function Hero({
  title = "Taste of Home, Away From Home",
  subtitle = "Connect with local home cooks and enjoy the comfort of homemade meals — fresh, wholesome, and made with care.",
  primaryButtonText = "Find Home Kitchens",
  onPrimaryClick,
}: HeroSectionProps) {
  return (
    <section className="relative min-h-screen overflow-hidden flex items-center bg-white">

      {/* Left accent strip */}
      <div
        className="absolute left-0 top-0 h-full w-1.5"
        style={{ background: "linear-gradient(180deg, #0d9488 0%, #f59e0b 100%)" }}
      />

      {/* Subtle background tint */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(120deg, #f0fdfa 0%, #ffffff 60%, #fffbeb 100%)" }}
      />

      {/* Decorative grid lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#134e4a 1px, transparent 1px), linear-gradient(90deg, #134e4a 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full">
        <div className="container mx-auto px-6 lg:px-16 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-20 items-center">

            {/* Left — Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-8"
            >
              {/* Label */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="h-px w-10" style={{ backgroundColor: "#0d9488" }} />
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#0d9488" }}>
                  Home-cooked meals, delivered
                </span>
              </motion.div>

              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.15] tracking-tight"
                style={{ color: "#0c1a19" }}
              >
                {title.split(",").map((part, i) => (
                  <span key={i}>
                    {i === 1 ? (
                      <>
                        ,{" "}
                        <span style={{ color: "#0d9488" }}>{part.trim()}</span>
                      </>
                    ) : (
                      part
                    )}
                  </span>
                ))}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="text-base md:text-lg leading-relaxed max-w-lg"
                style={{ color: "#4b7a75" }}
              >
                {subtitle}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-wrap gap-4"
              >
                <Button
                  size="lg"
                  className="group px-8 h-12 text-sm font-semibold rounded-none transition-all duration-300"
                  style={{ background: "#0d9488", color: "white", border: "none" }}
                  onClick={onPrimaryClick}
                >
                  {primaryButtonText}
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 h-12 text-sm font-semibold rounded-none"
                  style={{ borderColor: "#0d9488", color: "#0d9488" }}
                >
                  How it works
                </Button>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.65 }}
                className="flex flex-wrap gap-8 pt-4 border-t"
                style={{ borderColor: "rgba(13,148,136,0.15)" }}
              >
                {STATS.map(({ icon: Icon, value, label }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 flex items-center justify-center"
                      style={{ background: "rgba(13,148,136,0.08)", borderLeft: "2px solid #0d9488" }}
                    >
                      <Icon className="w-4 h-4" style={{ color: "#0d9488" }} />
                    </div>
                    <div>
                      <p className="text-base font-bold leading-none" style={{ color: "#0c1a19" }}>{value}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#4b7a75" }}>{label}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — Visual Panel with Slider */}
            <HeroSlider />

          </div>
        </div>
      </div>
    </section>
  )
}

function HeroSlider() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const prev = () => setCurrent((p) => (p - 1 + SLIDES.length) % SLIDES.length)
  const next = () => setCurrent((p) => (p + 1) % SLIDES.length)

  const slide = SLIDES[current]

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="relative hidden lg:flex justify-end"
    >
      <div className="relative w-[480px] h-[520px]">

        {/* Slider main card */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ border: "1px solid rgba(13,148,136,0.2)" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-6"
              style={{ background: slide.bg }}
            >
              {/* Big emoji as food visual */}
              <div className="text-[120px] leading-none select-none drop-shadow-lg">
                {slide.emoji}
              </div>

              {/* Dish name tag */}
              <div
                className="px-5 py-2 text-sm font-bold uppercase tracking-widest"
                style={{ background: slide.accent, color: "#fff" }}
              >
                {slide.label}
              </div>
              <p className="text-sm font-medium" style={{ color: "#4b7a75" }}>
                {slide.sub}
              </p>

              {/* Bottom gradient overlay */}
              <div
                className="absolute bottom-0 left-0 right-0 h-24"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.04), transparent)" }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Prev / Next arrows */}
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white shadow-md hover:shadow-lg transition-shadow"
            style={{ border: "1px solid rgba(13,148,136,0.2)" }}
          >
            <ChevronLeft className="w-4 h-4" style={{ color: "#0d9488" }} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white shadow-md hover:shadow-lg transition-shadow"
            style={{ border: "1px solid rgba(13,148,136,0.2)" }}
          >
            <ChevronRightIcon className="w-4 h-4" style={{ color: "#0d9488" }} />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="transition-all duration-300"
                style={{
                  width: i === current ? "20px" : "8px",
                  height: "8px",
                  borderRadius: "4px",
                  background: i === current ? slide.accent : "rgba(13,148,136,0.25)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Floating info card — bottom left */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="absolute -bottom-5 -left-10 px-5 py-4 bg-white shadow-xl"
          style={{ border: "1px solid rgba(13,148,136,0.15)", minWidth: "180px" }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#0d9488" }}>
            Today's Special
          </p>
          <p className="text-sm font-bold" style={{ color: "#0c1a19" }}>{SLIDES[current].label}</p>
          <p className="text-xs mt-0.5" style={{ color: "#4b7a75" }}>Ready in 25 min</p>
        </motion.div>

        {/* Floating rating card — top right */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="absolute -top-5 -right-8 px-4 py-3 bg-white shadow-xl flex items-center gap-3"
          style={{ border: "1px solid rgba(13,148,136,0.15)" }}
        >
          <div
            className="w-8 h-8 flex items-center justify-center flex-shrink-0"
            style={{ background: "#0d9488" }}
          >
            <Star className="w-4 h-4 fill-white text-white" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none" style={{ color: "#0c1a19" }}>4.9 / 5.0</p>
            <p className="text-xs mt-0.5" style={{ color: "#4b7a75" }}>2,400+ reviews</p>
          </div>
        </motion.div>

        {/* Accent border offset */}
        <div
          className="absolute -bottom-2 -right-2 w-full h-full -z-10"
          style={{ border: "1px solid rgba(245,158,11,0.3)" }}
        />
      </div>
    </motion.div>
  )
}
