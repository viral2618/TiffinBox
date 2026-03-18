'use client';

import { useCurrency } from '@/contexts/CurrencyContext';
import { CurrencyCode } from '@/lib/currency';

interface PriceDisplayProps {
  originalPrice: number;
  discountedPrice?: number;
  currency?: CurrencyCode;
}

export function PriceDisplay({ originalPrice, discountedPrice, currency = 'INR' }: PriceDisplayProps) {
  const { formatPrice, loading } = useCurrency();

  if (loading) {
    return <div className="h-6 w-24 bg-muted animate-pulse rounded" />;
  }

  const displayPrice = discountedPrice || originalPrice;
  const hasDiscount = discountedPrice && discountedPrice < originalPrice;

  return (
    <div className="flex items-center gap-2">
      <span className="text-lg font-bold">
        {formatPrice(displayPrice, currency)}
      </span>
      {hasDiscount && (
        <>
          <span className="text-sm text-muted-foreground line-through">
            {formatPrice(originalPrice, currency)}
          </span>
          <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
            {Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)}% OFF
          </span>
        </>
      )}
    </div>
  );
}
