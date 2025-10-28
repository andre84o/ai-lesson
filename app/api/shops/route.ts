import { NextRequest, NextResponse } from 'next/server';
import { searchShops, getShopsByCountry, getShopsByCity } from '@/lib/shops-data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const country = searchParams.get('country');
    const city = searchParams.get('city');

    // Search by query string
    if (query) {
      const results = searchShops(query);
      return NextResponse.json({
        results,
        count: results.length,
      });
    }

    // Get shops by country and city
    if (country && city) {
      const results = getShopsByCity(country, city);
      return NextResponse.json({
        results,
        count: results.length,
      });
    }

    // Get shops by country only
    if (country) {
      const results = getShopsByCountry(country);
      return NextResponse.json({
        results,
        count: results.length,
      });
    }

    return NextResponse.json(
      { error: 'Missing required parameters: query, country, or city' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching shops:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shops' },
      { status: 500 }
    );
  }
}
