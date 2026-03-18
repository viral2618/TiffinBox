import React from 'react';
import { useAppSelector } from '@/redux/store';
import DishCard from '@/components/dishes/DishCard';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { setDishPage } from '@/redux/features/publicShopDetailSlice';
import { useAppDispatch } from '@/redux/store';

interface DishListProps {
  shopSlug: string;
}

const DishList: React.FC<DishListProps> = ({ shopSlug }) => {
  const dispatch = useAppDispatch();
  const { shop, dishes, dishesLoading, dishesError, pagination } = useAppSelector((state) => state.publicShopDetail);
  
  if (dishesLoading && dishes.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (dishesError) {
    return (
      <div className="py-6 text-center">
        <p className="text-red-500">Error: {dishesError}</p>
      </div>
    );
  }
  
  if (dishes.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">No dishes found matching your criteria.</p>
      </div>
    );
  }
  
  const handleLoadMore = () => {
    dispatch(setDishPage(pagination.page + 1));
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dishes.map((dish) => (
          <DishCard key={dish.id} dish={{
            ...dish,
            shop: {
              id: shop?.id || '',
              name: shop?.name || '',
              slug: shopSlug,
              logoUrl: shop?.logoUrl,
              distance: shop?.coordinates ? undefined : undefined
            },
            isReminder: false,
            avgRating: 0,
            reviews: []
          }} />
        ))}
      </div>
      
      {pagination.page < pagination.pages && (
        <div className="flex justify-center mt-8">
          <Button 
            onClick={handleLoadMore}
            variant="outline"
            disabled={dishesLoading}
          >
            {dishesLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Load More
          </Button>
        </div>
      )}
    </div>
  );
};

export default DishList;