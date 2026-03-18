import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import OrderManagementService from '@/lib/services/order-management.service';
import { OrderStatus } from '@/types/recipe-management';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { dishId, quantity, requestedBy } = body;

    if (!dishId || !quantity || !requestedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be positive' }, 
        { status: 400 }
      );
    }

    const orderItem = await OrderManagementService.createOrderItem({
      dishId,
      quantity: parseInt(quantity),
      requestedBy: new Date(requestedBy)
    });

    return NextResponse.json(orderItem, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as OrderStatus;
    const ownerId = session.user.id;
    if (!ownerId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }

    if (status && !Object.values(OrderStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status parameter' }, 
        { status: 400 }
      );
    }

    if (status) {
      const orders = await OrderManagementService.getOrdersByStatus(ownerId, status);
      return NextResponse.json(orders);
    }

    // Return dashboard stats if no specific status requested
    const dashboardStats = await OrderManagementService.getDashboardStats(ownerId);
    return NextResponse.json(dashboardStats);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}