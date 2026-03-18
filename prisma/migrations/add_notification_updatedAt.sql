-- Migration: Add updatedAt field to Notification model
-- This migration adds the missing updatedAt field to fix notification update errors

-- For MongoDB, this is handled by Prisma's db push command
-- Run: npx prisma db push

-- The updatedAt field will be automatically managed by Prisma
-- For existing notifications, the updatedAt will be set to the current timestamp
