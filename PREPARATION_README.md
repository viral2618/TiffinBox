# 🍽️ Dish Preparation Time System

A lightweight, automatic system for managing fresh food preparation batches with real-time status tracking.

## 📋 What Changed

### ✅ Completed
1. **Database Schema Updated**
   - Removed: `quantity`, `isOutOfStock`, `isMarketingEnabled` from Dish model
   - Added: `prepTimeMinutes` to Dish model (optional field)
   - Created: `DishPreparationSlot` model for tracking active batches
   - Created: `PreparationStatus` enum (PREPARING, SERVING, SOLD_OUT)

2. **Add Dish Form Updated**
   - Added "Preparation Time (minutes)" input field
   - Removed quantity, stock status, and marketing enabled fields
   - Form now cleaner and focused on essential dish info

3. **API Endpoints Created**
   - `POST /api/owner/dishes/[dishId]/preparation-slot` - Start preparation
   - `PATCH /api/owner/dishes/[dishId]/preparation-slot` - Mark sold out
   - `GET /api/owner/dishes/[dishId]/preparation-slot` - Get current status

4. **React Components Created**
   - `DishPreparationToggle.tsx` - Vendor toggle control
   - `DishStatusBadge.tsx` - User-facing status display

5. **Documentation Created**
   - `PREPARATION_SYSTEM.md` - System overview and architecture
   - `PREPARATION_USAGE.md` - Usage examples and integration guide
   - `scripts/migrate-dishes.ts` - Migration helper script

## 🚀 Quick Start

### 1. Database is Already Updated
The schema has been pushed to MongoDB. No manual migration needed.

### 2. Add Prep Time to Dishes
When creating a new dish, set the preparation time:
```
Preparation Time: 90 (minutes)
```

### 3. Use the Toggle System

**Vendor Side:**
```tsx
import DishPreparationToggle from "@/components/dishes/DishPreparationToggle";

<DishPreparationToggle dishId={dish.id} dishName={dish.name} />
```

**User Side:**
```tsx
import DishStatusBadge from "@/components/dishes/DishStatusBadge";

<DishStatusBadge dishId={dish.id} autoRefresh={true} />
```

## 🎯 How It Works

### Simple 3-Step Flow

1. **Vendor Toggles ON**
   - System creates preparation slot
   - Status: "Preparing (Ready in X mins)"
   - Countdown starts automatically

2. **Time Passes (Automatic)**
   - System checks time vs serving time
   - Status auto-changes to "Serving Now"
   - No manual update needed!

3. **Vendor Toggles OFF**
   - Status changes to "Sold Out"
   - Shows last batch time
   - Can start new batch anytime

### Multiple Batches Same Day
- Vendor can toggle ON multiple times
- Each batch gets unique ID: `2026-02-24-01`, `2026-02-24-02`, etc.
- Independent tracking for each batch

## 📊 Status Display Logic

```
No Active Slot → "Not Available"
PREPARING → "Preparing (Ready in 22 mins)"
SERVING → "Serving Now - Fresh Batch!"
SOLD_OUT → "Sold Out (Last: 4:30 PM)"
```

## 🔧 API Usage

### Start Preparation
```bash
POST /api/owner/dishes/{dishId}/preparation-slot
```

### Mark Sold Out
```bash
PATCH /api/owner/dishes/{dishId}/preparation-slot
```

### Get Status
```bash
GET /api/owner/dishes/{dishId}/preparation-slot
```

## 📁 File Structure

```
src/
├── app/
│   ├── api/
│   │   └── owner/
│   │       └── dishes/
│   │           └── [dishId]/
│   │               └── preparation-slot/
│   │                   └── route.ts          # API endpoints
│   └── owner/
│       └── dashboard/
│           └── add-dish/
│               └── page.tsx                  # Updated form
├── components/
│   └── dishes/
│       ├── DishPreparationToggle.tsx         # Vendor control
│       └── DishStatusBadge.tsx               # User display
└── prisma/
    └── schema.prisma                         # Updated schema

Documentation:
├── PREPARATION_SYSTEM.md                     # System overview
├── PREPARATION_USAGE.md                      # Usage examples
└── scripts/
    └── migrate-dishes.ts                     # Migration helper
```

## 🎨 UI Components

### Vendor Dashboard Toggle
- Shows current status with badge
- "Start Preparing" button when inactive
- "Mark Sold Out" button when active
- Auto-refreshes every 30 seconds

### User-Facing Badge
- Color-coded status indicators
- Live countdown timer
- Pulse animation for "Serving Now"
- Auto-refreshes status

## 🔄 Real-time Updates

Both components use polling (every 30 seconds) to keep status fresh:
- Vendor sees when dish becomes ready
- Users see live preparation progress
- Automatic status transitions

## 📝 Next Steps

### Immediate
1. ✅ Database updated
2. ✅ API endpoints created
3. ✅ Components ready to use
4. ⏳ Integrate toggle in vendor dashboard
5. ⏳ Add status badges to user dish cards

### Future Enhancements
- Push notifications when dish ready
- Analytics dashboard (prep times, patterns)
- Bulk operations (start multiple dishes)
- Scheduled preparations
- Customer reminders/alerts

## 🧪 Testing

1. Create a dish with prep time (e.g., 90 minutes)
2. Toggle ON → Verify "Preparing" status
3. Wait or manually adjust time → Verify "Serving" status
4. Toggle OFF → Verify "Sold Out" status
5. Toggle ON again → Verify new slot created

## 💡 Benefits

✅ **Simple** - Just toggle ON/OFF
✅ **Automatic** - Status updates by time
✅ **Lightweight** - Minimal database queries
✅ **Flexible** - Multiple batches per day
✅ **Real-time** - Live status for users
✅ **Scalable** - Works for any number of dishes

## 🆘 Support

See detailed documentation:
- System architecture: `PREPARATION_SYSTEM.md`
- Usage examples: `PREPARATION_USAGE.md`
- Migration help: `scripts/migrate-dishes.ts`

## 📜 License

Part of When-Fresh Next.js application.
