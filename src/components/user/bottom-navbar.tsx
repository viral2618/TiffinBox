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
      <div
        className="flex justify-around h-16 items-center px-2"
        style={{
          background: 'rgba(240,253,250,0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1.5px solid #99f6e4',
          borderRadius: '9999px',
          boxShadow: '0 8px 32px rgba(13,148,136,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
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
                  style={{ color: isActive ? '#0d9488' : '#0f766e' }}
                />
                <span 
                  className={cn(
                    "text-xs transition-all", 
                    isActive ? "font-semibold" : ""
                  )}
                  style={{ color: isActive ? '#0d9488' : '#0f766e' }}
                >
                  {label}
                </span>
                {isActive && (
                  <div className="absolute -bottom-1 w-6 h-1 rounded-full" style={{ background: 'linear-gradient(90deg,#0d9488,#f59e0b)' }} />
                )}
              </Link>
            )
          })}
      </div>
    </nav>
  )
}