import React from 'react';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { toggleFavoriteShop } from '@/redux/features/favoritesSlice';
import { Heart, Phone, MapPin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useRequireAuth } from '@/hooks/use-require-auth';

const ShopDetail: React.FC = () => {
  const dispatch = useAppDispatch();
  const { shop, shopLoading, shopError } = useAppSelector((state) => state.publicShopDetail);
  const { loading: favoriteLoading } = useAppSelector((state) => state.favorites);
  const { requireAuth } = useRequireAuth();
  
  const handleToggleFavorite = () => {
    if (shop) {
      requireAuth(() => {
        dispatch(toggleFavoriteShop({ shopId: shop.id, currentFavoriteStatus: shop.isFavorite }));
      });
    }
  };
  
  if (shopLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full rounded-lg" />
        <div className="flex items-center space-x-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </div>
        </div>
      </div>
    );
  }
  
  if (shopError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <h3 className="text-lg font-medium">Error loading shop</h3>
        <p>{shopError}</p>
      </div>
    );
  }
  
  if (!shop) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      {/* Banner Image */}
      <div className="relative h-64 w-full rounded-lg overflow-hidden">
        {shop.bannerImage ? (
          <Image
            src={shop.bannerImage}
            alt={shop.name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 1200px"
          />
        ) : (
          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No banner image</span>
          </div>
        )}
        
        {/* Favorite button */}
        <Button
          onClick={handleToggleFavorite}
          className="absolute top-4 right-4"
          variant={shop.isFavorite ? "default" : "outline"}
          size="sm"
          disabled={favoriteLoading}
        >
          <Heart className={`h-4 w-4 mr-2 ${shop.isFavorite ? 'fill-white' : ''} ${favoriteLoading ? 'animate-pulse' : ''}`} />
          {shop.isFavorite ? 'Favorited' : 'Add to Favorites'}
        </Button>
      </div>
      
      {/* Shop Info */}
      <div className="flex flex-col md:flex-row gap-4 items-start">
        {/* Logo */}
        {shop.logoUrl && (
          <div className="h-20 w-20 rounded-full border-2 border-white overflow-hidden bg-white shadow-md">
            <Image
              src={shop.logoUrl}
              alt={`${shop.name} logo`}
              width={80}
              height={80}
              className="object-cover"
            />
          </div>
        )}
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{shop.name}</h1>
          {shop.description && (
            <p className="text-gray-600 mt-2">{shop.description}</p>
          )}
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {shop.shopTags.map(({ tag }) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      
      {/* Contact & Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-gray-500" />
          <span>{shop.address}</span>
        </div>
        
        {shop.contactPhone && (
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-gray-500" />
            <a href={`tel:${shop.contactPhone}`} className="hover:underline">
              {shop.contactPhone}
            </a>
          </div>
        )}
        
        {shop.whatsapp && (
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-gray-500" />
            <a 
              href={`https://wa.me/${shop.whatsapp}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline"
            >
              WhatsApp
            </a>
          </div>
        )}
      </div>
      
      {/* Gallery */}
      {shop.imageUrls && shop.imageUrls.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {shop.imageUrls.map((url, index) => (
              <div key={index} className="aspect-square rounded-md overflow-hidden">
                <Image
                  src={url}
                  alt={`${shop.name} image ${index + 1}`}
                  width={300}
                  height={300}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopDetail;