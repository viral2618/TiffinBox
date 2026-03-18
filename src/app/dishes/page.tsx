import { Metadata } from "next";
import { getDishes, getCategories } from "@/lib/services/dish.service";
import { parseSearchParams, getPageTitle, getPageSubtitle } from "@/lib/utils/url-params";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Cookie } from "lucide-react";
import ServerDishList from "@/components/dishes/ServerDishList";
import FilterSidebar from "@/components/dishes/FilterSidebar";
import ServerDishPagination from "@/components/dishes/ServerDishPagination";
import ServerDishSearch from "@/components/dishes/ServerDishSearch";
import { ClearFiltersButton } from "@/components/dishes/ClearFiltersButton";
import { MobileFilters } from "@/components/dishes/MobileFilters";
import SortDropdown from "@/components/dishes/SortDropdown";


interface DishesPageProps {
  searchParams: Promise<{
    search?: string;
    categoryId?: string;
    subcategoryId?: string;
    isEggless?: string;
    isPremium?: string;
    isSpecialToday?: string;
    lat?: string;
    lng?: string;
    radius?: string;
    page?: string;
    limit?: string;
    minRating?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    hasDiscount?: string;
    serveTime?: string;
    sortBy?: string;
  }>;
}

export async function generateMetadata({ searchParams }: DishesPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const params = parseSearchParams(new URLSearchParams(resolvedSearchParams as any));
  const title = getPageTitle(params);
  const description = getPageSubtitle(params);
  
  return {
    title: `${title} | When Fresh`,
    description,
    openGraph: {
      title: `${title} | When Fresh`,
      description,
    },
  };
}

export default async function DishesPage({ searchParams }: DishesPageProps) {
  const resolvedSearchParams = await searchParams;
  const params = parseSearchParams(new URLSearchParams(resolvedSearchParams as any));
  
  const filters = {
    search: params.search,
    categoryId: params.categoryId,
    subcategoryId: params.subcategoryId,
    isEggless: params.isEggless === 'true' ? true : params.isEggless === 'false' ? false : undefined,
    isPremium: params.isPremium === 'true' ? true : undefined,
    isSpecialToday: params.isSpecialToday === 'true' ? true : undefined,
    lat: params.lat ? parseFloat(params.lat) : undefined,
    lng: params.lng ? parseFloat(params.lng) : undefined,
    radius: params.radius ? parseFloat(params.radius) : 5,
    page: params.page ? parseInt(params.page) : 1,
    limit: params.limit ? parseInt(params.limit) : 12,
    minRating: params.minRating ? parseInt(params.minRating) : undefined,
    minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
    inStock: params.inStock === 'true' ? true : undefined,
    hasDiscount: params.hasDiscount === 'true' ? true : undefined,
    serveTime: params.serveTime,
    sortBy: params.sortBy,
  };

  const [dishesData, categories] = await Promise.all([
    getDishes(filters),
    getCategories(),
  ]);

  const pageTitle = getPageTitle(params);
  const pageSubtitle = getPageSubtitle(params);

  return (
    <div className="dishes-section">
      <div className="container mx-auto py-24 px-3 sm:px-4">
        <div className="flex flex-col space-y-8">
          <div className="text-center max-w-3xl mx-auto mb-4">
            <h1 className="section-header text-4xl font-semibold mb-3">{pageTitle}</h1>
            <p className="text-lg" style={{ color: '#0f766e' }}>{pageSubtitle}</p>
          </div>
        
        <div className="max-w-3xl mx-auto w-full">
          <ServerDishSearch />
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8 mt-5">
          <div className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24">
              <FilterSidebar categories={categories} />
            </div>
          </div>
          
          <div className="flex-1">
            {dishesData.dishes.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-muted-foreground">
                    Found {dishesData.pagination.total} {dishesData.pagination.total === 1 ? "dish" : "dishes"}
                  </p>
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="hidden sm:inline text-sm">Sort by:</span> 
                    <SortDropdown currentSort={params.sortBy} />
                  </div>
                </div>
                <div className="responsive-grid mb-8">
                  <ServerDishList dishes={dishesData.dishes} />
                </div>
                <ServerDishPagination pagination={dishesData.pagination} />
              </>
            ) : (
              <div className="page-card p-12 text-center flex flex-col items-center">
                <div className="bg-muted/50 p-4 rounded-full mb-4">
                  <Cookie className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium mb-2">No Dishes Found</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  We couldn't find any dishes matching your criteria. Try adjusting your filters.
                </p>
                <ClearFiltersButton />
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
      
      <MobileFilters categories={categories} />
    </div>
  );
}