'use client'

import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface CurrencyConverterProps {
  basePrice: number
  baseCurrency?: string
}

const currencies = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
]

export default function CurrencyConverter({ basePrice, baseCurrency = 'INR' }: CurrencyConverterProps) {
  const [selectedCurrency, setSelectedCurrency] = useState(baseCurrency)
  const [convertedPrice, setConvertedPrice] = useState(basePrice)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const convertCurrency = async (toCurrency: string) => {
    if (toCurrency === baseCurrency) {
      setConvertedPrice(basePrice)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`)
      const data = await response.json()
      const rate = data.rates[toCurrency]
      if (rate) {
        setConvertedPrice(basePrice * rate)
      }
    } catch (error) {
      console.error('Currency conversion failed:', error)
      setConvertedPrice(basePrice)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    convertCurrency(selectedCurrency)
  }, [selectedCurrency, basePrice])

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency)
    setIsOpen(false)
  }

  const selectedCurrencyData = currencies.find(c => c.code === selectedCurrency)

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <span className="text-3xl font-bold text-gray-900">
          {loading ? '...' : `${selectedCurrencyData?.symbol}${convertedPrice.toFixed(2)}`}
        </span>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          >
            {selectedCurrency}
            <ChevronDown className="w-3 h-3" />
          </button>
          
          {isOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-[120px]">
              {currencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleCurrencyChange(currency.code)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  {currency.symbol} {currency.code}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}