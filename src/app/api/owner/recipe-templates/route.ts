import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import RecipeTemplateService from '@/lib/services/recipe-template.service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { dishId, prepTime, bakeTime, coolTime, shelfLife, batchSize } = body;

    // Validate required fields
    if (!dishId || !prepTime || !bakeTime || !coolTime || !shelfLife || !batchSize) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Validate positive numbers
    if ([prepTime, bakeTime, coolTime, shelfLife, batchSize].some(val => val <= 0)) {
      return NextResponse.json(
        { error: 'All time and batch values must be positive' }, 
        { status: 400 }
      );
    }

    // Check if recipe template already exists
    const existing = await RecipeTemplateService.getRecipeTemplateByDishId(dishId);
    
    let recipeTemplate;
    if (existing) {
      // Update existing template
      recipeTemplate = await RecipeTemplateService.updateRecipeTemplate(existing.id, {
        prepTime: parseInt(prepTime),
        bakeTime: parseInt(bakeTime),
        coolTime: parseInt(coolTime),
        shelfLife: parseInt(shelfLife),
        batchSize: parseInt(batchSize)
      });
    } else {
      // Create new template
      recipeTemplate = await RecipeTemplateService.createRecipeTemplate({
        dishId,
        prepTime: parseInt(prepTime),
        bakeTime: parseInt(bakeTime),
        coolTime: parseInt(coolTime),
        shelfLife: parseInt(shelfLife),
        batchSize: parseInt(batchSize)
      });
    }

    return NextResponse.json(recipeTemplate, { status: 201 });
  } catch (error) {
    console.error('Error creating recipe template:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
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
    const dishId = searchParams.get('dishId');

    if (!dishId) {
      return NextResponse.json(
        { error: 'dishId parameter is required' }, 
        { status: 400 }
      );
    }

    const recipeTemplate = await RecipeTemplateService.getRecipeTemplateByDishId(dishId);

    if (!recipeTemplate) {
      return NextResponse.json(
        { error: 'Recipe template not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(recipeTemplate);
  } catch (error) {
    console.error('Error fetching recipe template:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}