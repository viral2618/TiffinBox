"use client";

import { useState, useEffect } from "react";
import { Bell, Star, Eye, LogIn } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'review' | 'shop_visit' | 'user_login';
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/owner/notifications');
      if (response.ok) {
        const data = await response.json();
        // Filter to only show review, shop_visit, and user_login notifications
        const filteredNotifications = data.notifications?.filter((n: Notification) => 
          ['review', 'shop_visit', 'user_login'].includes(n.type)
        ) || [];
        setNotifications(filteredNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'review':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'shop_visit':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'user_login':
        return <LogIn className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationLabel = (type: string) => {
    switch (type) {
      case 'review':
        return 'Review';
      case 'shop_visit':
        return 'Shop Visit';
      case 'user_login':
        return 'User Login';
      default:
        return 'Notification';
    }
  };

  if (loading) {
    return (
      <div className="p-3 sm:p-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold">Notifications</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Stay updated on user reviews, shop visits, and user activity
          </p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Notifications</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Stay updated on user reviews, shop visits, and user activity
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            User reviews, shop visits, and login activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No notifications yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start gap-3 p-4 rounded-lg border transition-colors hover:bg-accent/50"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium leading-tight">
                          {notification.title}
                        </h4>
                        <span className="text-xs px-2 py-1 bg-muted rounded-full">
                          {getNotificationLabel(notification.type)}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.message}
                      </p>

                      <span className="text-xs text-muted-foreground mt-2 block">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}