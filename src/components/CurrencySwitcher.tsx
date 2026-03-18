'use client';

import { useCurrency } from '@/contexts/CurrencyContext';
import { CURRENCIES } from '@/lib/currency';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function CurrencySwitcher() {
  const { currency, setCurrency, loading } = useCurrency();

  return (
    <Select value={currency} onValueChange={setCurrency} disabled={loading}>
      <SelectTrigger className="w-[140px]">
        <SelectValue>
          {CURRENCIES[currency].symbol} {currency}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(CURRENCIES).map(([code, { symbol, name }]) => (
          <SelectItem key={code} value={code}>
            {symbol} {code} - {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
