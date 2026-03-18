'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OrderItem } from '@/types/recipe-management';

interface ScheduleStartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (startTime: Date) => void;
  orderItem: OrderItem | null;
}

export function ScheduleStartDialog({ open, onOpenChange, onSubmit, orderItem }: ScheduleStartDialogProps) {
  const [selectedTime, setSelectedTime] = useState<string>('');

  const handleSubmit = () => {
    if (!selectedTime) return;
    
    const startTime = new Date(selectedTime);
    onSubmit(startTime);
    
    // Reset form
    setSelectedTime('');
  };

  const canSubmit = selectedTime && new Date(selectedTime) > new Date();

  // Get current time in YYYY-MM-DDTHH:MM format for input
  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Start Time</DialogTitle>
        </DialogHeader>
        
        {orderItem && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium">{orderItem.dish?.name}</h4>
            <p className="text-sm text-muted-foreground">
              Quantity: {orderItem.quantity} | 
              Requested by: {new Date(orderItem.requestedBy).toLocaleTimeString()}
            </p>
            {orderItem.recipeTemplate && (
              <p className="text-sm text-muted-foreground">
                Total time: {orderItem.recipeTemplate.prepTime + orderItem.recipeTemplate.bakeTime + orderItem.recipeTemplate.coolTime} minutes
              </p>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="datetime-local"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              min={getCurrentDateTime()}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Choose when you want to start preparing this order
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Schedule Start
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}