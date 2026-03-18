"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle } from "lucide-react";

interface PreparationSlot {
  id: string;
  slotId: string;
  startedAt: string;
  prepTimeMinutes: number;
  servingStartsAt: string;
  endedAt?: string;
  status: "PREPARING" | "SERVING" | "SOLD_OUT";
}

interface DishStatusBadgeProps {
  dishId: string;
  autoRefresh?: boolean;
}

export default function DishStatusBadge({ dishId, autoRefresh = true }: DishStatusBadgeProps) {
  const [slot, setSlot] = useState<PreparationSlot | null>(null);
  const [status, setStatus] = useState<string>("INACTIVE");
  const [minutesLeft, setMinutesLeft] = useState<number>(0);

  useEffect(() => {
    fetchStatus();
    
    if (autoRefresh) {
      const interval = setInterval(fetchStatus, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
    return undefined;
  }, [dishId, autoRefresh]);

  // Update countdown every minute
  useEffect(() => {
    if (slot && status === "PREPARING") {
      const interval = setInterval(() => {
        const now = new Date();
        const servingTime = new Date(slot.servingStartsAt);
        const mins = Math.ceil((servingTime.getTime() - now.getTime()) / 60000);
        setMinutesLeft(mins);
        
        // Refresh status if time has passed
        if (mins <= 0) {
          fetchStatus();
        }
      }, 60000);
      
      return () => clearInterval(interval);
    }
    return undefined;
  }, [slot, status]);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/owner/dishes/${dishId}/preparation-slot`);
      if (response.ok) {
        const data = await response.json();
        setSlot(data.slot);
        setStatus(data.status || data.slot?.status || "INACTIVE");
        
        if (data.slot && data.status === "PREPARING") {
          const now = new Date();
          const servingTime = new Date(data.slot.servingStartsAt);
          const mins = Math.ceil((servingTime.getTime() - now.getTime()) / 60000);
          setMinutesLeft(mins);
        }
      }
    } catch (error) {
      console.error("Error fetching dish status:", error);
    }
  };

  if (!slot || status === "INACTIVE") {
    return (
      <Badge variant="secondary" className="gap-1">
        <XCircle className="h-3 w-3" />
        Not Available
      </Badge>
    );
  }

  if (status === "PREPARING") {
    return (
      <Badge variant="default" className="bg-blue-500 gap-1">
        <Clock className="h-3 w-3" />
        Preparing (Ready in {minutesLeft} mins)
      </Badge>
    );
  }

  if (status === "SERVING") {
    return (
      <Badge variant="default" className="bg-green-500 gap-1 animate-pulse">
        <CheckCircle className="h-3 w-3" />
        Serving Now - Fresh Batch!
      </Badge>
    );
  }

  if (slot.status === "SOLD_OUT") {
    const servingTime = new Date(slot.servingStartsAt);
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" />
        Sold Out (Last: {servingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
      </Badge>
    );
  }

  return null;
}
