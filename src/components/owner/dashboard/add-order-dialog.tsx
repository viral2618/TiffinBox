'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Shop {
  id: string;
  name: string;
  dishes: { id: string; name: string; }[];
}

interface AddOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (dishId: string, quantity: number, requestedBy: Date) => void;
}

export function AddOrderDialog({ open, onOpenChange, onSubmit }: AddOrderDialogProps) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedDish, setSelectedDish] = useState('');
  const [quantity, setQuantity] = useState('');
  const [requestedTime, setRequestedTime] = useState('');

  useEffect(() => {
    if (open) {
      fetchShops();
      const now = new Date();
      now.setMinutes(now.getMinutes() + 60);
      setRequestedTime(now.toISOString().slice(0, 16));
    }
  }, [open]);

  const fetchShops = async () => {
    try {
      // First get shops
      const shopsResponse = await fetch('/api/owner/shop/my-shops');
      if (!shopsResponse.ok) return;
      
      const shopsData = await shopsResponse.json();
      const shopsArray = shopsData.shops || shopsData;
      
      if (Array.isArray(shopsArray)) {
        // Fetch dishes for each shop
        const shopsWithDishes = await Promise.all(
          shopsArray.map(async (shop: any) => {
            try {
              console.log(`Fetching dishes for shop ${shop.id}`);
              const dishesResponse = await fetch(`/api/owner/shop/${shop.id}/dishes`);
              console.log(`Dishes response status: ${dishesResponse.status}`);
              if (dishesResponse.ok) {
                const dishesData = await dishesResponse.json();
                console.log(`Dishes data for ${shop.name}:`, dishesData);
                const dishes = dishesData.dishes || dishesData;
                return {
                  id: shop.id,
                  name: shop.name,
                  dishes: Array.isArray(dishes) ? dishes.map((dish: any) => ({
                    id: dish.id,
                    name: dish.name
                  })) : []
                };
              }
            } catch (error) {
              console.error(`Error fetching dishes for shop ${shop.id}:`, error);
            }
            return {
              id: shop.id,
              name: shop.name,
              dishes: []
            };
          })
        );
        
        console.log('Final shops with dishes:', shopsWithDishes);
        setShops(shopsWithDishes);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDish && quantity && requestedTime) {
      onSubmit(selectedDish, parseInt(quantity), new Date(requestedTime));
      setSelectedDish('');
      setQuantity('');
      setRequestedTime('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="dish">Dish</Label>
            <Select value={selectedDish} onValueChange={setSelectedDish}>
              <SelectTrigger>
                <SelectValue placeholder="Select a dish" />
              </SelectTrigger>
              <SelectContent>
                {shops.length > 0 ? (
                  shops.map((shop) => (
                    <div key={shop.id}>
                      <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">
                        {shop.name} ({shop.dishes.length} dishes)
                      </div>
                      {shop.dishes.length > 0 ? (
                        shop.dishes.map((dish) => (
                          <SelectItem key={dish.id} value={dish.id} className="pl-4">
                            {dish.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-4 py-1 text-xs text-muted-foreground">
                          No dishes found
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <SelectItem value="no-dishes" disabled>
                    No dishes available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="requestedTime">Requested By</Label>
            <Input
              id="requestedTime"
              type="datetime-local"
              value={requestedTime}
              onChange={(e) => setRequestedTime(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">Add Order</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}