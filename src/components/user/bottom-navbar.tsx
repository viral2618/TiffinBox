"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Store, Soup, LayoutGrid, Heart, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/shops", label: "Bakeries", icon: Store },
  { href: "/dishes", label: "Dishes", icon: Soup },
  { href: "/categories", label: "Categories", icon: LayoutGrid },
  { href: "/favorites", label: "Favorites", icon: Heart },
]

const ownerNavLink = { href: "/owner/dashboard", label: "Dashboard", icon: Settings }

export default function BottomNavbar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  // Hide bottom navigation on owner pages
  if (pathname.startsWith('/owner')) {
    return null
  }

  // Add dashboard link for owners
  const displayLinks = session?.user?.role === 'owner' 
    ? [...navLinks, ownerNavLink]
    : navLinks

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden w-[95%] max-w-md">
      <div className="bottom-navbar bg-background/95 backdrop-blur-md border border-border/20 rounded-full shadow-xl" style={{ backgroundColor: 'rgba(254, 247, 237, 0.95)', border: '1px solid rgba(69, 26, 3, 0.1)' }}>
        <div className="flex justify-around h-16 items-center">
          {displayLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link key={label} href={href} className="relative flex flex-col items-center justify-center space-y-1 w-16 h-16">
                <Icon 
                  className={cn(
                    "w-6 h-6 transition-all", 
                    isActive ? "text-primary" : "text-foreground/70"
                  )} 
                  fill={isActive ? "currentColor" : "none"} 
                  style={{ color: isActive ? '#fc7c7c' : '#451a03' }}
                />
                <span 
                  className={cn(
                    "text-xs transition-all", 
                    isActive ? "text-primary font-semibold" : "text-foreground/70"
                  )}
                  style={{ color: isActive ? '#fc7c7c' : '#451a03' }}
                >
                  {label}
                </span>
                {isActive && (
                  <div className="absolute -bottom-1 w-8 h-1 bg-primary rounded-full" style={{ backgroundColor: '#fc7c7c' }} />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}