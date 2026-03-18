# Dish Preparation Time System - Implementation Summary

## Overview
Lightweight system for managing dish preparation batches with automatic status tracking.

## Database Changes

### 1. Updated Dish Model
- **Removed**: `quantity`, `isOutOfStock`, `isMarketingEnabled`
- **Added**: `prepTimeMinutes` (optional) - Template for preparation time

### 2. New DishPreparationSlot Model
```prisma
model DishPreparationSlot {
  id              String            @id @default(auto()) @map("_id") @db.ObjectId
  dishId          String            @db.ObjectId
  slotId          String            // e.g., "2026-02-24-01"
  startedAt       DateTime
  prepTimeMinutes Int
  servingStartsAt DateTime
  endedAt         DateTime?
  status          PreparationStatus @default(PREPARING)
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
}

enum PreparationStatus {
  PREPARING
  SERVING
  SOLD_OUT
}
```

## Frontend Changes

### Add Dish Form
- Added "Preparation Time (minutes)" field
- Removed: Quantity, Stock Status, Marketing Enabled fields
- Field is optional - allows vendors to set prep time template

## API Endpoints

### POST `/api/owner/dishes/[dishId]/preparation-slot`
**Toggle ON** - Creates new active preparation slot
- Reads `prepTimeMinutes` from dish
- Calculates `servingStartsAt` = now + prepTimeMinutes
- Generates unique `slotId` (date-based with counter)
- Creates slot with status `PREPARING`

**Response:**
```json
{
  "slot": {
    "id": "...",
    "dishId": "samosa",
    "slotId": "2026-02-24-01",
    "startedAt": "2026-02-24T15:00:00Z",
    "prepTimeMinutes": 90,
    "servingStartsAt": "2026-02-24T16:30:00Z",
    "status": "PREPARING"
  }
}
```

### PATCH `/api/owner/dishes/[dishId]/preparation-slot`
**Toggle OFF** - Marks current slot as sold out
- Finds active slot (PREPARING or SERVING)
- Sets `endedAt` to current time
- Updates status to `SOLD_OUT`

**Response:**
```json
{
  "slot": {
    "id": "...",
    "slotId": "2026-02-24-01",
    "startedAt": "2026-02-24T15:00:00Z",
    "servingStartsAt": "2026-02-24T16:30:00Z",
    "endedAt": "2026-02-24T18:10:00Z",
    "status": "SOLD_OUT"
  }
}
```

### GET `/api/owner/dishes/[dishId]/preparation-slot`
**Get Status** - Returns current slot with auto-calculated status
- Finds active slot
- Auto-determines status:
  - `now < servingStartsAt` → PREPARING
  - `now >= servingStartsAt` → SERVING
- Updates status in DB if changed

**Response:**
```json
{
  "slot": { /* slot data */ },
  "status": "SERVING"
}
```

## How It Works

### 1. One-Time Setup (Add Dish)
Vendor sets `prepTimeMinutes` when creating dish (e.g., 90 minutes for samosa)

### 2. Toggle ON (Start Preparation)
```
Vendor taps "Start Preparing" button
→ POST /api/owner/dishes/[dishId]/preparation-slot
→ Creates slot with PREPARING status
→ System calculates serving time automatically
```

### 3. Automatic Status Updates
```
Frontend polls: GET /api/owner/dishes/[dishId]/preparation-slot
→ API checks current time vs servingStartsAt
→ Returns PREPARING or SERVING status
→ No manual update needed
```

### 4. Toggle OFF (Mark Sold Out)
```
Vendor taps "Mark Sold Out" button
→ PATCH /api/owner/dishes/[dishId]/preparation-slot
→ Sets endedAt and status = SOLD_OUT
```

### 5. Multiple Batches Same Day
```
Vendor can toggle ON again
→ Creates new slot with incremented counter
→ slotId: "2026-02-24-02"
→ Independent tracking
```

## User-Side Display Logic (Frontend)

```typescript
function getDishStatus(slot) {
  if (!slot) return "Not Available";
  
  const now = new Date();
  const servingTime = new Date(slot.servingStartsAt);
  
  if (slot.status === "SOLD_OUT") {
    return `Sold Out - Last Batch: ${formatTime(servingTime)}`;
  }
  
  if (now < servingTime) {
    const minutesLeft = Math.ceil((servingTime - now) / 60000);
    return `Preparing (Ready in ${minutesLeft} mins)`;
  }
  
  return "Serving Now (Fresh Batch)";
}
```

## Migration Steps

1. **Update Schema**
   ```bash
   npx prisma db push
   ```

2. **Update Existing Dishes** (Optional)
   - Existing dishes will have `prepTimeMinutes = null`
   - Vendors can edit dishes to add prep time
   - Only dishes with prep time can use slot system

3. **Frontend Integration**
   - Add toggle button in dish management UI
   - Poll GET endpoint every 30-60 seconds for status updates
   - Display status badge on user-facing dish cards

## Benefits

✅ **Lightweight** - Only 3 API endpoints, minimal DB queries
✅ **Automatic** - Status calculated by time, no manual updates
✅ **Flexible** - Supports multiple batches per day
✅ **Simple** - Vendor just toggles ON/OFF
✅ **Real-time** - Users see live preparation status

## Next Steps

1. Create vendor dashboard UI with toggle buttons
2. Add polling mechanism for status updates
3. Create user-facing status badges
4. Add notifications when dish becomes available
5. Analytics: track preparation times, sold-out patterns
