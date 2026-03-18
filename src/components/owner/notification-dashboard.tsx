"use client";

import { useState, useEffect } from "react";
import { Bell, Clock, AlertTriangle, CheckCircle, X, Wifi, WifiOff } from "lucide-react";
import { useDishNotifications } from "@/hooks/use-dish-notifications";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface NotificationStats {
  unreadCount: number;
  urgentCount: number;
  todayCount: number;
}

interface DishNotification {
  id: string;
  title: string;
  message: string;
  type: 'dish_stage' | 'dish_ready' | 'dish_delayed' | 'dish_urgent';
  isRead: boolean;
  createdAt: string;
  data?: {
    orderId: string;
    dishId: string;
    stage: string;
    priority: string;
  };
}

export function NotificationDashboard() {
  const {
    notifications,
    stats,
    loading,
    error,
    fetchNotifications,
    fetchStats,
    markAsRead,
    isConnected
  } = useDishNotifications();
  
  const [activeTab, setActiveTab] = useState("all");



  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'dish_urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'dish_ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'dish_delayed':
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    const badges = {
      dish_urgent: { label: "Urgent", variant: "destructive" as const },
      dish_ready: { label: "Ready", variant: "default" as const },
      dish_delayed: { label: "Delayed", variant: "secondary" as const },
      dish_stage: { label: "Update", variant: "outline" as const }
    };
    return badges[type as keyof typeof badges] || badges.dish_stage;
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (activeTab) {
      case 'unread':
        return !notification.isRead;
      case 'urgent':
        return notification.type === 'dish_urgent';
      case 'ready':
        return notification.type === 'dish_ready';
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dish Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadCount}</div>
            <p className="text-xs text-muted-foreground">New notifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.urgentCount}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayCount}</div>
            <p className="text-xs text-muted-foreground">Total today</p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>Dish Notifications</CardTitle>
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
              </div>
              <CardDescription>
                Track your dish preparation progress
                {!isConnected && " (Offline mode)"}
              </CardDescription>
            </div>
            {stats.unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAsRead()}
              >
                Mark all read
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
              <TabsTrigger value="unread" className="text-xs sm:text-sm">
                Unread
                <span className="hidden sm:inline ml-1">
                  {stats.unreadCount > 0 && `(${stats.unreadCount})`}
                </span>
              </TabsTrigger>
              <TabsTrigger value="urgent" className="text-xs sm:text-sm">
                Urgent
                <span className="hidden sm:inline ml-1">
                  {stats.urgentCount > 0 && `(${stats.urgentCount})`}
                </span>
              </TabsTrigger>
              <TabsTrigger value="ready" className="text-xs sm:text-sm">Ready</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <ScrollArea className="h-[500px]">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No notifications in this category
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "flex items-start gap-3 p-4 rounded-lg border transition-colors",
                          !notification.isRead && "bg-accent/30 border-accent",
                          notification.type === 'dish_urgent' && "border-red-200 bg-red-50/50"
                        )}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-medium leading-tight">
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <Badge {...getNotificationBadge(notification.type)}>
                                {getNotificationBadge(notification.type).label}
                              </Badge>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>

                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead([notification.id])}
                                className="h-auto p-1 text-xs"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default NotificationDashboard;