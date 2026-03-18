"use client"

import DishCard from './DishCard';
import { DishWithDistance } from '@/lib/services/dish.service';

interface ServerDishListProps {
  dishes: DishWithDistance[];
}

export default function ServerDishList({ dishes }: ServerDishListProps) {
  if (dishes.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">No dishes found matching your criteria.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {dishes.map((dish) => (
        <DishCard key={dish.id} dish={{
          ...dish,
          description: dish.description || undefined
        }} />
      ))}
    </div>
  );
}