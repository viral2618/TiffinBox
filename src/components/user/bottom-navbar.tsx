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
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 md:hidden w-[92%] max-w-sm">
      <div
        className="flex justify-around h-14 items-center px-1"
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
              <Link key={label} href={href} className="relative flex flex-col items-center justify-center space-y-0.5 w-14 h-14">
                {/* Active pill background */}
                {isActive && (
                  <div
                    className="absolute top-1.5 rounded-full"
                    style={{ width: '36px', height: '28px', background: 'rgba(13,148,136,0.12)' }}
                  />
                )}
                <Icon
                  className="w-5 h-5 transition-all relative z-10"
                  strokeWidth={isActive ? 2.5 : 1.8}
                  style={{ color: isActive ? '#0d9488' : '#6b7280' }}
                />
                <span
                  className="text-[10px] transition-all relative z-10"
                  style={{ color: isActive ? '#0d9488' : '#6b7280', fontWeight: isActive ? 600 : 400 }}
                >
                  {label}
                </span>
              </Link>
            )
          })}
      </div>
    </nav>
  )
}