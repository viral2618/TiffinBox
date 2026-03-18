'use client';

import { useState, useEffect } from 'react';
import { OrderItem } from '@/types/recipe-management';
import { OrderStatus } from '@prisma/client';
import { Clock } from 'lucide-react';

interface StageTimerProps {
  order: OrderItem;
}

export function StageTimer({ order }: StageTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      let endTime: Date | null = null;
      const totalDelayMinutes = order.delays?.reduce((total, delay) => total + delay.minutes, 0) || 0;

      if (order.status === OrderStatus.PREP && order.prepStartTime && order.recipeTemplate) {
        const startTime = new Date(order.prepStartTime);
        endTime = new Date(startTime.getTime() + ((order.recipeTemplate.prepTime + totalDelayMinutes) * 60 * 1000));
      } else if (order.status === OrderStatus.BAKING && order.bakeStartTime && order.recipeTemplate) {
        const startTime = new Date(order.bakeStartTime);
        endTime = new Date(startTime.getTime() + ((order.recipeTemplate.bakeTime + totalDelayMinutes) * 60 * 1000));
      } else if (order.status === OrderStatus.COOLING && order.coolStartTime && order.recipeTemplate) {
        const startTime = new Date(order.coolStartTime);
        endTime = new Date(startTime.getTime() + ((order.recipeTemplate.coolTime + totalDelayMinutes) * 60 * 1000));
      }

      if (endTime) {
        const diff = endTime.getTime() - now.getTime();
        if (diff > 0) {
          const minutes = Math.floor(diff / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        } else {
          setTimeRemaining('0:00');
        }
      } else {
        setTimeRemaining('');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [order]);

  if (!timeRemaining || (order.status !== OrderStatus.PREP && order.status !== OrderStatus.BAKING && order.status !== OrderStatus.COOLING)) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 text-xs text-primary font-medium">
      <Clock className="h-3 w-3" />
      <span>{timeRemaining}</span>
    </div>
  );
}