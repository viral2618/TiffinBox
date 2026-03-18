'use client';

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { CurrencyCode, CURRENCIES, FALLBACK_RATES, convertPrice, formatCurrency } from '@/lib/currency';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  rates: Record<string, number>;
  convertPrice: (amount: number, fromCurrency: CurrencyCode) => number;
  formatPrice: (amount: number, fromCurrency?: CurrencyCode) => string;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencyState, setCurrencyState] = useState<CurrencyCode>('INR');
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRates(FALLBACK_RATES);
    setLoading(false);
    console.log('💱 CurrencyProvider: Initializing with fallback rates');

    const saved = localStorage.getItem('preferred-currency') as CurrencyCode | null;
    if (saved && CURRENCIES[saved]) {
      console.log('💱 CurrencyProvider: Loaded saved preference:', saved);
      setCurrencyState(saved);
    }

    fetch('/api/currency/rates')
      .then(res => res.json())
      .then(data => {
        if (data.rates) setRates(data.rates);
      })
      .catch(error => {
        console.error('💱 CurrencyProvider: Rate fetching failed, using fallback rates', error);
      });

    if (!saved) {
      fetch('/api/currency/detect')
        .then(res => res.json())
        .then(data => {
          if (data.currency) {
            console.log('💱 Auto-detected currency:', data.currency);
            setCurrencyState(data.currency);
            localStorage.setItem('preferred-currency', data.currency);
          }
        })
        .catch(error => {
          console.error('💱 CurrencyProvider: Currency detection failed, using default INR', error);
        });
    }
  }, []);

  const handleSetCurrency = (newCurrency: CurrencyCode) => {
    console.log('💱 Currency changed to:', newCurrency);
    setCurrencyState(newCurrency);
    localStorage.setItem('preferred-currency', newCurrency);
    console.log('💱 Saved to localStorage:', newCurrency);
  };

  const value = useMemo(() => ({
    currency: currencyState,
    setCurrency: handleSetCurrency,
    rates,
    convertPrice: (amount: number, fromCurrency: CurrencyCode) => 
      convertPrice(amount, fromCurrency, currencyState, rates),
    formatPrice: (amount: number, fromCurrency: CurrencyCode = 'INR') => {
      const converted = convertPrice(amount, fromCurrency, currencyState, rates);
      return formatCurrency(converted, currencyState);
    },
    loading,
  }), [currencyState, rates, loading]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
}
