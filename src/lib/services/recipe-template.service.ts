import { RecipeTemplate, OrderItem, OrderStatus, OrderPriority, TimeCalculation } from '@/types/recipe-management';
import { prisma } from '@/lib/prisma';

export class RecipeTemplateService {
  /**
   * Create a recipe template for a dish
   */
  static async createRecipeTemplate(data: {
    dishId: string;
    prepTime: number;
    bakeTime: number;
    coolTime: number;
    shelfLife: number;
    batchSize: number;
  }): Promise<RecipeTemplate> {
    return await prisma.recipeTemplate.create({
      data: {
        ...data,
        isActive: true
      }
    });
  }

  /**
   * Get recipe template by dish ID
   */
  static async getRecipeTemplateByDishId(dishId: string): Promise<RecipeTemplate | null> {
    return await prisma.recipeTemplate.findUnique({
      where: { dishId }
    });
  }

  /**
   * Update recipe template
   */
  static async updateRecipeTemplate(
    id: string, 
    data: Partial<Omit<RecipeTemplate, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<RecipeTemplate> {
    return await prisma.recipeTemplate.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Calculate optimal timing for an order
   */
  static calculateOptimalTiming(
    recipeTemplate: RecipeTemplate,
    requestedBy: Date,
    currentTime: Date = new Date()
  ): TimeCalculation {
    const totalDuration = recipeTemplate.prepTime + recipeTemplate.bakeTime + recipeTemplate.coolTime;
    const optimalStartTime = new Date(requestedBy.getTime() - (totalDuration * 60 * 1000));
    const estimatedReadyTime = new Date(optimalStartTime.getTime() + (totalDuration * 60 * 1000));
    
    const minutesUntilStart = Math.max(0, Math.floor((optimalStartTime.getTime() - currentTime.getTime()) / (60 * 1000)));
    const isUrgent = currentTime > optimalStartTime;

    return {
      optimalStartTime,
      estimatedReadyTime,
      totalDuration,
      isUrgent,
      minutesUntilStart
    };
  }

  /**
   * Calculate number of batches required
   */
  static calculateBatchesRequired(quantity: number, batchSize: number): number {
    return Math.ceil(quantity / batchSize);
  }

  /**
   * Determine order priority based on timing
   */
  static determineOrderPriority(timeCalculation: TimeCalculation): OrderPriority {
    if (timeCalculation.isUrgent) {
      return OrderPriority.URGENT;
    }
    
    if (timeCalculation.minutesUntilStart <= 30) {
      return OrderPriority.HIGH;
    }
    
    if (timeCalculation.minutesUntilStart <= 120) {
      return OrderPriority.NORMAL;
    }
    
    return OrderPriority.LOW;
  }
}

export default RecipeTemplateService;