# Notification System Issues Found

## Problem
The notification system is throwing errors while updating notifications.

## Root Causes Identified

### 1. Missing `updatedAt` Field in Notification Model
**Location:** `prisma/schema.prisma`

The `Notification` model is missing the `updatedAt` field which is a common pattern in Prisma models for tracking updates.

**Current Schema:**
```prisma
model Notification {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  title       String
  message     String
  type        String
  isRead      Boolean  @default(false)
  user        User?    @relation(fields: [userId], references: [id])
  userId      String?  @db.ObjectId
  owner       Owner?   @relation(fields: [ownerId], references: [id])
  ownerId     String?  @db.ObjectId
  createdAt   DateTime @default(now())
  // Missing: updatedAt field
}
```

### 2. Update Operations Without Proper Error Handling
**Locations:**
- `src/app/api/user/notifications/route.ts` (PATCH method)
- `src/app/api/owner/notifications/route.ts` (PATCH method)
- `src/lib/services/dish-notification.service.ts` (markNotificationsAsRead method)

## Solutions

### Solution 1: Add `updatedAt` Field to Notification Model

Update the Notification model in `prisma/schema.prisma`:

```prisma
model Notification {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  title       String
  message     String
  type        String
  isRead      Boolean  @default(false)
  user        User?    @relation(fields: [userId], references: [id])
  userId      String?  @db.ObjectId
  owner       Owner?   @relation(fields: [ownerId], references: [id])
  ownerId     String?  @db.ObjectId
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt  // ADD THIS LINE
}
```

After updating the schema, run:
```bash
npx prisma generate
npx prisma db push
```

### Solution 2: Add Better Error Handling in Update Operations

The current error handling is basic. Consider adding more specific error messages and validation.

## Additional Recommendations

1. **Add indexes for better query performance:**
```prisma
model Notification {
  // ... existing fields ...
  
  @@index([userId, isRead])
  @@index([ownerId, isRead])
  @@index([createdAt])
}
```

2. **Add validation for notification updates** to ensure:
   - Notification IDs exist before updating
   - User/Owner owns the notifications they're trying to update
   - Proper authorization checks

3. **Consider adding a `readAt` timestamp field** to track when notifications were read:
```prisma
model Notification {
  // ... existing fields ...
  readAt      DateTime?
}
```

## Testing After Fix

1. Test marking single notification as read
2. Test marking all notifications as read
3. Test with both user and owner roles
4. Verify real-time updates work correctly
5. Check Redis cache synchronization

## Files That Need Updates

1. `prisma/schema.prisma` - Add updatedAt field
2. Run Prisma commands to update database
3. Optionally improve error handling in API routes
