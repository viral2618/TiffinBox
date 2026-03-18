import React from 'react';
import DishCard from './DishCard';
import { useAppSelector } from '@/redux/store';

const DishList: React.FC = () => {
  const { dishes, loading, error } = useAppSelector((state) => state.publicDish);
  
  if (loading && dishes.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-96 rounded-lg animate-pulse"></div>
        ))}
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
  
  if (dishes.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">No dishes found matching your criteria.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {dishes.map((dish) => (
        <DishCard key={dish.id} dish={{
          ...dish,
          isVeg: dish.isEggless || false,
          isReminder: false,
          avgRating: 0,
          reviews: []
        }} />
      ))}
    </div>
  );
};

export default DishList;