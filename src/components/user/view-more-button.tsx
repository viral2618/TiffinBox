"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ViewMoreButtonProps {
  href: string
  text?: string
  className?: string
}

export default function ViewMoreButton({
  href,
  text = "View All",
  className,
}: ViewMoreButtonProps) {
  return (
    <Link href={href}>
      <Button
        variant="outline"
        size="lg"
        className={cn(
          "group hover:bg-primary hover:text-primary-foreground transition-all duration-300 bg-transparent border-gray-300",
          className
        )}
      >
        {text}
        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </Button>
    </Link>
  )
}