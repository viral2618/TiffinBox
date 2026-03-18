import React from 'react';
import ShopCard from './ShopCard';
import { useAppSelector } from '@/redux/store';
import { Loader2, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ShopList: React.FC = () => {
  const { shops, loading, error, isNearby } = useAppSelector((state) => state.publicShop);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }
  
  if (shops.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">No shops found matching your criteria.</p>
      </div>
    );
  }
  
  return (
    <>
      {isNearby === false && shops.length > 0 && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription>
            No shops found in your area. Showing newest shops instead.
          </AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shops.map((shop) => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>
    </>
  );
};

export default ShopList;