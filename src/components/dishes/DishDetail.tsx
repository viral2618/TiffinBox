import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { toggleFavoriteDish } from '@/redux/features/publicDishDetailSlice';
import { Heart, Clock, ArrowLeft, MapPin, Calendar, ChefHat, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice, getTimeRange, formatTime, formatDate } from '@/lib/utils';

const DishDetail: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dish, loading, error, createdAt } = useAppSelector((state) => state.publicDishDetail);
  
  const handleToggleFavorite = () => {
    if (dish) {
      dispatch(toggleFavoriteDish(dish.id));
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <h3 className="text-lg font-medium">Error loading dish</h3>
        <p>{error}</p>
      </div>
    );
  }
  
  if (!dish) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-2">
        <Link href={`/shops/${dish.shop.slug}`} className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to {dish.shop.name}
        </Link>
        
        {dish.shop.address && (
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{dish.shop.address}</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Dish Images */}
        <div className="space-y-4">
          {dish.imageUrls && dish.imageUrls.length > 0 ? (
            <>
              <div className="aspect-square rounded-lg overflow-hidden">
                <Image
                  src={dish.imageUrls[0]}
                  alt={dish.name}
                  width={600}
                  height={600}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              
              {dish.imageUrls.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {dish.imageUrls.slice(1).map((url, index) => (
                    <div key={index} className="aspect-square rounded-md overflow-hidden">
                      <Image
                        src={url}
                        alt={`${dish.name} image ${index + 2}`}
                        width={150}
                        height={150}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
        </div>
        
        {/* Dish Info */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold">{dish.name}</h1>
              <span className="text-2xl font-bold">{formatPrice(dish.price)}</span>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline">{dish.category.name}</Badge>
              {dish.subcategory && (
                <Badge variant="outline">{dish.subcategory.name}</Badge>
              )}
            </div>
          </div>
          
          {/* Special badges */}
          <div className="flex flex-wrap gap-2">
            {dish.isSpecialToday && (
              <Badge className="bg-yellow-500">Special Today</Badge>
            )}
            {dish.isPremium && (
              <Badge className="bg-purple-500">Premium</Badge>
            )}
            {dish.isEggless && (
              <Badge className="bg-green-500">Eggless</Badge>
            )}
            {!dish.isSpecialToday && !dish.isPremium && !dish.isEggless && (
              <Badge className="bg-gray-200 text-gray-700">Standard</Badge>
            )}
          </div>
          
          {/* Description */}
          <div>
            <h2 className="text-lg font-medium mb-2">Description</h2>
            {dish.description ? (
              <p className="text-gray-600">{dish.description}</p>
            ) : (
              <p className="text-gray-500 italic">No description available</p>
            )}
          </div>
          
          {/* Timings */}
          {dish.timings && dish.timings.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-2">Availability & Preparation</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>
                    <strong>Served:</strong> {getTimeRange(
                      dish.timings[0].servedFrom,
                      dish.timings[0].servedUntil
                    )}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    <strong>Created at:</strong> {formatTime(dish.timings[0].createdAt.hour, dish.timings[0].createdAt.minute)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <ChefHat className="h-4 w-4" />
                  <span>
                    <strong>Prepared at:</strong> {formatTime(dish.timings[0].preparedAt.hour, dish.timings[0].preparedAt.minute)}
                  </span>
                </div>
                
                {createdAt && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <CalendarClock className="h-4 w-4" />
                    <span>
                      <strong>Added on:</strong> {formatDate(createdAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Tags */}
          <div>
            <h2 className="text-lg font-medium mb-2">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {dish.dishTags && dish.dishTags.length > 0 ? (
                dish.dishTags.map(({ tag }) => (
                  <Badge key={tag.id} variant="secondary">
                    {tag.name}
                  </Badge>
                ))
              ) : (
                <span className="text-gray-500">No tags available</span>
              )}
            </div>
          </div>
          
          {/* Shop Info */}
          <Link href={`/shops/${dish.shop.slug}`} className="block">
            <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                {dish.shop.logoUrl && (
                  <div className="h-10 w-10 rounded-full overflow-hidden">
                    <Image 
                      src={dish.shop.logoUrl} 
                      alt={dish.shop.name} 
                      width={40} 
                      height={40} 
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-medium">{dish.shop.name}</h3>
                  <p className="text-sm text-gray-500">View more dishes from this shop</p>
                </div>
              </div>
            </div>
          </Link>
          
          {/* Actions */}
          <div className="flex gap-4 pt-4">
            {/* <Button className="flex-1">Order Now</Button> */}
            <Button 
              variant={dish.isFavorite ? "default" : "outline"} 
              onClick={handleToggleFavorite}
              className="flex items-center gap-2"
            >
              <Heart className={`h-4 w-4 ${dish.isFavorite ? 'fill-white' : ''}`} />
              {dish.isFavorite ? 'Saved' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DishDetail;