"use client"

import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import FilterSidebar from "./FilterSidebar";
import { useSearchParams } from "next/navigation";
import { parseSearchParams } from "@/lib/utils/url-params";
import { useMemo } from "react";

interface Category {
  id: string;
  name: string;
  subcategories: {
    id: string;
    name: string;
  }[];
}

interface MobileFiltersProps {
  categories: Category[];
}

export function MobileFilters({ categories }: MobileFiltersProps) {
  const searchParams = useSearchParams();
  const currentParams = useMemo(() => parseSearchParams(searchParams), [searchParams]);
  
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (currentParams.categoryId) count++;
    if (currentParams.subcategoryId) count++;
    if (currentParams.radius && currentParams.radius !== '5') count++;
    if (currentParams.minRating && currentParams.minRating !== '0') count++;
    if (currentParams.serveTime) count++;
    if (currentParams.isEggless) count++;
    if (currentParams.hasDiscount) count++;
    if (currentParams.minPrice && currentParams.minPrice !== '0') count++;
    if (currentParams.maxPrice && currentParams.maxPrice !== '1000') count++;
    return count;
  }, [currentParams]);

  return (
    <div className="lg:hidden fixed bottom-42 right-4 z-50">
      <Sheet>
        <SheetTrigger asChild>
          <Button className="rounded-full h-12 w-12 shadow-lg relative">
            <Filter className="h-5 w-5" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto h-full">
            <FilterSidebar categories={categories} className="px-6 pt-6 pb-6" />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}