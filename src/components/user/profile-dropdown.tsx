"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, Heart } from "lucide-react"

export default function ProfileDropdown() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  if (!session?.user) {
    return (
      <Button 
        variant="outline" 
        onClick={() => router.push('/auth')}
        style={{ 
          backgroundColor: '#fef3e2', 
          color: '#451a03', 
          border: '1px solid rgba(69, 26, 3, 0.2)' 
        }}
      >
        Sign In
      </Button>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-10 w-10 rounded-full"
          style={{ backgroundColor: 'transparent' }}
        >
          <Avatar className="h-10 w-10 border-2" style={{ borderColor: '#fc7c7c' }}>
            <AvatarImage src={session.user.image || ""} alt={session.user.name || "User"} />
            <AvatarFallback 
              className="text-sm font-medium"
              style={{ backgroundColor: '#fef3e2', color: '#451a03' }}
            >
              {session.user.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56 dropdown-content" 
        align="end" 
        forceMount
        style={{ 
          backgroundColor: '#fef3e2', 
          color: '#451a03', 
          border: '1px solid rgba(69, 26, 3, 0.2)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        <DropdownMenuLabel className="font-normal" style={{ color: '#451a03' }}>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none" style={{ color: '#451a03' }}>
              {session.user.name}
            </p>
            <p className="text-xs leading-none" style={{ color: '#92400e' }}>
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator style={{ backgroundColor: 'rgba(69, 26, 3, 0.1)' }} />
        <DropdownMenuItem 
          onClick={() => {
            router.push('/profile')
            setIsOpen(false)
          }}
          className="cursor-pointer"
          style={{ color: '#451a03' }}
        >
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => {
            router.push('/favorites')
            setIsOpen(false)
          }}
          className="cursor-pointer"
          style={{ color: '#451a03' }}
        >
          <Heart className="mr-2 h-4 w-4" />
          <span>Favorites</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator style={{ backgroundColor: 'rgba(69, 26, 3, 0.1)' }} />
        <DropdownMenuItem 
          onClick={() => {
            signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL || window.location.origin })
            setIsOpen(false)
          }}
          className="cursor-pointer"
          style={{ color: '#dc2626' }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}