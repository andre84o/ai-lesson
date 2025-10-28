"""Simple motorcycle repair POI search using Nominatim + Overpass.

Usage example:
    python -m src.search_engine --country "Italy" --city "Milan" --radius 10000 --limit 25

This module is intended as a starting point. It queries public OSM services at runtime.
"""

import argparse
import csv
import json
import time
from typing import Dict, Any, List, Optional

import requests

USER_AGENT = "motorcycle-search-agent/1.0 (your-email@example.com)"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
OVERPASS_URL = "https://overpass-api.de/api/interpreter"


def load_cities(path: str) -> List[Dict[str, str]]:
    rows = []
    with open(path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for r in reader:
            rows.append({"country": r['Country'].strip(), "city": r['City'].strip()})
    return rows


def geocode_city(city: str, country: str) -> Optional[Dict[str, Any]]:
    params = {"city": city, "country": country, "format": "json", "limit": 1}
    headers = {"User-Agent": USER_AGENT}
    resp = requests.get(NOMINATIM_URL, params=params, headers=headers, timeout=15)
    resp.raise_for_status()
    data = resp.json()
    if not data:
        return None
    return data[0]


def overpass_query(lat: float, lon: float, radius: int = 10000, limit: int = 50) -> List[Dict[str, Any]]:
    # Flexible Overpass query: look for nodes/ways/relations with tags or name keywords indicating motorcycle repair
    query = f"""
[out:json][timeout:25];
(
  node(around:{radius},{lat},{lon})[shop~"motorcycle|car_repair|garage|bicycle",i];
  way(around:{radius},{lat},{lon})[shop~"motorcycle|car_repair|garage|bicycle",i];
  relation(around:{radius},{lat},{lon})[shop~"motorcycle|car_repair|garage|bicycle",i];
  node(around:{radius},{lat},{lon})[name~"motorcycle|moto|motorbike|motorrad|mc",i];
  way(around:{radius},{lat},{lon})[name~"motorcycle|moto|motorbike|motorrad|mc",i];
  relation(around:{radius},{lat},{lon})[name~"motorcycle|moto|motorbike|motorrad|mc",i];
);
out center {limit};
""".strip()
    headers = {"User-Agent": USER_AGENT}
    resp = requests.post(OVERPASS_URL, data={'data': query}, headers=headers, timeout=60)
    resp.raise_for_status()
    data = resp.json()
    elements = data.get('elements', [])[:limit]
    results = []
    for e in elements:
        tags = e.get('tags', {})
        lat_e = e.get('lat') or (e.get('center') or {}).get('lat')
        lon_e = e.get('lon') or (e.get('center') or {}).get('lon')
        results.append({
            'id': e.get('id'),
            'type': e.get('type'),
            'lat': lat_e,
            'lon': lon_e,
            'tags': tags,
        })
    return results


def search_city(country: str, city: str, radius: int = 10000, limit: int = 50) -> Dict[str, Any]:
    geocoded = geocode_city(city, country)
    if not geocoded:
        return {"country": country, "city": city, "error": "geocode_failed"}
    lat = float(geocoded['lat'])
    lon = float(geocoded['lon'])
    time.sleep(1)  # be gentle to Nominatim
    pois = overpass_query(lat, lon, radius=radius, limit=limit)
    return {
        'country': country,
        'city': city,
        'lat': lat,
        'lon': lon,
        'count': len(pois),
        'pois': pois,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--country', required=False)
    parser.add_argument('--city', required=False)
    parser.add_argument('--radius', type=int, default=10000)
    parser.add_argument('--limit', type=int, default=50)
    parser.add_argument('--cities-file', default='data/cities.csv')
    args = parser.parse_args()

    if args.country and args.city:
        res = search_city(args.country, args.city, radius=args.radius, limit=args.limit)
        print(json.dumps(res, indent=2, ensure_ascii=False))
        return

    cities = load_cities(args.cities_file)
    results = []
    for c in cities:
        print(f"Searching {c['city']}, {c['country']}...")
        try:
            r = search_city(c['country'], c['city'], radius=args.radius, limit=args.limit)
        except Exception as e:
            r = {'country': c['country'], 'city': c['city'], 'error': str(e)}
        results.append(r)
        # gentle pause between city requests
        time.sleep(1)

    print(json.dumps(results, indent=2, ensure_ascii=False))


if __name__ == '__main__':
    main()
