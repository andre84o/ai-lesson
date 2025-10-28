import { NextResponse } from 'next/server';
import { getCountriesWithShopCounts } from '@/lib/shops-data';

export async function GET() {
  try {
    const countries = getCountriesWithShopCounts();

    return NextResponse.json(countries);
  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json(
      { error: 'Failed to load countries' },
      { status: 500 }
    );
  }
}
