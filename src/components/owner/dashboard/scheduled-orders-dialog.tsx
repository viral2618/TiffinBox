'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { OrderItem } from '@/types/recipe-management';
import { OrderCard } from './order-card';

interface ScheduledOrdersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orders: OrderItem[];
  onStart: (order: OrderItem) => void;
  onComplete: (order: OrderItem) => void;
  onAddDelay: (order: OrderItem) => void;
  onScheduleStart: (order: OrderItem) => void;
}

export function ScheduledOrdersDialog({ 
  open, 
  onOpenChange, 
  orders, 
  onStart, 
  onComplete, 
  onAddDelay, 
  onScheduleStart 
}: ScheduledOrdersDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>All Scheduled Orders ({orders.length})</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStart={() => onStart(order)}
              onComplete={() => onComplete(order)}
              onAddDelay={() => onAddDelay(order)}
              onScheduleStart={() => onScheduleStart(order)}
              variant="scheduled"
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}