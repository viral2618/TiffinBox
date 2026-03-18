"use client"

import { cn } from "@/lib/utils"
import { TYPOGRAPHY } from "@/lib/constants"

interface SectionTitleProps {
  title: string
  subtitle?: string
  className?: string
  titleClassName?: string
  subtitleClassName?: string
}

export default function SectionTitle({
  title,
  subtitle,
  className,
  titleClassName,
  subtitleClassName,
}: SectionTitleProps) {
  return (
    <div className={cn("mb-8", className)}>
      <h2 className={cn(TYPOGRAPHY.sectionTitle, titleClassName)}>
        {title}
      </h2>
      {subtitle && (
        <p className={cn(TYPOGRAPHY.sectionSubtitle, subtitleClassName)}>
          {subtitle}
        </p>
      )}
    </div>
  )
}