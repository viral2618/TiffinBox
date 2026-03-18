import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppSelector } from '@/redux/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/utils';

const RelatedDishes: React.FC = () => {
  const { relatedDishes, relatedLoading, relatedError } = useAppSelector((state) => state.publicDishDetail);
  const { dish } = useAppSelector((state) => state.publicDishDetail);
  
  if (relatedLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-square rounded-md" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }
  
  if (relatedError) {
    return null; // Hide related dishes section on error
  }
  
  if (!dish || relatedDishes.length === 0) {
    return null; // Hide if no dish or no related dishes
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">More from {dish.shop.name}</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {relatedDishes.map((relatedDish) => (
          <Link 
            key={relatedDish.id} 
            href={`/dishes/${relatedDish.slug}`}
            className="block"
          >
            <Card className="overflow-hidden h-full transition-all hover:shadow-md">
              <div className="aspect-square relative">
                {relatedDish.imageUrls && relatedDish.imageUrls.length > 0 ? (
                  <Image
                    src={relatedDish.imageUrls[0]}
                    alt={relatedDish.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No image</span>
                  </div>
                )}
                
                {/* Special badges */}
                {(relatedDish.isSpecialToday || relatedDish.isPremium || relatedDish.isEggless) && (
                  <div className="absolute bottom-1 left-1">
                    {relatedDish.isSpecialToday && (
                      <Badge className="bg-yellow-500 text-xs">Special</Badge>
                    )}
                  </div>
                )}
              </div>
              
              <CardContent className="p-2">
                <h3 className="font-medium text-sm line-clamp-1">{relatedDish.name}</h3>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-600">{relatedDish.category.name}</span>
                  <span className="font-semibold text-sm">{formatPrice(relatedDish.price)}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedDishes;