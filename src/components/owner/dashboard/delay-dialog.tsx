'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { OrderItem, DELAY_OPTIONS } from '@/types/recipe-management';

interface DelayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string, minutes: number) => void;
  orderItem: OrderItem | null;
}

export function DelayDialog({ open, onOpenChange, onSubmit, orderItem }: DelayDialogProps) {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [customMinutes, setCustomMinutes] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');

  const handleSubmit = () => {
    const selectedDelayOption = DELAY_OPTIONS.find(option => option.label === selectedOption);
    
    if (!selectedDelayOption) return;

    let reason = selectedDelayOption.label;
    let minutes = selectedDelayOption.minutes;

    if (selectedDelayOption.minutes === null) {
      // Custom delay
      if (!customReason.trim() || !customMinutes || parseInt(customMinutes) <= 0) {
        return;
      }
      reason = customReason.trim();
      minutes = parseInt(customMinutes);
    }

    onSubmit(reason, minutes!);
    
    // Reset form
    setSelectedOption('');
    setCustomMinutes('');
    setCustomReason('');
  };

  const isCustomSelected = selectedOption === 'Custom delay';
  const canSubmit = selectedOption && (
    !isCustomSelected || 
    (customReason.trim() && customMinutes && parseInt(customMinutes) > 0)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Delay</DialogTitle>
        </DialogHeader>
        
        {orderItem && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium">{orderItem.dish?.name}</h4>
            <p className="text-sm text-muted-foreground">
              Quantity: {orderItem.quantity} | 
              Requested by: {new Date(orderItem.requestedBy).toLocaleTimeString()}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label>Delay Reason</Label>
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
              {DELAY_OPTIONS.map((option) => (
                <div key={option.label} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.label} id={option.label} />
                  <Label htmlFor={option.label} className="flex-1 cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {isCustomSelected && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="customReason">Custom Reason</Label>
                <Input
                  id="customReason"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Enter delay reason..."
                />
              </div>
              <div>
                <Label htmlFor="customMinutes">Minutes</Label>
                <Input
                  id="customMinutes"
                  type="number"
                  min="1"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  placeholder="Enter minutes..."
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Add Delay
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}