import { NextResponse } from 'next/server';
import { loadCities } from '@/lib/search-engine';

export async function GET() {
  try {
    const cities = loadCities();

    // Build country map
    const countryMap: Record<string, string[]> = {};
    cities.forEach(({ country, city }) => {
      if (!countryMap[country]) {
        countryMap[country] = [];
      }
      countryMap[country].push(city);
    });

    // Sort countries and cities
    const sortedCountryMap = Object.keys(countryMap)
      .sort()
      .reduce((acc, country) => {
        acc[country] = countryMap[country].sort();
        return acc;
      }, {} as Record<string, string[]>);

    return NextResponse.json(sortedCountryMap);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load cities' },
      { status: 500 }
    );
  }
}
