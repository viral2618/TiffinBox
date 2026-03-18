import { OrderItem, DelayLog, DashboardStats } from '@/types/recipe-management';
import { OrderStatus, OrderPriority } from '@prisma/client';
import RecipeTemplateService from './recipe-template.service';
import DishNotificationService from './dish-notification.service';
import { prisma } from '@/lib/prisma';

export class OrderManagementService {
  /**
   * Create a new order item
   */
  static async createOrderItem(data: {
    dishId: string;
    quantity: number;
    requestedBy: Date;
  }): Promise<OrderItem> {
    const recipeTemplate = await RecipeTemplateService.getRecipeTemplateByDishId(data.dishId);
    
    if (!recipeTemplate) {
      throw new Error('Recipe template not found for this dish');
    }

    const batchesRequired = RecipeTemplateService.calculateBatchesRequired(
      data.quantity, 
      recipeTemplate.batchSize
    );

    const timeCalculation = RecipeTemplateService.calculateOptimalTiming(
      recipeTemplate,
      data.requestedBy
    );

    const priority = RecipeTemplateService.determineOrderPriority(timeCalculation);

    return await prisma.orderItem.create({
      data: {
        dishId: data.dishId,
        recipeTemplateId: recipeTemplate.id,
        quantity: data.quantity,
        batchesRequired,
        requestedBy: data.requestedBy,
        status: OrderStatus.QUEUED,
        priority
      },
      include: {
        dish: {
          select: {
            name: true,
            imageUrls: true
          }
        },
        recipeTemplate: true,
        delays: true
      }
    });
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(
    orderItemId: string, 
    status: OrderStatus,
    ownerId: string
  ): Promise<OrderItem> {
    // Get current order to track previous stage
    const currentOrder = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: {
        dish: { select: { name: true, imageUrls: true } }
      }
    });

    if (!currentOrder) {
      throw new Error('Order not found');
    }

    const previousStage = currentOrder.status;
    const updateData: any = { status };
    const currentTime = new Date();

    // Set appropriate timestamp based on status
    switch (status) {
      case OrderStatus.PREP:
        updateData.prepStartTime = currentTime;
        if (!updateData.startTime) {
          updateData.startTime = currentTime;
        }
        break;
      case OrderStatus.BAKING:
        updateData.bakeStartTime = currentTime;
        break;
      case OrderStatus.COOLING:
        updateData.coolStartTime = currentTime;
        break;
      case OrderStatus.READY:
        updateData.readyTime = currentTime;
        break;
      case OrderStatus.SERVED:
        updateData.servedTime = currentTime;
        break;
    }

    const updatedOrder = await prisma.orderItem.update({
      where: { id: orderItemId },
      data: updateData,
      include: {
        dish: {
          select: {
            name: true,
            imageUrls: true
          }
        },
        recipeTemplate: true,
        delays: true
      }
    });

    // Send notification for stage change
    if (previousStage !== status) {
      await DishNotificationService.createStageNotification(
        ownerId,
        updatedOrder,
        previousStage
      );
    }

    return updatedOrder;
  }

  /**
   * Add delay to order
   */
  static async addDelay(
    orderItemId: string,
    reason: string,
    minutes: number,
    ownerId: string
  ): Promise<DelayLog> {
    const delayLog = await prisma.delayLog.create({
      data: {
        orderItemId,
        reason,
        minutes,
        addedBy: ownerId
      }
    });

    // Get order details for notification
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: {
        dish: { select: { name: true } }
      }
    });

    if (orderItem) {
      await DishNotificationService.createDelayNotification(
        ownerId,
        orderItem,
        reason,
        minutes
      );
    }

    return delayLog;
  }

  /**
   * Auto-advance orders based on timing
   */
  static async autoAdvanceOrders(ownerId: string): Promise<void> {
    const currentTime = new Date();
    
    const activeOrders = await prisma.orderItem.findMany({
      where: {
        status: {
          in: [OrderStatus.PREP, OrderStatus.BAKING, OrderStatus.COOLING]
        },
        dish: {
          shop: {
            ownerId
          }
        }
      },
      include: {
        dish: {
          select: {
            name: true,
            imageUrls: true
          }
        },
        recipeTemplate: true,
        delays: true
      }
    });

    for (const order of activeOrders) {
      if (!order.recipeTemplate) continue;

      let shouldAdvance = false;
      let nextStatus = order.status;
      const totalDelayMinutes = order.delays?.reduce((total, delay) => total + delay.minutes, 0) || 0;

      if (order.status === OrderStatus.PREP && order.prepStartTime) {
        const prepEndTime = new Date(order.prepStartTime.getTime() + ((order.recipeTemplate.prepTime + totalDelayMinutes) * 60 * 1000));
        if (currentTime >= prepEndTime) {
          shouldAdvance = true;
          nextStatus = OrderStatus.BAKING;
        }
      } else if (order.status === OrderStatus.BAKING && order.bakeStartTime) {
        const bakeEndTime = new Date(order.bakeStartTime.getTime() + ((order.recipeTemplate.bakeTime + totalDelayMinutes) * 60 * 1000));
        if (currentTime >= bakeEndTime) {
          shouldAdvance = true;
          nextStatus = OrderStatus.COOLING;
        }
      } else if (order.status === OrderStatus.COOLING && order.coolStartTime) {
        const coolEndTime = new Date(order.coolStartTime.getTime() + ((order.recipeTemplate.coolTime + totalDelayMinutes) * 60 * 1000));
        if (currentTime >= coolEndTime) {
          shouldAdvance = true;
          nextStatus = OrderStatus.READY;
        }
      }

      if (shouldAdvance) {
        await this.updateOrderStatus(order.id, nextStatus, ownerId);
      }

      // Check for urgent orders that need attention
      if (order.priority === OrderPriority.URGENT || this.isOrderBehindSchedule(order)) {
        await DishNotificationService.createUrgentNotification(
          ownerId,
          order,
          order.priority === OrderPriority.URGENT ? 'high_priority' : 'behind_schedule'
        );
      }
    }
  }

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(ownerId: string): Promise<DashboardStats> {
    const currentTime = new Date();
    const thirtyMinutesFromNow = new Date(currentTime.getTime() + (30 * 60 * 1000));

    // Auto-advance orders before getting stats
    await this.autoAdvanceOrders(ownerId);

    // Get all active orders for owner's shops
    const activeOrders = await prisma.orderItem.findMany({
      where: {
        status: {
          in: [OrderStatus.QUEUED, OrderStatus.PREP, OrderStatus.BAKING, OrderStatus.COOLING, OrderStatus.READY]
        },
        dish: {
          shop: {
            ownerId
          }
        }
      },
      include: {
        dish: {
          select: {
            name: true,
            imageUrls: true
          }
        },
        recipeTemplate: true,
        delays: true
      },
      orderBy: {
        requestedBy: 'asc'
      }
    });

    const urgent: OrderItem[] = [];
    const nextUp: OrderItem[] = [];
    const scheduled: OrderItem[] = [];

    for (const order of activeOrders) {
      if (!order.recipeTemplate) continue;

      const timeCalculation = RecipeTemplateService.calculateOptimalTiming(
        order.recipeTemplate,
        order.requestedBy,
        currentTime
      );

      if (timeCalculation.isUrgent || order.priority === OrderPriority.URGENT) {
        urgent.push(order);
      } else if (timeCalculation.optimalStartTime <= thirtyMinutesFromNow) {
        nextUp.push(order);
      } else {
        scheduled.push(order);
      }
    }

    return {
      urgent,
      nextUp,
      scheduled,
      totalActive: activeOrders.length
    };
  }

  /**
   * Get orders by status
   */
  static async getOrdersByStatus(
    ownerId: string, 
    status: OrderStatus
  ): Promise<OrderItem[]> {
    // Auto-advance orders before getting by status
    await this.autoAdvanceOrders(ownerId);
    
    return await prisma.orderItem.findMany({
      where: {
        status,
        dish: {
          shop: {
            ownerId
          }
        }
      },
      include: {
        dish: {
          select: {
            name: true,
            imageUrls: true
          }
        },
        recipeTemplate: true,
        delays: true
      },
      orderBy: {
        requestedBy: 'asc'
      }
    });
  }

  /**
   * Start order preparation
   */
  static async startOrderPreparation(
    orderItemId: string,
    ownerId: string
  ): Promise<OrderItem> {
    return await this.updateOrderStatus(orderItemId, OrderStatus.PREP, ownerId);
  }

  /**
   * Complete current stage and move to next
   */
  static async completeCurrentStage(
    orderItemId: string,
    ownerId: string
  ): Promise<OrderItem> {
    const order = await prisma.orderItem.findUnique({
      where: { id: orderItemId }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const nextStatus = this.getNextStatus(order.status);
    return await this.updateOrderStatus(orderItemId, nextStatus, ownerId);
  }

  /**
   * Schedule start time for an order
   */
  static async scheduleStart(
    orderItemId: string,
    startTime: Date,
    ownerId: string
  ): Promise<OrderItem> {
    return await prisma.orderItem.update({
      where: { id: orderItemId },
      data: { startTime },
      include: {
        dish: {
          select: {
            name: true,
            imageUrls: true
          }
        },
        recipeTemplate: true,
        delays: true
      }
    });
  }

  /**
   * Cancel an order
   */
  static async cancelOrder(
    orderItemId: string,
    ownerId: string
  ): Promise<OrderItem> {
    return await this.updateOrderStatus(orderItemId, OrderStatus.CANCELLED, ownerId);
  }

  /**
   * Update order priority
   */
  static async updateOrderPriority(
    orderItemId: string,
    priority: OrderPriority,
    ownerId: string
  ): Promise<OrderItem> {
    return await prisma.orderItem.update({
      where: { id: orderItemId },
      data: { priority },
      include: {
        dish: {
          select: {
            name: true,
            imageUrls: true
          }
        },
        recipeTemplate: true,
        delays: true
      }
    });
  }

  /**
   * Get next status in the workflow
   */
  private static getNextStatus(currentStatus: OrderStatus): OrderStatus {
    const statusFlow: Record<OrderStatus, OrderStatus> = {
      [OrderStatus.QUEUED]: OrderStatus.PREP,
      [OrderStatus.PREP]: OrderStatus.BAKING,
      [OrderStatus.BAKING]: OrderStatus.COOLING,
      [OrderStatus.COOLING]: OrderStatus.READY,
      [OrderStatus.READY]: OrderStatus.SERVED,
      [OrderStatus.SERVED]: OrderStatus.SERVED,
      [OrderStatus.CANCELLED]: OrderStatus.CANCELLED
    };

    return statusFlow[currentStatus] || currentStatus;
  }

  /**
   * Check if order is behind schedule
   */
  private static isOrderBehindSchedule(order: any): boolean {
    if (!order.recipeTemplate || !order.requestedBy) return false;

    const currentTime = new Date();
    const totalDelayMinutes = order.delays?.reduce((total: number, delay: any) => total + delay.minutes, 0) || 0;
    
    // Calculate expected completion time
    const totalProcessingTime = order.recipeTemplate.prepTime + 
                               order.recipeTemplate.bakeTime + 
                               order.recipeTemplate.coolTime + 
                               totalDelayMinutes;
    
    const expectedStartTime = new Date(order.requestedBy.getTime() - (totalProcessingTime * 60 * 1000));
    
    // Order is behind if we're past the expected start time and not yet started
    return currentTime > expectedStartTime && order.status === OrderStatus.QUEUED;
  }
}

export default OrderManagementService;