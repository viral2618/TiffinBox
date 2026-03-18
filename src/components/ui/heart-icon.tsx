interface HeartIconProps {
  className?: string
  filled?: boolean
}

export default function HeartIcon({ className = "w-4 h-4", filled = false }: HeartIconProps) {
  return (
    <svg 
      className={className}
      viewBox="0 0 24 24" 
      fill={filled ? "currentColor" : "none"} 
      stroke="currentColor" 
      strokeWidth="2"
    >
      {/* Replace this SVG path with your custom heart icon */}
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}