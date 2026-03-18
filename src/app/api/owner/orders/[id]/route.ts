import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import OrderManagementService from '@/lib/services/order-management.service';
import { OrderStatus } from '@/types/recipe-management';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, status, delayReason, delayMinutes, startTime, priority } = body;
    const ownerId = session.user.id;
    if (!ownerId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }
    
    const { id: orderItemId } = await params;

    switch (action) {
      case 'updateStatus':
        if (!status || !Object.values(OrderStatus).includes(status)) {
          return NextResponse.json(
            { error: 'Valid status is required' }, 
            { status: 400 }
          );
        }

        const updatedOrder = await OrderManagementService.updateOrderStatus(
          orderItemId,
          status,
          ownerId
        );
        return NextResponse.json(updatedOrder);

      case 'startPreparation':
        const startedOrder = await OrderManagementService.startOrderPreparation(
          orderItemId,
          ownerId
        );
        return NextResponse.json(startedOrder);

      case 'completeStage':
        const completedOrder = await OrderManagementService.completeCurrentStage(
          orderItemId,
          ownerId
        );
        return NextResponse.json(completedOrder);

      case 'addDelay':
        if (!delayReason || !delayMinutes || delayMinutes <= 0) {
          return NextResponse.json(
            { error: 'Valid delay reason and minutes are required' }, 
            { status: 400 }
          );
        }

        const delayLog = await OrderManagementService.addDelay(
          orderItemId,
          delayReason,
          parseInt(delayMinutes),
          ownerId
        );
        return NextResponse.json(delayLog);

      case 'scheduleStart':
        if (!startTime) {
          return NextResponse.json(
            { error: 'Start time is required' }, 
            { status: 400 }
          );
        }

        const scheduledOrder = await OrderManagementService.scheduleStart(
          orderItemId,
          new Date(startTime),
          ownerId
        );
        return NextResponse.json(scheduledOrder);

      case 'cancel':
        const cancelledOrder = await OrderManagementService.cancelOrder(
          orderItemId,
          ownerId
        );
        return NextResponse.json(cancelledOrder);

      case 'updatePriority':
        if (!priority) {
          return NextResponse.json(
            { error: 'Priority is required' }, 
            { status: 400 }
          );
        }

        const priorityUpdatedOrder = await OrderManagementService.updateOrderPriority(
          orderItemId,
          priority,
          ownerId
        );
        return NextResponse.json(priorityUpdatedOrder);

      default:
        return NextResponse.json(
          { error: 'Invalid action' }, 
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' }, 
      { status: 500 }
    );
  }
}