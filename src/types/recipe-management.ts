export interface RecipeTemplate {
  id: string;
  dishId: string;
  prepTime: number; // minutes
  bakeTime: number; // minutes
  coolTime: number; // minutes
  shelfLife: number; // minutes
  batchSize: number; // items per batch
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

import { OrderStatus as PrismaOrderStatus, OrderPriority as PrismaOrderPriority } from '@prisma/client';

export interface OrderItem {
  id: string;
  dishId: string;
  recipeTemplateId: string;
  quantity: number;
  batchesRequired: number;
  status: PrismaOrderStatus;
  priority: PrismaOrderPriority;
  orderedAt: Date;
  requestedBy: Date;
  startTime?: Date | null;
  prepStartTime?: Date | null;
  bakeStartTime?: Date | null;
  coolStartTime?: Date | null;
  readyTime?: Date | null;
  servedTime?: Date | null;
  delays: DelayLog[];
  dish?: {
    name: string;
    imageUrls: string[];
  };
  recipeTemplate?: RecipeTemplate;
}

export interface DelayLog {
  id: string;
  orderItemId: string;
  reason: string;
  minutes: number;
  addedAt: Date;
  addedBy: string;
}

export enum OrderStatus {
  QUEUED = 'QUEUED',
  PREP = 'PREP',
  BAKING = 'BAKING',
  COOLING = 'COOLING',
  READY = 'READY',
  SERVED = 'SERVED',
  CANCELLED = 'CANCELLED'
}

export enum OrderPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface DelayOption {
  label: string;
  minutes: number | null;
}

export interface DashboardStats {
  urgent: OrderItem[];
  nextUp: OrderItem[];
  scheduled: OrderItem[];
  totalActive: number;
}

export interface TimeCalculation {
  optimalStartTime: Date;
  estimatedReadyTime: Date;
  totalDuration: number; // minutes
  isUrgent: boolean;
  minutesUntilStart: number;
}

export const DELAY_OPTIONS: DelayOption[] = [
  { label: "Oven busy (+15 mins)", minutes: 15 },
  { label: "Missing ingredient (+30 mins)", minutes: 30 },
  { label: "Equipment issue (+60 mins)", minutes: 60 },
  { label: "Custom delay", minutes: null }
];

export const STATUS_COLORS = {
  [OrderStatus.QUEUED]: 'bg-gray-100 text-gray-800',
  [OrderStatus.PREP]: 'bg-blue-100 text-blue-800',
  [OrderStatus.BAKING]: 'bg-orange-100 text-orange-800',
  [OrderStatus.COOLING]: 'bg-purple-100 text-purple-800',
  [OrderStatus.READY]: 'bg-green-100 text-green-800',
  [OrderStatus.SERVED]: 'bg-gray-100 text-gray-600',
  [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800'
};

export const PRIORITY_COLORS = {
  [OrderPriority.LOW]: 'text-gray-500',
  [OrderPriority.NORMAL]: 'text-blue-600',
  [OrderPriority.HIGH]: 'text-orange-600',
  [OrderPriority.URGENT]: 'text-red-600'
};