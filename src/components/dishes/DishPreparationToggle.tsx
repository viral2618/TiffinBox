"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, Square } from "lucide-react";
import { toast } from "sonner";

interface PreparationSlot {
  id: string;
  slotId: string;
  startedAt: string;
  prepTimeMinutes: number;
  servingStartsAt: string;
  endedAt?: string;
  status: "PREPARING" | "SERVING" | "SOLD_OUT";
}

interface DishPreparationToggleProps {
  dishId: string;
  dishName: string;
}

export default function DishPreparationToggle({ dishId, dishName }: DishPreparationToggleProps) {
  const [slot, setSlot] = useState<PreparationSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("INACTIVE");

  // Poll for status updates every 30 seconds
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [dishId]);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/owner/dishes/${dishId}/preparation-slot`);
      if (response.ok) {
        const data = await response.json();
        setSlot(data.slot);
        setStatus(data.status);
      }
    } catch (error) {
      console.error("Error fetching status:", error);
    }
  };

  const handleToggleOn = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/owner/dishes/${dishId}/preparation-slot`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setSlot(data.slot);
        setStatus("PREPARING");
        toast.success("Preparation started!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to start preparation");
      }
    } catch (error) {
      toast.error("Failed to start preparation");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOff = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/owner/dishes/${dishId}/preparation-slot`, {
        method: "PATCH",
      });

      if (response.ok) {
        const data = await response.json();
        setSlot(data.slot);
        setStatus("SOLD_OUT");
        toast.success("Marked as sold out");
      } else {
        toast.error("Failed to mark as sold out");
      }
    } catch (error) {
      toast.error("Failed to mark as sold out");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!slot || status === "INACTIVE") {
      return <Badge variant="secondary">Not Started</Badge>;
    }

    if (status === "PREPARING") {
      const now = new Date();
      const servingTime = new Date(slot.servingStartsAt);
      const minutesLeft = Math.ceil((servingTime.getTime() - now.getTime()) / 60000);
      return (
        <Badge variant="default" className="bg-blue-500">
          Preparing (Ready in {minutesLeft} mins)
        </Badge>
      );
    }

    if (status === "SERVING") {
      return (
        <Badge variant="default" className="bg-green-500">
          Serving Now
        </Badge>
      );
    }

    if (slot.status === "SOLD_OUT") {
      const servingTime = new Date(slot.servingStartsAt);
      return (
        <Badge variant="destructive">
          Sold Out (Last: {servingTime.toLocaleTimeString()})
        </Badge>
      );
    }

    return null;
  };

  const isActive = slot && (status === "PREPARING" || status === "SERVING");

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg">
      <div className="flex-1">
        <h3 className="font-semibold">{dishName}</h3>
        <div className="mt-2">{getStatusBadge()}</div>
      </div>

      <div className="flex gap-2">
        {!isActive ? (
          <Button
            onClick={handleToggleOn}
            disabled={loading}
            size="sm"
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Start Preparing
          </Button>
        ) : (
          <Button
            onClick={handleToggleOff}
            disabled={loading}
            variant="destructive"
            size="sm"
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            Mark Sold Out
          </Button>
        )}
      </div>
    </div>
  );
}
