import { useAppSelector } from '@/redux/store';
import { convertPrice as convertPriceUtil, formatCurrency, type CurrencyCode } from '@/lib/currency';

export function useCurrency() {
  const { currency, rates } = useAppSelector(state => state.currency);

  const convertPrice = (amount: number, fromCurrency: CurrencyCode) => {
    return convertPriceUtil(amount, fromCurrency, currency, rates);
  };

  const formatPrice = (amount: number) => {
    return formatCurrency(amount, currency);
  };

  return { currency, rates, convertPrice, formatPrice };
}
