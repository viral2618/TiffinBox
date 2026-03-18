"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import { useSession } from "next-auth/react"
import {
  IconDashboard,
  IconFolder,
  IconFileAi,
  IconSettings,
  IconFileDescription,
  IconFileWord,
  IconHelp,
  IconInnerShadowTop,
  IconHome,
} from "@tabler/icons-react"

import { OwnerNavUser } from "@/components/owner-nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar"

const navItems = [
  {
    title: "Home",
    url: "/",
    icon: IconHome,
  },
  {
    title: "Dashboard",
    url: "/owner/dashboard",
    icon: IconDashboard,
  },
  {
    title: "My Dishes",
    url: "/owner/dashboard/my-dishes",
    icon: IconInnerShadowTop,
  },
  {
    title: "Add Dish",
    url: "/owner/dashboard/add-dish",
    icon: IconFileAi,
  },
  {
    title: "My Shop",
    url: "/owner/dashboard/my-shops",
    icon: IconFolder,
  },
  {
    title: "Create Shop",
    url: "/owner/dashboard/my-shops/create",
    icon: IconFileAi,
  },
  {
    title: "Settings",
    url: "/owner/dashboard/settings",
    icon: IconSettings,
  },
]

const legalLinks = [
  {
    title: "Privacy Policy",
    url: "/privacy-policy",
    icon: IconFileDescription,
  },
  {
    title: "Terms of Service",
    url: "/terms-of-service",
    icon: IconFileWord,
  },
  {
    title: "Help Center",
    url: "/help",
    icon: IconHelp,
  },
]

// Simple inline nav components
function NavMain({ items }: { items: typeof navItems }) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()
  const { data: session } = useSession()
  const [hasShop, setHasShop] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  
  // Check if user has a shop
  React.useEffect(() => {
    const checkShop = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/owner/shops')
          if (response.ok) {
            const data = await response.json()
            setHasShop(data.shops && data.shops.length > 0)
          }
        } catch (error) {
          console.error('Error checking shop:', error)
        } finally {
          setLoading(false)
        }
      }
    }
    
    checkShop()
  }, [session?.user?.id])
  
  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }
  
  // Filter out "Create Shop" if user already has a shop
  const filteredItems = loading ? items : items.filter(item => {
    if (item.title === "Create Shop" && hasShop) {
      return false
    }
    return true
  })
  
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {filteredItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.url}
                className="text-white hover:text-white"
                style={{
                  backgroundColor: pathname === item.url ? 'rgba(255,255,255,0.2)' : 'transparent',
                  color: 'white'
                }}
              >
                <Link href={item.url} onClick={handleLinkClick}>
                  <item.icon className="!size-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

function NavSecondary({ items, className }: { items: typeof legalLinks; className?: string }) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()
  
  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }
  
  return (
    <SidebarGroup className={className}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.url}
                className="text-white hover:text-white"
                style={{
                  backgroundColor: pathname === item.url ? 'rgba(255,255,255,0.2)' : 'transparent',
                  color: 'white'
                }}
              >
                <Link href={item.url} onClick={handleLinkClick}>
                  <item.icon className="!size-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function OwnerSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isMobile, setOpenMobile } = useSidebar()
  const pathname = usePathname()
  
  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }
  
  const isActive = (url: string) => {
    return pathname === url
  }
  
  return (
    <Sidebar 
      collapsible="offcanvas" 
      className="text-background" 
      style={{ backgroundColor: '#fc7c7c' }}
      {...props}
    >
      <SidebarHeader 
        className="text-background" 
        style={{ backgroundColor: '#fc7c7c' }}
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/")}
              className="data-[slot=sidebar-menu-button]:!p-1.5 text-white hover:text-white"
              style={{ 
                backgroundColor: isActive("/") ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: 'white'
              }}
            >
              <Link href="/" onClick={handleLinkClick}>
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">When Fresh</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent 
        className="text-background" 
        style={{ backgroundColor: '#fc7c7c' }}
      >
        <NavMain items={navItems} />
        <NavSecondary items={legalLinks} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter 
        className="text-background" 
        style={{ backgroundColor: '#fc7c7c' }}
      >
        <OwnerNavUser />
      </SidebarFooter>
    </Sidebar>
  )
}