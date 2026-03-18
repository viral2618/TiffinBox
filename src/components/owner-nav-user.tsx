"use client"

import { useEffect, useState } from "react"
import { signOut, useSession } from "next-auth/react"
import {
  IconDotsVertical,
  IconLogout,
  IconSettings,
  IconUserCircle,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface OwnerData {
  id: string
  name: string
  email: string
  isOnboarded: boolean
  phone: string | null
}

export function OwnerNavUser() {
  const { isMobile } = useSidebar()
  const { data: session } = useSession()
  const router = useRouter()
  const [owner, setOwner] = useState<OwnerData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        const response = await fetch('/api/owner/me')
        if (response.ok) {
          const data = await response.json()
          setOwner(data.owner)
        } else {
          console.error('Failed to fetch owner data')
          // If unauthorized, sign out
          if (response.status === 401) {
            signOut({ redirect: false })
            router.push('/owner/login')
          }
        }
      } catch (error) {
        console.error('Error fetching owner data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.role === 'owner' && session?.user?.id) {
      fetchOwnerData()
    } else {
      setLoading(false)
    }
  }, [session, router])

  const handleLogout = async () => {
    await signOut({ 
      redirect: false,
      callbackUrl: process.env.NEXT_PUBLIC_APP_URL || window.location.origin 
    })
    router.push('/auth/login')
  }



  if (loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="text-background hover:bg-foreground/80 hover:text-background"
          >
            <Loader2 className="h-5 w-5 animate-spin" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Loading...</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  if (!owner) {
    return null
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-foreground/80 data-[state=open]:text-background text-background hover:bg-foreground/80 hover:text-background"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-background text-foreground">
                  {getInitials(owner.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{owner.name}</span>
                <span className="text-background/70 truncate text-xs">
                  {owner.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">{getInitials(owner.name)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{owner.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {owner.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <IconLogout className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}