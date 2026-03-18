# Preparation System - Usage Examples

## 1. Vendor Dashboard - Dish Management

Add the toggle component to your dish management page:

```tsx
// src/app/owner/dashboard/my-dishes/page.tsx
import DishPreparationToggle from "@/components/dishes/DishPreparationToggle";

export default function MyDishesPage() {
  const dishes = [...]; // Your dishes data

  return (
    <div className="space-y-4">
      {dishes.map((dish) => (
        <DishPreparationToggle
          key={dish.id}
          dishId={dish.id}
          dishName={dish.name}
        />
      ))}
    </div>
  );
}
```

## 2. User-Facing Dish Card

Add status badge to dish cards:

```tsx
// src/components/dishes/DishCard.tsx
import DishStatusBadge from "@/components/dishes/DishStatusBadge";

export default function DishCard({ dish }) {
  return (
    <div className="dish-card">
      <img src={dish.imageUrls[0]} alt={dish.name} />
      <h3>{dish.name}</h3>
      <p>{dish.description}</p>
      
      {/* Add status badge */}
      <DishStatusBadge dishId={dish.id} autoRefresh={true} />
      
      <div className="price">₹{dish.price}</div>
    </div>
  );
}
```

## 3. Direct API Usage (Alternative)

If you prefer to use the API directly:

### Start Preparation
```typescript
async function startPreparation(dishId: string) {
  const response = await fetch(`/api/owner/dishes/${dishId}/preparation-slot`, {
    method: 'POST',
  });
  
  const data = await response.json();
  console.log('Slot created:', data.slot);
  // {
  //   slotId: "2026-02-24-01",
  //   startedAt: "2026-02-24T15:00:00Z",
  //   servingStartsAt: "2026-02-24T16:30:00Z",
  //   status: "PREPARING"
  // }
}
```

### Mark as Sold Out
```typescript
async function markSoldOut(dishId: string) {
  const response = await fetch(`/api/owner/dishes/${dishId}/preparation-slot`, {
    method: 'PATCH',
  });
  
  const data = await response.json();
  console.log('Marked sold out:', data.slot);
}
```

### Get Current Status
```typescript
async function getStatus(dishId: string) {
  const response = await fetch(`/api/owner/dishes/${dishId}/preparation-slot`);
  const data = await response.json();
  
  console.log('Current status:', data.status);
  // "PREPARING" | "SERVING" | "SOLD_OUT" | "INACTIVE"
  
  if (data.slot) {
    const now = new Date();
    const servingTime = new Date(data.slot.servingStartsAt);
    const minutesLeft = Math.ceil((servingTime - now) / 60000);
    
    console.log(`Ready in ${minutesLeft} minutes`);
  }
}
```

## 4. Real-time Updates with Polling

```typescript
"use client";

import { useState, useEffect } from "react";

export default function DishStatusMonitor({ dishId }) {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    // Initial fetch
    fetchStatus();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    
    return () => clearInterval(interval);
  }, [dishId]);

  async function fetchStatus() {
    const response = await fetch(`/api/owner/dishes/${dishId}/preparation-slot`);
    const data = await response.json();
    setStatus(data);
  }

  return (
    <div>
      {status?.status === "PREPARING" && (
        <p>Preparing... Ready soon!</p>
      )}
      {status?.status === "SERVING" && (
        <p>Fresh batch available now!</p>
      )}
      {status?.status === "SOLD_OUT" && (
        <p>Sold out for today</p>
      )}
    </div>
  );
}
```

## 5. Notification Integration

Send notifications when dish becomes available:

```typescript
// In your polling logic
useEffect(() => {
  if (prevStatus === "PREPARING" && currentStatus === "SERVING") {
    // Dish just became available!
    sendNotification({
      title: `${dishName} is ready!`,
      body: "Fresh batch available now",
      dishId: dishId
    });
  }
}, [currentStatus]);
```

## 6. Analytics Tracking

Track preparation patterns:

```typescript
async function getPreparationHistory(dishId: string, date: string) {
  // Query all slots for a specific date
  const slots = await prisma.dishPreparationSlot.findMany({
    where: {
      dishId,
      startedAt: {
        gte: new Date(date + 'T00:00:00Z'),
        lt: new Date(new Date(date).getTime() + 86400000)
      }
    },
    orderBy: { startedAt: 'asc' }
  });

  return {
    totalBatches: slots.length,
    averagePrepTime: calculateAverage(slots.map(s => s.prepTimeMinutes)),
    soldOutTimes: slots.filter(s => s.status === 'SOLD_OUT').map(s => s.endedAt)
  };
}
```

## 7. Bulk Operations

Manage multiple dishes at once:

```typescript
async function startMultipleDishes(dishIds: string[]) {
  const results = await Promise.all(
    dishIds.map(dishId =>
      fetch(`/api/owner/dishes/${dishId}/preparation-slot`, {
        method: 'POST'
      })
    )
  );
  
  return results;
}
```

## Testing Checklist

- [ ] Add dish with prep time (e.g., 90 minutes)
- [ ] Toggle ON - verify slot created with PREPARING status
- [ ] Wait for prep time - verify status auto-changes to SERVING
- [ ] Toggle OFF - verify status changes to SOLD_OUT
- [ ] Toggle ON again - verify new slot created with incremented counter
- [ ] Check user-facing badge shows correct status
- [ ] Verify countdown timer updates correctly
- [ ] Test with dish that has no prep time set

## Common Issues

### Issue: Status not updating automatically
**Solution**: Ensure you're polling the GET endpoint regularly (every 30-60 seconds)

### Issue: Can't start preparation
**Solution**: Verify dish has `prepTimeMinutes` set in database

### Issue: Multiple active slots
**Solution**: Always check for active slots before creating new ones (API handles this)

### Issue: Time zone issues
**Solution**: All times are stored in UTC, convert to local time in frontend
