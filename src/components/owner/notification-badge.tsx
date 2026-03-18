"use client";

import { Bell, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDishNotifications } from "@/hooks/use-dish-notifications";

interface NotificationBadgeProps {
  className?: string;
  showUrgentOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function NotificationBadge({ 
  className, 
  showUrgentOnly = false, 
  size = "md" 
}: NotificationBadgeProps) {
  const { stats, isOwner, isConnected } = useDishNotifications();

  if (!isOwner) return null;

  const count = showUrgentOnly ? stats.urgentCount : stats.unreadCount;
  const isUrgent = showUrgentOnly || stats.urgentCount > 0;

  const sizeClasses = {
    sm: "h-7 w-7",
    md: "h-9 w-9", 
    lg: "h-11 w-11"
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };

  const badgeSizes = {
    sm: "h-4 w-4 text-xs",
    md: "h-5 w-5 text-xs", 
    lg: "h-6 w-6 text-sm"
  };

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "rounded-full hover:bg-accent relative",
          sizeClasses[size],
          isUrgent && count > 0 && "animate-pulse",
          !isConnected && "opacity-60"
        )}
        title={isConnected ? "Connected" : "Offline mode"}
      >
        {isUrgent && count > 0 ? (
          <AlertTriangle className={cn(iconSizes[size], "text-red-500")} />
        ) : (
          <Bell className={cn(iconSizes[size])} />
        )}
      </Button>
      
      {count > 0 && (
        <Badge
          variant={isUrgent ? "destructive" : "default"}
          className={cn(
            "absolute -top-1 -right-1 rounded-full p-0 flex items-center justify-center border-2 border-background",
            badgeSizes[size]
          )}
        >
          {count > 99 ? "99+" : count}
        </Badge>
      )}
    </div>
  );
}

export default NotificationBadge;