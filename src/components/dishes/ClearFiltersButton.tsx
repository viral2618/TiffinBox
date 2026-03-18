"use client"

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { buildSearchParams } from "@/lib/utils/url-params";

export function ClearFiltersButton() {
  const router = useRouter();

  const handleClearFilters = () => {
    const clearedParams = buildSearchParams({});
    router.push(`/dishes?${clearedParams.toString()}`);
  };

  return (
    <Button variant="outline" onClick={handleClearFilters}>
      Clear Filters
    </Button>
  );
}