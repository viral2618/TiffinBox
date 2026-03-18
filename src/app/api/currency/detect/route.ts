import { NextRequest, NextResponse } from 'next/server';
import { COUNTRY_TO_CURRENCY } from '@/lib/currency';

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               '8.8.8.8';
    
    console.log('💱 Detecting currency from IP:', ip);

    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await res.json();
    
    const countryCode = data.country_code;
    console.log('💱 Detected country:', countryCode);
    
    const currency = COUNTRY_TO_CURRENCY[countryCode] || 'INR';
    console.log('💱 Auto-detected currency:', currency);

    return NextResponse.json({ currency, country: countryCode });
  } catch (error) {
    console.error('💱 Currency detection failed:', error);
    return NextResponse.json({ currency: 'INR', country: 'IN' });
  }
}
