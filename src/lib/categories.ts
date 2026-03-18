import { PrismaClient } from "@prisma/client";
import { cache } from "react";

const prisma = new PrismaClient();

export interface Subcategory {
  id: string;
  name: string;
  imageUrl?: string | null;
}

export interface Category {
  id: string;
  name: string;
  imageUrl?: string | null;
  subcategories?: Subcategory[];
}

export interface CategoriesResponse {
  categories: Category[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CategoriesFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export const getCategories = cache(async (filters: CategoriesFilters = {}): Promise<CategoriesResponse> => {
  try {
    const {
      search = '',
      page = 1,
      limit = 12
    } = filters;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { subcategories: { some: { name: { contains: search, mode: 'insensitive' } } } }
      ];
    }

    const [categories, totalCount] = await Promise.all([
      prisma.category.findMany({
        where,
        include: {
          subcategories: true
        },
        orderBy: {
          name: 'asc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.category.count({ where })
    ]);
    
    return {
      categories,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return {
      categories: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 12,
        pages: 0
      }
    };
  }
});