import fs from 'fs';
import path from 'path';

const USER_AGENT = 'motorcycle-search-agent/1.0 (your-email@example.com)';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

export interface City {
  country: string;
  city: string;
}

export interface GeocodedLocation {
  lat: string;
  lon: string;
  display_name?: string;
}

export interface POI {
  id: number;
  type: string;
  lat?: number;
  lon?: number;
  tags: Record<string, string>;
}

export interface SearchResult {
  country: string;
  city: string;
  lat?: number;
  lon?: number;
  count: number;
  pois: POI[];
  error?: string;
}

export function loadCities(filePath: string = 'data/cities.csv'): City[] {
  const fullPath = path.join(process.cwd(), filePath);
  const fileContent = fs.readFileSync(fullPath, 'utf-8');
  const lines = fileContent.split('\n').filter(line => line.trim());

  // Skip header
  const cities: City[] = [];
  for (let i = 1; i < lines.length; i++) {
    const [country, city] = lines[i].split(',').map(s => s.trim());
    if (country && city) {
      cities.push({ country, city });
    }
  }

  return cities;
}

export async function geocodeCity(city: string, country: string): Promise<GeocodedLocation | null> {
  const params = new URLSearchParams({
    city,
    country,
    format: 'json',
    limit: '1',
  });

  const response = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { 'User-Agent': USER_AGENT },
  });

  if (!response.ok) {
    throw new Error(`Nominatim API error: ${response.status}`);
  }

  const data = await response.json();
  if (!data || data.length === 0) {
    return null;
  }

  return data[0] as GeocodedLocation;
}

export async function overpassQuery(
  lat: number,
  lon: number,
  radius: number = 10000,
  limit: number = 50
): Promise<POI[]> {
  const query = `
[out:json][timeout:25];
(
  node(around:${radius},${lat},${lon})[shop~"motorcycle|car_repair|garage|bicycle",i];
  way(around:${radius},${lat},${lon})[shop~"motorcycle|car_repair|garage|bicycle",i];
  relation(around:${radius},${lat},${lon})[shop~"motorcycle|car_repair|garage|bicycle",i];
  node(around:${radius},${lat},${lon})[name~"motorcycle|moto|motorbike|motorrad|mc",i];
  way(around:${radius},${lat},${lon})[name~"motorcycle|moto|motorbike|motorrad|mc",i];
  relation(around:${radius},${lat},${lon})[name~"motorcycle|moto|motorbike|motorrad|mc",i];
);
out center ${limit};
  `.trim();

  const formData = new URLSearchParams();
  formData.append('data', query);

  const response = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: {
      'User-Agent': USER_AGENT,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status}`);
  }

  const data = await response.json();
  const elements = (data.elements || []).slice(0, limit);

  const results: POI[] = elements.map((e: any) => ({
    id: e.id,
    type: e.type,
    lat: e.lat || e.center?.lat,
    lon: e.lon || e.center?.lon,
    tags: e.tags || {},
  }));

  return results;
}

export async function searchCity(
  country: string,
  city: string,
  radius: number = 10000,
  limit: number = 50
): Promise<SearchResult> {
  try {
    const geocoded = await geocodeCity(city, country);

    if (!geocoded) {
      return {
        country,
        city,
        count: 0,
        pois: [],
        error: 'geocode_failed',
      };
    }

    const lat = parseFloat(geocoded.lat);
    const lon = parseFloat(geocoded.lon);

    // Be gentle to Nominatim - add a small delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const pois = await overpassQuery(lat, lon, radius, limit);

    return {
      country,
      city,
      lat,
      lon,
      count: pois.length,
      pois,
    };
  } catch (error) {
    return {
      country,
      city,
      count: 0,
      pois: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
