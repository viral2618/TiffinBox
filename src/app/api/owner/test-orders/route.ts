import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { OrderStatus, OrderPriority } from '@/types/recipe-management';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get dishes with recipe templates
    const dishes = await prisma.dish.findMany({
      include: { recipeTemplate: true },
      where: {
        recipeTemplate: {
          isNot: null
        }
      },
      take: 3
    });

    if (dishes.length === 0) {
      return NextResponse.json({ error: 'No dishes with recipe templates found' }, { status: 400 });
    }

    // Create test orders
    const testOrders: any[] = [];
    
    for (let i = 0; i < dishes.length; i++) {
      const dish = dishes[i];
      if (!dish.recipeTemplate) continue;

      const quantity = [12, 24, 6][i];
      const hoursFromNow = [1, 2, 4][i];
      const status = [OrderStatus.PREP, OrderStatus.QUEUED, OrderStatus.QUEUED][i];
      const priority = [OrderPriority.URGENT, OrderPriority.HIGH, OrderPriority.NORMAL][i];

      const batchesRequired = Math.ceil(quantity / dish.recipeTemplate.batchSize);
      const requestedBy = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);

      const orderData: any = {
        dishId: dish.id,
        recipeTemplateId: dish.recipeTemplate.id,
        quantity,
        batchesRequired,
        requestedBy,
        status,
        priority
      };

      if (status === OrderStatus.PREP) {
        orderData.startTime = new Date();
        orderData.prepStartTime = new Date();
      }

      const order = await prisma.orderItem.create({
        data: orderData,
        include: {
          dish: {
            select: {
              name: true,
              imageUrls: true
            }
          },
          recipeTemplate: true
        }
      });

      testOrders.push(order);
    }

    return NextResponse.json({ 
      message: 'Test orders created successfully',
      orders: testOrders 
    });

  } catch (error) {
    console.error('Error creating test orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}