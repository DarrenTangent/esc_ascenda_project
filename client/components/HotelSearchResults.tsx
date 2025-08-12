'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import HotelResultCard from './HotelResultCard';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

interface Hotel {
  id: string;
  name: string;
  price: number;
  rating: number;
  address: string;
  imageUrl?: string;
  amenities: string[];
  freeCancellation: boolean;
  searchRank: number;
  latitude: number;
  longitude: number;
}

interface HotelSearchResponse {
  page: number;
  pageSize: number;
  totalPages: number;
  totalHotels: number;
  paginatedHotels: Hotel[];
}

export default function HotelSearchResults() {
  const params = useSearchParams();
  const router = useRouter();

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 0,
    totalHotels: 0,
    pageSize: 30,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minRating: '',
    sortBy: 'name' as 'name' | 'price_low' | 'price_high' | 'rating',
  });

  // Fetch data
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const query = params?.toString() ?? '';
        const res = await fetch(`${API_BASE_URL}/hotels/search?${query}`);
        if (!res.ok) {
          const extra = await res.json().catch(() => ({}));
          throw new Error(extra.message || `HTTP ${res.status}`);
        }
        const data: HotelSearchResponse = await res.json();

        setHotels(Array.isArray(data.paginatedHotels) ? data.paginatedHotels : []);
        setPagination({
          page: data.page || 1,
          totalPages: data.totalPages || 0,
          totalHotels: data.totalHotels || 0,
          pageSize: data.pageSize || 30,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load hotels');
        setHotels([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [params]);

  // Apply filters & sorting
  useEffect(() => {
    let next = [...hotels];

    if (filters.minPrice) next = next.filter(h => h.price >= Number(filters.minPrice));
    if (filters.maxPrice) next = next.filter(h => h.price <= Number(filters.maxPrice));
    if (filters.minRating) next = next.filter(h => h.rating >= Number(filters.minRating));

    next.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price_low':  return a.price - b.price;
        case 'price_high': return b.price - a.price;
        case 'rating':     return b.rating - a.rating;
        default:           return a.name.localeCompare(b.name);
      }
    });

    setFilteredHotels(next);
  }, [hotels, filters]);

  const handleFilterChange = (key: keyof typeof filters, value: string) =>
    setFilters(prev => ({ ...prev, [key]: value }));
  const clearFilters = () =>
    setFilters({ minPrice: '', maxPrice: '', minRating: '', sortBy: 'name' });

  // Loading
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="animate-pulse bg-gray-200 h-8 w-48 rounded mb-2" />
          <div className="animate-pulse bg-gray-200 h-4 w-32 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white h-64 rounded-lg shadow-md" />
          ))}
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <h3 className="font-medium">Error loading hotels</h3>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // No results from API
  if (hotels.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hotels found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search dates or destination.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            New Search
          </button>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Hotels Found</h1>
        <p className="text-gray-600">
          {pagination.totalHotels} hotels • Showing {filteredHotels.length} after filters
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(s => !s)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
        <span className="text-sm text-gray-600">
          Page {pagination.page} of {pagination.totalPages}
        </span>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Price (SGD)
            </label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Price (SGD)
            </label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              placeholder="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Star Rating
            </label>
            <select
              value={filters.minRating}
              onChange={(e) => handleFilterChange('minRating', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Any Rating</option>
              <option value="3">3+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="5">5 Stars</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="name">Hotel Name</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Rating: High to Low</option>
            </select>
          </div>
        </div>
      )}

      {(filters.minPrice || filters.maxPrice || filters.minRating) && (
        <div className="mt-2 mb-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Active filters:
            {filters.minPrice && (
              <span className="ml-2 bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                Min: SGD {filters.minPrice}
              </span>
            )}
            {filters.maxPrice && (
              <span className="ml-2 bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                Max: SGD {filters.maxPrice}
              </span>
            )}
            {filters.minRating && (
              <span className="ml-2 bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                {filters.minRating}+ Stars
              </span>
            )}
          </div>
          <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-800 font-medium">
            Clear Filters
          </button>
        </div>
      )}

      {/* Results */}
      {filteredHotels.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hotels match your filters
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your price range or rating requirements.
          </p>
          <button
            onClick={clearFilters}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredHotels.map((hotel) => (
            <div
              key={hotel.id}
              onClick={() =>
                router.push(`/hotel/${hotel.id}?${params?.toString() || ''}`)
              }
              className="cursor-pointer transform hover:scale-105 transition-transform duration-200"
            >
              <HotelResultCard hotel={hotel} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4">
          <button
            onClick={() => {
              if (pagination.page > 1) {
                const q = new URLSearchParams(params?.toString() || '');
                q.set('page', String(pagination.page - 1));
                router.push(`/search?${q.toString()}`);
              }
            }}
            disabled={pagination.page <= 1}
            className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 disabled:opacity-50"
          >
            ← Previous
          </button>
          <span className="text-gray-800 font-semibold text-lg">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => {
              if (pagination.page < pagination.totalPages) {
                const q = new URLSearchParams(params?.toString() || '');
                q.set('page', String(pagination.page + 1));
                router.push(`/search?${q.toString()}`);
              }
            }}
            disabled={pagination.page >= pagination.totalPages}
            className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
