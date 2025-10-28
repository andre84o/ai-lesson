import { NextRequest, NextResponse } from 'next/server';
import { searchCity } from '@/lib/search-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { country, city, radius = 10000, limit = 50 } = body;

    if (!country || !city) {
      return NextResponse.json(
        { error: 'country and city required' },
        { status: 400 }
      );
    }

    const result = await searchCity(
      country,
      city,
      parseInt(radius.toString()),
      parseInt(limit.toString())
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const country = searchParams.get('country');
    const city = searchParams.get('city');
    const radius = parseInt(searchParams.get('radius') || '10000');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!country || !city) {
      return NextResponse.json(
        { error: 'country and city required' },
        { status: 400 }
      );
    }

    const result = await searchCity(country, city, radius, limit);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 }
    );
  }
}
