import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FALLBACK_RATES } from '@/lib/currency';

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function GET() {
  try {
    console.log('💱 Fetching exchange rates from cache');
    
    const cached = await prisma.exchangeRate.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    if (cached && Date.now() - cached.updatedAt.getTime() < CACHE_DURATION) {
      console.log('💱 Cache valid, returning cached rates');
      return NextResponse.json({ rates: cached.rates, base: cached.base });
    }

    console.log('💱 Cache expired, fetching live rates');
    
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    let rates = FALLBACK_RATES;

    if (apiKey) {
      try {
        const res = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/INR`);
        const data = await res.json();
        if (data.conversion_rates) rates = data.conversion_rates;
      } catch (error) {
        console.error('💱 API fetch failed, using fallback rates', error);
      }
    } else {
      console.log('💱 Using fallback rates');
    }

    await prisma.exchangeRate.create({
      data: { base: 'INR', rates },
    });

    return NextResponse.json({ rates, base: 'INR' });
  } catch (error) {
    console.error('💱 Error fetching rates:', error);
    return NextResponse.json({ rates: FALLBACK_RATES, base: 'INR' });
  }
}
