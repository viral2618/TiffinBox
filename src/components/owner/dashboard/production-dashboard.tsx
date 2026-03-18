'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle, Play, Pause, Plus, Eye } from 'lucide-react';
import { DashboardStats, OrderItem, DELAY_OPTIONS } from '@/types/recipe-management';
import { OrderStatus, OrderPriority } from '@prisma/client';
import { DelayDialog } from './delay-dialog';
import { OrderCard } from './order-card';
import { ScheduleStartDialog } from './schedule-start-dialog';
import { AddOrderDialog } from './add-order-dialog';
import { ScheduledOrdersDialog } from './scheduled-orders-dialog';

export function ProductionDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [showDelayDialog, setShowDelayDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showAddOrderDialog, setShowAddOrderDialog] = useState(false);
  const [showScheduledOrdersDialog, setShowScheduledOrdersDialog] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
    const interval = setInterval(fetchDashboardStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/owner/orders');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Failed to fetch dashboard stats:', response.status);
        // Set empty stats on error
        setStats({
          urgent: [],
          nextUp: [],
          scheduled: [],
          totalActive: 0
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Set empty stats on error
      setStats({
        urgent: [],
        nextUp: [],
        scheduled: [],
        totalActive: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartOrder = async (orderItem: OrderItem) => {
    try {
      const response = await fetch(`/api/owner/orders/${orderItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'startPreparation' })
      });

      if (response.ok) {
        fetchDashboardStats();
      }
    } catch (error) {
      console.error('Error starting order:', error);
    }
  };

  const handleCompleteStage = async (orderItem: OrderItem) => {
    try {
      const response = await fetch(`/api/owner/orders/${orderItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'completeStage' })
      });

      if (response.ok) {
        fetchDashboardStats();
      }
    } catch (error) {
      console.error('Error completing stage:', error);
    }
  };

  const handleAddDelay = (orderItem: OrderItem) => {
    setSelectedOrder(orderItem);
    setShowDelayDialog(true);
  };

  const handleScheduleStart = (orderItem: OrderItem) => {
    setSelectedOrder(orderItem);
    setShowScheduleDialog(true);
  };

  const handleAddOrder = async (dishId: string, quantity: number, requestedBy: Date) => {
    try {
      const response = await fetch('/api/owner/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dishId, quantity, requestedBy: requestedBy.toISOString() })
      });

      if (response.ok) {
        fetchDashboardStats();
      }
    } catch (error) {
      console.error('Error adding order:', error);
    }
  };

  const handleCancelOrder = async (orderItem: OrderItem) => {
    try {
      const response = await fetch(`/api/owner/orders/${orderItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' })
      });

      if (response.ok) {
        fetchDashboardStats();
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const handleUpdatePriority = async (orderItem: OrderItem, priority: OrderPriority) => {
    try {
      const response = await fetch(`/api/owner/orders/${orderItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updatePriority', priority })
      });

      if (response.ok) {
        fetchDashboardStats();
      }
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  const handleScheduleSubmit = async (startTime: Date) => {
    if (!selectedOrder) return;

    try {
      const response = await fetch(`/api/owner/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'scheduleStart',
          startTime: startTime.toISOString()
        })
      });

      if (response.ok) {
        fetchDashboardStats();
        setShowScheduleDialog(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Error scheduling start:', error);
    }
  };

  const handleDelaySubmit = async (reason: string, minutes: number) => {
    if (!selectedOrder) return;

    try {
      const response = await fetch(`/api/owner/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addDelay',
          delayReason: reason,
          delayMinutes: minutes
        })
      });

      if (response.ok) {
        fetchDashboardStats();
        setShowDelayDialog(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Error adding delay:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64">
        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-6 sm:py-8">
        <p className="text-sm sm:text-base text-muted-foreground">Unable to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={() => setShowAddOrderDialog(true)} className="flex items-center gap-2 bg-secondary text-foreground hover:bg-secondary/80">
          <Plus className="h-4 w-4" />
          Add New Order
        </Button>
        {stats && stats.scheduled.length > 5 && (
          <Button 
            onClick={() => setShowScheduledOrdersDialog(true)} 
            variant="outline" 
            className="flex items-center gap-2 bg-secondary text-foreground hover:bg-secondary/80"
          >
            <Eye className="h-4 w-4" />
            View All Scheduled ({stats.scheduled.length})
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-destructive leading-tight">
              URGENT
            </CardTitle>
            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl font-bold text-destructive">{stats.urgent.length}</div>
            <p className="text-xs text-destructive/70 leading-tight">Start immediately</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/30 bg-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-secondary-foreground leading-tight">
              NEXT UP
            </CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-secondary-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl font-bold text-secondary-foreground">{stats.nextUp.length}</div>
            <p className="text-xs text-secondary-foreground/70 leading-tight">Start in 30 mins</p>
          </CardContent>
        </Card>

        <Card className="border-accent/30 bg-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-foreground leading-tight">
              SCHEDULED
            </CardTitle>
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.scheduled.length}</div>
            <p className="text-xs text-muted-foreground leading-tight">On track</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium leading-tight">Total Active</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl font-bold">{stats.totalActive}</div>
            <p className="text-xs text-muted-foreground leading-tight">All orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Orders */}
      {stats.urgent.length > 0 && (
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-sm sm:text-base text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Urgent Orders - Start Immediately</span>
              <span className="sm:hidden">Urgent Orders</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {stats.urgent.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStart={() => handleStartOrder(order)}
                onComplete={() => handleCompleteStage(order)}
                onAddDelay={() => handleAddDelay(order)}
                onScheduleStart={() => handleScheduleStart(order)}
                onCancel={() => handleCancelOrder(order)}
                onUpdatePriority={(priority) => handleUpdatePriority(order, priority)}
                variant="urgent"
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Next Up Orders */}
      {stats.nextUp.length > 0 && (
        <Card className="border-secondary/30">
          <CardHeader>
            <CardTitle className="text-sm sm:text-base text-secondary-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Next Up - Start in 30 Minutes</span>
              <span className="sm:hidden">Next Up</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {stats.nextUp.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStart={() => handleStartOrder(order)}
                onComplete={() => handleCompleteStage(order)}
                onAddDelay={() => handleAddDelay(order)}
                onScheduleStart={() => handleScheduleStart(order)}
                onCancel={() => handleCancelOrder(order)}
                onUpdatePriority={(priority) => handleUpdatePriority(order, priority)}
                variant="next"
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Scheduled Orders */}
      {stats.scheduled.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base text-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Scheduled Orders - On Track</span>
              <span className="sm:hidden">Scheduled</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {stats.scheduled.slice(0, 5).map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStart={() => handleStartOrder(order)}
                onComplete={() => handleCompleteStage(order)}
                onAddDelay={() => handleAddDelay(order)}
                onScheduleStart={() => handleScheduleStart(order)}
                onCancel={() => handleCancelOrder(order)}
                onUpdatePriority={(priority) => handleUpdatePriority(order, priority)}
                variant="scheduled"
              />
            ))}
            {stats.scheduled.length > 5 && (
              <p className="text-sm text-muted-foreground text-center">
                +{stats.scheduled.length - 5} more scheduled orders
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {stats.totalActive === 0 && (
        <Card>
          <CardContent className="text-center py-6 sm:py-8">
            <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-secondary-foreground mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">All Caught Up!</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">No active orders at the moment.</p>
            <Button 
              onClick={() => {
                fetch('/api/owner/test-orders', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' }
                })
                .then(response => response.json())
                .then(data => {
                  console.log('Orders created:', data);
                  fetchDashboardStats();
                })
                .catch(error => console.error('Error creating orders:', error));
              }}
              className="mx-auto text-sm sm:text-base bg-secondary text-foreground hover:bg-secondary/80"
              size="sm"
            >
              Create Orders
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delay Dialog */}
      <DelayDialog
        open={showDelayDialog}
        onOpenChange={setShowDelayDialog}
        onSubmit={handleDelaySubmit}
        orderItem={selectedOrder}
      />

      {/* Schedule Start Dialog */}
      <ScheduleStartDialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        onSubmit={handleScheduleSubmit}
        orderItem={selectedOrder}
      />

      {/* Add Order Dialog */}
      <AddOrderDialog
        open={showAddOrderDialog}
        onOpenChange={setShowAddOrderDialog}
        onSubmit={handleAddOrder}
      />

      {/* Scheduled Orders Dialog */}
      {stats && (
        <ScheduledOrdersDialog
          open={showScheduledOrdersDialog}
          onOpenChange={setShowScheduledOrdersDialog}
          orders={stats.scheduled}
          onStart={handleStartOrder}
          onComplete={handleCompleteStage}
          onAddDelay={handleAddDelay}
          onScheduleStart={handleScheduleStart}
        />
      )}
    </div>
  );
}