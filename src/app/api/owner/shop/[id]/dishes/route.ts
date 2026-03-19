import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Helper function to verify shop ownership
async function verifyShopOwnership(shopId: string, ownerId: string | undefined) {
  if (!shopId || !ownerId) return false;
  
  try {
    const shop = await prisma.shop.findFirst({
      where: {
        id: shopId,
        ownerId: ownerId
      },
      select: { id: true }
    });
    
    return shop !== null;
  } catch (error) {
    console.error('Error verifying shop ownership:', error);
    return false;
  }
}

export async function GET(
  req: NextRequest,
  {params}: { params: Promise<{ id: string }> }
) {
  try {
    const {id: shopId} = await params;
    
    // Validate shopId
    if (!shopId) {
      return NextResponse.json(
        { error: "Shop ID is required" },
        { status: 400 }
      );
    }
    
    console.log(`Processing GET request for shop dishes. Shop ID: ${shopId}`);
    const { searchParams } = new URL(req.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Filter parameters
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || undefined;
    const subcategory = searchParams.get('subcategory') || undefined;
    const isVeg = searchParams.get('isVeg') === 'true' ? true : searchParams.get('isVeg') === 'false' ? false : undefined;
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice') || '0') : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice') || '10000') : undefined;
    const tagId = searchParams.get('tagId') || undefined;
    const dishId = searchParams.get('dishId') || undefined;
    
    // Sort parameters
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    
    // Get the authenticated session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an owner
    if (!session || !session.user || session.user.role !== "owner" || !session.user.id) {
      return NextResponse.json(
        { error: "Not authenticated or not authorized" },
        { status: 401 }
      );
    }
    
    const ownerId = session.user.id as string;
    
    // Verify shop ownership
    const hasAccess = await verifyShopOwnership(shopId, ownerId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Shop not found" },
        { status: 404 }
      );
    }
    
    // Build the where clause for filtering
    const whereClause: any = {
      shopId,
      ...(dishId ? { id: dishId } : {}),
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
      ...(category ? { categoryId: category } : {}),
      ...(subcategory ? { subcategoryId: subcategory } : {}),
      ...(isVeg !== undefined ? { isVeg } : {}),
      ...(minPrice !== undefined || maxPrice !== undefined ? {
        price: {
          ...(minPrice !== undefined ? { gte: minPrice } : {}),
          ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
        }
      } : {}),
      ...(tagId ? { dishTags: { some: { tagId } } } : {}),
    };
    
    // Count total dishes matching the filter
    const totalDishes = await prisma.dish.count({
      where: whereClause
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(totalDishes / limit);
    
    // Fetch dishes with pagination, filtering, and sorting
    const dishes = await prisma.dish.findMany({
      where: whereClause,
      include: {
        category: true,
        subcategory: true,
        dishTags: {
          include: {
            tag: true
          }
        },
        timings: true
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip,
      take: limit
    });
    
    // Return the dishes with pagination metadata
    return NextResponse.json({ 
      dishes,
      pagination: {
        page,
        limit,
        totalDishes,
        totalPages
      }
    });
  } catch (error) {
    console.error("Error fetching shop dishes:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// Create a new dish
export async function POST(
  req: NextRequest,
  {params}: { params: Promise<{ id: string }> }
) {
  try {
    const {id: shopId} = await params;
    const data = await req.json();
    
    // Get the authenticated session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an owner
    if (!session || !session.user || session.user.role !== "owner" || !session.user.id) {
      return NextResponse.json(
        { error: "Not authenticated or not authorized" },
        { status: 401 }
      );
    }
    
    const ownerId = session.user.id as string;
    
    // Verify shop ownership
    const hasAccess = await verifyShopOwnership(shopId, ownerId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Shop not found" },
        { status: 404 }
      );
    }
    
    // Create the dish
    const dish = await prisma.dish.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        imageUrls: data.imageUrls || [],
        price: data.price,
        currency: data.currency || 'INR',
        originalPrice: data.originalPrice || null,
        discountPercentage: data.discountPercentage || null,
        prepTimeMinutes: data.prepTimeMinutes || null,
        isVeg: data.isVeg ?? true,
        shopId,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId || null,
        // Create dish tags if provided
        dishTags: data.selectedTags ? {
          create: data.selectedTags.map((tagId: string) => ({
            tag: {
              connect: { id: tagId }
            }
          }))
        } : undefined,
        // Create timings if provided
        timings: data.timings ? {
          create: data.timings
        } : undefined
      }
    });
    
    // Fetch the created dish with all relations
    const createdDish = await prisma.dish.findUnique({
      where: { id: dish.id },
      include: {
        category: true,
        subcategory: true,
        dishTags: {
          include: {
            tag: true
          }
        },
        timings: true
      }
    });
    
    return NextResponse.json({ dish: createdDish }, { status: 201 });
  } catch (error) {
    console.error("Error creating dish:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// Update a dish
export async function PUT(
  req: NextRequest,
  {params}: { params: Promise<{ id: string }> }
) {
  try {
    const {id: shopId} = await params; // This is fine as params is already resolved
    const data = await req.json();
    
    
    if (!data.dishId) {
      return NextResponse.json(
        { error: "Dish ID is required" },
        { status: 400 }
      );
    }
    
    // Get the authenticated session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an owner
    if (!session || !session.user || session.user.role !== "owner" || !session.user.id) {
      return NextResponse.json(
        { error: "Not authenticated or not authorized" },
        { status: 401 }
      );
    }
    
    const ownerId = session.user.id as string;
    
    // Verify shop ownership
    const hasAccess = await verifyShopOwnership(shopId, ownerId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Shop not found" },
        { status: 404 }
      );
    }
    
    // Verify the dish belongs to the shop
    const existingDish = await prisma.dish.findUnique({
      where: {
        id: data.dishId,
        shopId
      }
    });
    
    if (!existingDish) {
      return NextResponse.json(
        { error: "Dish not found" },
        { status: 404 }
      );
    }
    
    // Ensure dishId is valid
    const dishId = data.dishId;
    console.log('DishId for update:', dishId); // Debug log
    
    if (!dishId || typeof dishId !== 'string' || dishId.trim() === '') {
      return NextResponse.json(
        { error: "Invalid dish ID" },
        { status: 400 }
      );
    }
    
    // First, delete existing dish tags if we're updating them
    if (data.selectedTags) {
      await prisma.dishTag.deleteMany({
        where: { dishId }
      });
    }
    
    // Update the dish
    const dish = await prisma.dish.update({
      where: {
        id: dishId // Use the extracted dishId directly
      },
      data: {
        name: data.name,
        slug: data.slug && data.slug !== existingDish.slug ? data.slug : undefined,
        description: data.description,
        imageUrls: data.imageUrls || [],
        price: data.price,
        currency: data.currency,
        originalPrice: data.originalPrice || null,
        discountPercentage: data.discountPercentage || null,
        prepTimeMinutes: data.prepTimeMinutes || null,
        isVeg: data.isVeg,
        categoryId: data.categoryId || undefined,
        subcategoryId: data.subcategoryId || null,
        // Create new dish tags if provided
        dishTags: data.selectedTags ? {
          create: data.selectedTags.map((tagId: string) => ({
            tag: {
              connect: { id: tagId }
            }
          }))
        } : undefined,
        // Update timings if provided
        timings: data.timings ? {
          deleteMany: {},
          create: data.timings
        } : undefined
      }
    });
    
    // Fetch the updated dish with all relations
    const updatedDish = await prisma.dish.findUnique({
      where: { id: dish.id },
      include: {
        category: true,
        subcategory: true,
        dishTags: {
          include: {
            tag: true
          }
        },
        timings: true
      }
    });
    
    return NextResponse.json({ dish: updatedDish });
  } catch (error) {
    console.error("Error updating dish:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// Delete a dish
export async function DELETE(
  req: NextRequest,
  {params}: { params: Promise<{ id: string }> }
) {
  try {
    const {id: shopId} = await params;
    const url = new URL(req.url);
    const dishId = url.searchParams.get('dishId');
    
    if (!dishId) {
      return NextResponse.json(
        { error: "Dish ID is required" },
        { status: 400 }
      );
    }
    
    // Get the authenticated session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an owner
    if (!session || !session.user || session.user.role !== "owner" || !session.user.id) {
      return NextResponse.json(
        { error: "Not authenticated or not authorized" },
        { status: 401 }
      );
    }
    
    const ownerId = session.user.id as string;
    
    // Verify shop ownership
    const hasAccess = await verifyShopOwnership(shopId, ownerId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Shop not found" },
        { status: 404 }
      );
    }
    
    // Verify the dish belongs to the shop
    const existingDish = await prisma.dish.findUnique({
      where: {
        id: dishId,
        shopId
      }
    });
    
    if (!existingDish) {
      return NextResponse.json(
        { error: "Dish not found" },
        { status: 404 }
      );
    }
    
    // Delete the dish
    await prisma.dish.delete({
      where: {
        id: dishId
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting dish:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}