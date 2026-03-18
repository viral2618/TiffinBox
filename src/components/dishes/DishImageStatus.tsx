"use client";

import { useState, useEffect } from "react";

interface DishImageStatusProps {
  dishId: string;
}

export default function DishImageStatus({ dishId }: DishImageStatusProps) {
  const [status, setStatus] = useState<string>("Available Now");
  const [statusColor, setStatusColor] = useState<string>("text-green-600");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/owner/dishes/${dishId}/preparation-slot`);
        if (response.ok) {
          const data = await response.json();
          if (data.slot) {
            if (data.slot.status === 'SOLD_OUT') {
              const servingTime = new Date(data.slot.servingStartsAt);
              setStatus(`Sold Out (Last: ${servingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`);
              setStatusColor("text-red-600");
            } else if (data.status === 'PREPARING') {
              const now = new Date();
              const servingTime = new Date(data.slot.servingStartsAt);
              const minutesLeft = Math.ceil((servingTime.getTime() - now.getTime()) / 60000);
              setStatus(`Preparing (${minutesLeft} mins)`);
              setStatusColor("text-yellow-600");
            } else if (data.status === 'SERVING') {
              setStatus('Serving Now');
              setStatusColor("text-green-600");
            }
          } else {
            setStatus('Not Available');
            setStatusColor("text-gray-600");
          }
        }
      } catch (error) {
        console.error('Error fetching status:', error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [dishId]);

  return (
    <span className={`text-sm font-medium ${statusColor} bg-white/90 px-3 py-1 rounded-md shadow-sm`}>
      {status}
    </span>
  );
}
