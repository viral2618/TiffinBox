import { Suspense } from 'react';
import { Metadata } from 'next';
import { getCategories, CategoriesFilters } from '@/lib/categories';
import CategoriesClient from '@/components/categories/CategoriesClient';
import CategoriesLoading from '@/components/categories/CategoriesLoading';

export const metadata: Metadata = {
  title: 'Food Categories | When Fresh',
  description: 'Explore our wide variety of food categories. Find your favorite dishes from different cuisines and categories.',
  keywords: 'food categories, cuisine types, restaurant categories, food delivery',
  openGraph: {
    title: 'Food Categories | When Fresh',
    description: 'Explore our wide variety of food categories. Find your favorite dishes from different cuisines and categories.',
    type: 'website',
  },
};

interface CategoriesPageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function CategoriesPage({
  searchParams,
}: CategoriesPageProps) {
  const resolvedSearchParams = await searchParams;
  
  const filters: CategoriesFilters = {
    search: resolvedSearchParams.search,
    page: resolvedSearchParams.page ? parseInt(resolvedSearchParams.page) : 1,
    limit: 12
  };
  
  const { categories, pagination } = await getCategories(filters);

  return (
    <div className="categories-section">
      <div className="container mx-auto py-24 px-4">
        <Suspense fallback={<CategoriesLoading />}>
          <CategoriesClient 
            categories={categories} 
            pagination={pagination}
            searchParams={resolvedSearchParams}
          />
        </Suspense>
      </div>
    </div>
  );
}