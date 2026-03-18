"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { motion } from "framer-motion"

interface HeroSectionProps {
  title?: string
  subtitle?: string
  primaryButtonText?: string
  onPrimaryClick?: () => void
}

export default function Hero({
  title = "Premium Fresh Food Marketplace",
  subtitle = "Connect with local artisan bakeries and discover exceptional fresh food. Quality ingredients, expert craftsmanship, delivered to your door.",
  primaryButtonText = "Explore Bakeries",
  onPrimaryClick,
}: HeroSectionProps) {
  return (
    <section className="relative min-h-screen overflow-hidden py-24" style={{ background: 'linear-gradient(135deg, #fef7ed 0%, #fef3e2 50%, #f3e8d3 100%)' }}>
      {/* Content Container */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-left max-w-2xl relative"
            >
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
                style={{ 
                  background: 'linear-gradient(135deg, #fc7c7c 0%, #f97316 50%, #dc2626 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-lg md:text-xl mb-8 leading-relaxed max-w-lg font-medium"
                style={{ color: '#451a03' }}
              >
                {subtitle}
              </motion.p>

              {/* Button */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex items-center gap-4"
              >
                <Button
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                  style={{ 
                    background: 'linear-gradient(135deg, #fc7c7c 0%, #f97316 100%)',
                    color: 'white',
                    border: 'none'
                  }}
                  onClick={onPrimaryClick}
                >
                  {primaryButtonText}
                </Button>
              </motion.div>
            </motion.div>

            {/* Right Content - Large Circle with Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative flex justify-center lg:justify-end"
            >
              <div className="relative">
                {/* Main Large Circle */}
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                  className="w-80 h-80 lg:w-[450px] lg:h-[450px] rounded-full shadow-2xl flex items-center justify-center overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(254,243,226,0.9) 50%, rgba(243,232,211,0.85) 100%)',
                    border: '3px solid rgba(252, 124, 124, 0.2)'
                  }}
                >
                  <div className="w-3/4 h-3/4 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fc7c7c 0%, #f97316 100%)' }}>
                    <div className="text-6xl lg:text-8xl font-bold text-white">🥖</div>
                  </div>
                </motion.div>

                {/* Secondary smaller circles for depth */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    x: [0, 5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                  className="absolute -bottom-8 -right-8 w-32 h-32 lg:w-40 lg:h-40 rounded-full backdrop-blur-sm flex items-center justify-center"
                  style={{ background: 'rgba(252, 124, 124, 0.2)' }}
                >
                  <div className="text-2xl lg:text-3xl">🧁</div>
                </motion.div>
                <motion.div
                  animate={{
                    y: [0, 8, 0],
                    x: [0, -3, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 2,
                  }}
                  className="absolute -top-6 -left-6 w-24 h-24 lg:w-32 lg:h-32 rounded-full backdrop-blur-sm flex items-center justify-center"
                  style={{ background: 'rgba(249, 115, 22, 0.2)' }}
                >
                  <div className="text-xl lg:text-2xl">🍞</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Connecting Arrow SVG - spans from text to image */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block">
        <svg className="w-full h-full" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="12"
              markerHeight="8"
              refX="10"
              refY="4"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon points="0,8 0,0 12,4" fill="hsl(10, 75%, 40%)" opacity="0.7" />
            </marker>
          </defs>

          {/* Curved path from button area to image */}
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ duration: 2, delay: 1.5 }}
            d="M 420 400 Q 600 280 800 380"
            stroke="hsl(10, 75%, 40%)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="12 8"
            markerEnd="url(#arrowhead)"
          />

          {/* Additional decorative curved line for depth */}
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{ duration: 2, delay: 2 }}
            d="M 430 420 Q 620 320 820 400"
            stroke="hsl(10, 75%, 40%)"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="8 12"
          />
        </svg>
      </div>

      {/* Animated Decorative Dots */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
        className="absolute top-16 right-16 w-3 h-3 bg-white/40 rounded-full"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, delay: 1 }}
        className="absolute top-32 right-32 w-2 h-2 bg-white/30 rounded-full"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, delay: 2 }}
        className="absolute bottom-32 left-16 w-2 h-2 bg-white/30 rounded-full"
      />
    </section>
  )
}
