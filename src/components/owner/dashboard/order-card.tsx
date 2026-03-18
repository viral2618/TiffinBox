'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, CheckCircle, AlertCircle, X, ArrowUp, ArrowDown } from 'lucide-react';
import { OrderItem, STATUS_COLORS } from '@/types/recipe-management';
import { OrderStatus, OrderPriority } from '@prisma/client';
import { StageTimer } from './stage-timer';

interface OrderCardProps {
  order: OrderItem;
  onStart: () => void;
  onComplete: () => void;
  onAddDelay: () => void;
  onScheduleStart: () => void;
  onCancel?: () => void;
  onUpdatePriority?: (priority: OrderPriority) => void;
  variant: 'urgent' | 'next' | 'scheduled';
}

export function OrderCard({ order, onStart, onComplete, onAddDelay, onScheduleStart, onCancel, onUpdatePriority, variant }: OrderCardProps) {
  const getStatusText = (status: OrderStatus) => {
    const statusMap = {
      [OrderStatus.QUEUED]: 'Queued',
      [OrderStatus.PREP]: 'Preparing',
      [OrderStatus.BAKING]: 'Baking',
      [OrderStatus.COOLING]: 'Cooling',
      [OrderStatus.READY]: 'Ready',
      [OrderStatus.SERVED]: 'Served',
      [OrderStatus.CANCELLED]: 'Cancelled'
    };
    return statusMap[status];
  };

  const getActionButton = () => {
    switch (order.status) {
      case OrderStatus.QUEUED:
        return (
          <Button onClick={onStart} size="sm" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-none">
            <Play className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Start Prep</span>
            <span className="sm:hidden">Start</span>
          </Button>
        );
      case OrderStatus.PREP:
      case OrderStatus.BAKING:
      case OrderStatus.COOLING:
        return (
          <Button onClick={onComplete} size="sm" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-none">
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Complete Stage</span>
            <span className="sm:hidden">Complete</span>
          </Button>
        );
      case OrderStatus.READY:
        return (
          <Button onClick={onComplete} size="sm" variant="outline" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-none">
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Mark Served</span>
            <span className="sm:hidden">Served</span>
          </Button>
        );
      default:
        return null;
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalDelayMinutes = () => {
    return order.delays?.reduce((total, delay) => total + delay.minutes, 0) || 0;
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'urgent':
        return 'border-destructive/20 bg-destructive/5';
      case 'next':
        return 'border-secondary/30 bg-secondary/20';
      default:
        return '';
    }
  };

  return (
    <Card className={getVariantStyles()}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-0 sm:justify-between">
          <div className="flex-1 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
              <h4 className="font-semibold text-sm sm:text-base">{order.dish?.name}</h4>
              <div className="flex gap-2 flex-wrap items-center">
                <Badge className={STATUS_COLORS[order.status]}>
                  {getStatusText(order.status)}
                </Badge>
                <StageTimer order={order} />
                {order.batchesRequired > 1 && (
                  <Badge variant="outline">
                    {order.batchesRequired} batches
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3">
              <div>
                <span className="font-medium">Quantity:</span> {order.quantity}
              </div>
              <div>
                <span className="font-medium">Requested by:</span> {formatTime(order.requestedBy)}
              </div>
              {order.recipeTemplate && (
                <>
                  <div>
                    <span className="font-medium">Prep:</span> {order.recipeTemplate.prepTime}m
                  </div>
                  <div>
                    <span className="font-medium">Bake:</span> {order.recipeTemplate.bakeTime}m
                  </div>
                  <div>
                    <span className="font-medium">Cool:</span> {order.recipeTemplate.coolTime}m
                  </div>
                  <div>
                    <span className="font-medium">Total:</span> {
                      order.recipeTemplate.prepTime + 
                      order.recipeTemplate.bakeTime + 
                      order.recipeTemplate.coolTime
                    }m
                  </div>
                </>
              )}
            </div>

            {/* Progress Timeline */}
            <div className="flex items-center gap-2 mb-3 overflow-x-auto">
              <div className="flex items-center gap-1 text-xs whitespace-nowrap">
                <div className={`w-2 h-2 rounded-full ${
                  order.status === OrderStatus.PREP || order.status === OrderStatus.BAKING || order.status === OrderStatus.COOLING || order.status === OrderStatus.READY || order.status === OrderStatus.SERVED
                    ? 'bg-secondary' : 'bg-muted'
                }`} />
                <span>Prep</span>
              </div>
              <div className="flex items-center gap-1 text-xs whitespace-nowrap">
                <div className={`w-2 h-2 rounded-full ${
                  order.status === OrderStatus.BAKING || order.status === OrderStatus.COOLING || order.status === OrderStatus.READY || order.status === OrderStatus.SERVED
                    ? 'bg-secondary' : 'bg-muted'
                }`} />
                <span>Bake</span>
              </div>
              <div className="flex items-center gap-1 text-xs whitespace-nowrap">
                <div className={`w-2 h-2 rounded-full ${
                  order.status === OrderStatus.COOLING || order.status === OrderStatus.READY || order.status === OrderStatus.SERVED
                    ? 'bg-secondary' : 'bg-muted'
                }`} />
                <span>Cool</span>
              </div>
              <div className="flex items-center gap-1 text-xs whitespace-nowrap">
                <div className={`w-2 h-2 rounded-full ${
                  order.status === OrderStatus.READY || order.status === OrderStatus.SERVED
                    ? 'bg-accent' : 'bg-muted'
                }`} />
                <span>Ready</span>
              </div>
            </div>

            {/* Delays */}
            {getTotalDelayMinutes() > 0 && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-secondary-foreground mb-2">
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Delayed by {getTotalDelayMinutes()} minutes</span>
              </div>
            )}
          </div>

          <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto sm:ml-4">
            {getActionButton()}
            {order.status === OrderStatus.QUEUED && (
              <Button 
                onClick={onScheduleStart} 
                size="sm" 
                variant="outline"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-none"
              >
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Schedule Start</span>
                <span className="sm:hidden">Schedule</span>
              </Button>
            )}
            <Button 
              onClick={onAddDelay} 
              size="sm" 
              variant="outline"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-none"
            >
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Add Delay</span>
              <span className="sm:hidden">Delay</span>
            </Button>
            {onUpdatePriority && order.status === OrderStatus.QUEUED && (
              <div className="flex gap-1">
                <Button 
                  onClick={() => onUpdatePriority(OrderPriority.URGENT)} 
                  size="sm" 
                  variant="outline"
                  className="p-1"
                  disabled={order.priority === OrderPriority.URGENT}
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button 
                  onClick={() => onUpdatePriority(OrderPriority.NORMAL)} 
                  size="sm" 
                  variant="outline"
                  className="p-1"
                  disabled={order.priority === OrderPriority.NORMAL}
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>
            )}
            {onCancel && order.status !== OrderStatus.SERVED && order.status !== OrderStatus.CANCELLED && (
              <Button 
                onClick={onCancel} 
                size="sm" 
                variant="destructive"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-none"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Cancel</span>
                <span className="sm:hidden">Cancel</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}