import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export interface Shop {
  country: string;
  city_name: string;
  name: string;
  address: string;
  rating: string;
  reviews_count: number;
  phone: string;
  website: string;
  business_type: string;
  hours: string;
  latitude: number;
  longitude: number;
  place_id: string;
  scraped_at: string;
}

let cachedShops: Shop[] | null = null;

export function loadShops(): Shop[] {
  if (cachedShops) {
    return cachedShops;
  }

  const filePath = path.join(process.cwd(), 'data', 'shops_by_country.csv');
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    cast: (value, context) => {
      // Cast numeric fields
      if (context.column === 'reviews_count') {
        return parseInt(value) || 0;
      }
      if (context.column === 'latitude' || context.column === 'longitude') {
        return parseFloat(value) || 0;
      }
      return value;
    },
  });

  cachedShops = records;
  return records;
}

export function getShopsByCountry(country: string): Shop[] {
  const shops = loadShops();
  return shops.filter((shop) => shop.country === country);
}

export function getShopsByCity(country: string, city: string): Shop[] {
  const shops = loadShops();
  return shops.filter(
    (shop) => shop.country === country && shop.city_name === city
  );
}

export function searchShops(query: string): Shop[] {
  const shops = loadShops();
  const lowerQuery = query.toLowerCase();

  return shops.filter(
    (shop) =>
      shop.name.toLowerCase().includes(lowerQuery) ||
      shop.city_name.toLowerCase().includes(lowerQuery) ||
      shop.country.toLowerCase().includes(lowerQuery) ||
      shop.business_type.toLowerCase().includes(lowerQuery) ||
      shop.address.toLowerCase().includes(lowerQuery)
  );
}

export function getCountriesWithShopCounts(): Record<string, { cities: number; shops: number }> {
  const shops = loadShops();
  const countryStats: Record<string, { cities: Set<string>; shops: number }> = {};

  shops.forEach((shop) => {
    if (!countryStats[shop.country]) {
      countryStats[shop.country] = {
        cities: new Set(),
        shops: 0,
      };
    }
    countryStats[shop.country].cities.add(shop.city_name);
    countryStats[shop.country].shops++;
  });

  // Convert Set to count
  const result: Record<string, { cities: number; shops: number }> = {};
  Object.keys(countryStats).forEach((country) => {
    result[country] = {
      cities: countryStats[country].cities.size,
      shops: countryStats[country].shops,
    };
  });

  return result;
}

export function getCitiesWithShopCounts(country: string): Record<string, number> {
  const shops = loadShops();
  const cityShops: Record<string, number> = {};

  shops
    .filter((shop) => shop.country === country)
    .forEach((shop) => {
      cityShops[shop.city_name] = (cityShops[shop.city_name] || 0) + 1;
    });

  return cityShops;
}
