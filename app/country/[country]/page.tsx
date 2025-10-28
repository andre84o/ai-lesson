'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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

export default function CountryPage() {
  const params = useParams();
  const country = decodeURIComponent(params.country as string);

  const [shops, setShops] = useState<Shop[]>([]);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/shops?country=${encodeURIComponent(country)}`)
      .then(res => res.json())
      .then((data) => {
        setShops(data.results || []);
        setFilteredShops(data.results || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load shops:', err);
        setLoading(false);
      });
  }, [country]);

  useEffect(() => {
    let filtered = shops;

    // Filter by city
    if (selectedCity && selectedCity !== 'all') {
      filtered = filtered.filter((shop) => shop.city_name === selectedCity);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (shop) =>
          shop.name.toLowerCase().includes(query) ||
          shop.business_type.toLowerCase().includes(query) ||
          shop.address.toLowerCase().includes(query)
      );
    }

    setFilteredShops(filtered);
  }, [selectedCity, searchQuery, shops]);

  const cities = Array.from(new Set(shops.map((shop) => shop.city_name))).sort();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading shops...</p>
      </div>
    );
  }

  return (
    <div className="search-container">
      <Link href="/" className="back-link">
        ← Back to countries
      </Link>

      <header className="search-header">
        <h1 className="search-title">{country}</h1>
        <p className="search-subtitle">
          {shops.length} motorcycle repair shops in {cities.length} {cities.length === 1 ? 'city' : 'cities'}
        </p>
      </header>

      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="city-filter" className="filter-label">
            Filter by City
          </label>
          <select
            id="city-filter"
            className="form-select"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            <option value="all">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="search-filter" className="filter-label">
            Search Shops
          </label>
          <input
            id="search-filter"
            type="text"
            className="form-input"
            placeholder="Search by name, type, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <section className="shops-section">
        <div className="shops-header">
          <h2 className="shops-title">
            {filteredShops.length === shops.length
              ? 'All Shops'
              : `Filtered Results (${filteredShops.length})`}
          </h2>
        </div>

        {filteredShops.length === 0 ? (
          <div className="no-results">
            <p>No shops found matching your criteria.</p>
          </div>
        ) : (
          <div className="shops-grid">
            {filteredShops.map((shop, idx) => (
              <div key={idx} className="shop-card">
                <div className="shop-header">
                  <h3 className="shop-name">{shop.name}</h3>
                  {shop.rating && parseFloat(shop.rating) > 0 && (
                    <div className="shop-rating">
                      <span className="rating-star">⭐</span>
                      <span className="rating-value">{shop.rating}</span>
                      {shop.reviews_count > 0 && (
                        <span className="rating-count">({shop.reviews_count})</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="shop-type">{shop.business_type}</div>

                <div className="shop-details">
                  <div className="shop-detail-item">
                    <span className="detail-icon">📍</span>
                    <span className="detail-text">{shop.address}</span>
                  </div>

                  <div className="shop-detail-item">
                    <span className="detail-icon">🏙️</span>
                    <span className="detail-text">{shop.city_name}</span>
                  </div>

                  {shop.phone && (
                    <div className="shop-detail-item">
                      <span className="detail-icon">📞</span>
                      <a href={`tel:${shop.phone}`} className="detail-link">
                        {shop.phone}
                      </a>
                    </div>
                  )}

                  {shop.website && (
                    <div className="shop-detail-item">
                      <span className="detail-icon">🌐</span>
                      <a
                        href={shop.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="detail-link"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}

                  {shop.hours && (
                    <div className="shop-detail-item">
                      <span className="detail-icon">🕒</span>
                      <span className="detail-text">{shop.hours}</span>
                    </div>
                  )}
                </div>

                {shop.latitude && shop.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${shop.latitude},${shop.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shop-map-link"
                  >
                    View on Map →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
