"use client"

import { useState, useEffect } from "react"
import { Bell, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Notification {
  id: number
  title: string
  message: string
  createdAt: string
  isRead: boolean
  type: 'favorite' | 'review' | 'order' | 'general'
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  
  const unreadCount = notifications.filter(n => !n.isRead).length
  
  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    )
  }
  
  const deleteNotification = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }
  
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, isRead: true })))
  }
  
  // Add new notification when user performs actions
  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(),
      createdAt: 'now'
    }
    setNotifications(prev => [newNotification, ...prev])
  }
  
  // Listen for custom events to add notifications
  useEffect(() => {
    const handleFavoriteAdded = (event: CustomEvent) => {
      addNotification({
        title: "Added to favorites",
        message: `${event.detail.name} has been added to your favorites`,
        isRead: false,
        type: 'favorite'
      })
    }
    
    const handleReviewSubmitted = (event: CustomEvent) => {
      addNotification({
        title: "Review submitted",
        message: `Your review for ${event.detail.name} has been submitted`,
        isRead: false,
        type: 'review'
      })
    }
    
    const handleFeedbackSubmitted = (event: CustomEvent) => {
      addNotification({
        title: "Feedback submitted",
        message: `Your feedback for ${event.detail.category} has been submitted successfully`,
        isRead: false,
        type: 'general'
      })
    }
    
    window.addEventListener('favoriteAdded', handleFavoriteAdded as EventListener)
    window.addEventListener('reviewSubmitted', handleReviewSubmitted as EventListener)
    window.addEventListener('feedbackSubmitted', handleFeedbackSubmitted as EventListener)
    
    return () => {
      window.removeEventListener('favoriteAdded', handleFavoriteAdded as EventListener)
      window.removeEventListener('reviewSubmitted', handleReviewSubmitted as EventListener)
      window.removeEventListener('feedbackSubmitted', handleFeedbackSubmitted as EventListener)
    }
  }, [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative h-10 w-10"
          style={{ backgroundColor: 'transparent' }}
        >
          <Bell className="h-5 w-5" style={{ color: '#451a03' }} />
          {unreadCount > 0 && (
            <span 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs font-medium flex items-center justify-center"
              style={{ backgroundColor: '#fc7c7c', color: 'white' }}
            >
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-80" 
        align="end"
        style={{ 
          backgroundColor: '#fef3e2', 
          color: '#451a03', 
          border: '1px solid rgba(69, 26, 3, 0.2)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        <DropdownMenuLabel style={{ color: '#451a03' }}>
          Notifications ({unreadCount} unread)
        </DropdownMenuLabel>
        <DropdownMenuSeparator style={{ backgroundColor: 'rgba(69, 26, 3, 0.1)' }} />
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm" style={{ color: '#92400e' }}>
            No notifications yet
          </div>
        ) : (
          notifications.map((notification) => (
          <DropdownMenuItem 
            key={notification.id} 
            className="cursor-pointer p-3 relative group"
            style={{ color: '#451a03', backgroundColor: notification.isRead ? 'transparent' : 'rgba(252, 124, 124, 0.05)' }}
            onClick={() => markAsRead(notification.id)}
          >
            <div className="flex flex-col space-y-1 w-full pr-8">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{notification.title}</p>
                <div className="flex items-center gap-2">
                  {notification.isRead && (
                    <Check className="w-3 h-3 text-green-500" />
                  )}
                  {!notification.isRead && (
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  )}
                </div>
              </div>
              <p className="text-xs" style={{ color: '#92400e' }}>{notification.message}</p>
              <p className="text-xs" style={{ color: '#92400e' }}>{notification.createdAt}</p>
            </div>
            <button
              onClick={(e) => deleteNotification(notification.id, e)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
              title="Delete notification"
            >
              <X className="w-3 h-3" style={{ color: '#dc2626' }} />
            </button>
          </DropdownMenuItem>
          ))
        )}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator style={{ backgroundColor: 'rgba(69, 26, 3, 0.1)' }} />
            {unreadCount > 0 && (
              <DropdownMenuItem 
                className="cursor-pointer text-center"
                style={{ color: '#fc7c7c' }}
                onClick={markAllAsRead}
              >
                Mark all as read
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              className="cursor-pointer text-center"
              style={{ color: '#fc7c7c' }}
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}