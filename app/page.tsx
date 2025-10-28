'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Shop {
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
}

interface CountryStats {
  cities: number;
  shops: number;
}

export default function Home() {
  const [countryStats, setCountryStats] = useState<Record<string, CountryStats>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Shop[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/countries')
      .then(res => res.json())
      .then(data => {
        setCountryStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load countries:', err);
        setLoading(false);
      });
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    try {
      const res = await fetch(`/api/shops?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    }
  };

  const countries = Object.keys(countryStats).sort();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading countries...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="hero">
        <h1 className="hero-title">Motorcycle Repair Finder</h1>
        <p className="hero-subtitle">
          Discover premium motorcycle repair shops across Europe
        </p>

        <div className="search-box">
          <div className="search-input-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search shops, cities, or countries..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchQuery && (
              <button
                className="search-clear"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setIsSearching(false);
                }}
              >
                ✕
              </button>
            )}
          </div>

          {isSearching && searchResults.length > 0 && (
            <div className="search-results-dropdown">
              <div className="search-results-header">
                Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
              </div>
              <div className="search-results-list">
                {searchResults.slice(0, 10).map((shop, idx) => (
                  <Link
                    href={`/country/${encodeURIComponent(shop.country)}`}
                    key={idx}
                    className="search-result-item"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setIsSearching(false);
                    }}
                  >
                    <div className="search-result-main">
                      <div className="search-result-name">{shop.name}</div>
                      <div className="search-result-type">{shop.business_type}</div>
                    </div>
                    <div className="search-result-location">
                      {shop.city_name}, {shop.country}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="countries-grid">
        {countries.map((country) => {
          const stats = countryStats[country];
          return (
            <Link
              href={`/country/${encodeURIComponent(country)}`}
              key={country}
              className="country-card"
            >
              <div className="country-card-content">
                <h2 className="country-name">{country}</h2>
                <div className="country-stats">
                  <span className="stat-item">
                    <span className="stat-icon">🏪</span>
                    {stats.shops} shops
                  </span>
                  <span className="stat-item">
                    <span className="stat-icon">🏙️</span>
                    {stats.cities} {stats.cities === 1 ? 'city' : 'cities'}
                  </span>
                </div>
              </div>
              <div className="country-card-arrow">→</div>
            </Link>
          );
        })}
      </main>
    </div>
  );
}
