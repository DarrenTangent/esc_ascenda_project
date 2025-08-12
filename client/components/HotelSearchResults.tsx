'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import HotelResultCard from './HotelResultCard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 0,
    totalHotels: 0,
    pageSize: 30
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minRating: '',
    sortBy: 'name' // 'name', 'price_low', 'price_high', 'rating'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!params) {
        setLoading(false);
        setError('No search parameters provided');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching hotels with params:', (params ?? new URLSearchParams()).toString());
        console.log('API_BASE_URL:', API_BASE_URL);
        console.log('Full URL:', `${API_BASE_URL}/hotels/search?${(params ?? new URLSearchParams()).toString()}`);
        
        const res = await fetch(
          `${API_BASE_URL}/hotels/search?${(params ?? new URLSearchParams()).toString()}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data: HotelSearchResponse = await res.json();
        console.log('API Response:', data);
        console.log('paginatedHotels array:', data.paginatedHotels);
        console.log('Is paginatedHotels an array?', Array.isArray(data.paginatedHotels));
        console.log('paginatedHotels length:', data.paginatedHotels?.length);
        
        // Handle the new API response format
        setHotels(Array.isArray(data.paginatedHotels) ? data.paginatedHotels : []);
        setPagination({
          page: data.page || 1,
          totalPages: data.totalPages || 0,
          totalHotels: data.totalHotels || 0,
          pageSize: data.pageSize || 30
        });
        
        console.log('Hotels set to:', Array.isArray(data.paginatedHotels) ? data.paginatedHotels.length : 'empty array');
        console.log('Pagination set to:', {
          page: data.page || 1,
          totalPages: data.totalPages || 0,
          totalHotels: data.totalHotels || 0,
          pageSize: data.pageSize || 30
        });
        
      } catch (err) {
        console.error('Hotel search error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load hotels');
        setHotels([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [params]);

  // Filter and sort hotels effect
  useEffect(() => {
    let filtered = [...hotels];
    
    // Apply price filters
    if (filters.minPrice) {
      filtered = filtered.filter(hotel => hotel.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(hotel => hotel.price <= parseFloat(filters.maxPrice));
    }
    
    // Apply rating filter
    if (filters.minRating) {
      filtered = filtered.filter(hotel => hotel.rating >= parseFloat(filters.minRating));
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
    
    setFilteredHotels(filtered);
  }, [hotels, filters]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      minRating: '',
      sortBy: 'name'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="animate-pulse bg-gray-200 h-8 w-48 rounded mb-2"></div>
          <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white h-64 rounded-lg shadow-md"
              />
            ))}
        </div>
      </div>
    );
  }

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

  if (hotels.length === 0 && !loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Debug info */}
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-bold text-blue-800">Debug - No Hotels Found:</h3>
          <p className="text-sm text-blue-700">Hotels array length: {hotels.length}</p>
          <p className="text-sm text-blue-700">Total hotels from API: {pagination.totalHotels}</p>
          <p className="text-sm text-blue-700">Loading: {loading.toString()}</p>
          <p className="text-sm text-blue-700">Error: {error || 'none'}</p>
          <p className="text-sm text-blue-700">API URL: {API_BASE_URL}/hotels/search</p>
          <p className="text-sm text-blue-700">Search params: {params?.toString()}</p>
        </div>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hotels found</h3>
          <p className="text-gray-600 mb-4">
            No hotels found for your search criteria. Try adjusting your filters or search dates.
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Results Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Hotels Found
        </h1>
        <p className="text-gray-600">
          {pagination.totalHotels} hotels • Showing {filteredHotels.length} after filters
        </p>
      </div>
      {/* Hotel Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {hotels.map((hotel) => (
          <div
            key={hotel.id}
            onClick={() => router.push(`/hotel/${hotel.id}?${(params ?? new URLSearchParams()).toString()}`)}
            className="cursor-pointer transform hover:scale-105 transition-transform duration-200"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (SGD)</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (SGD)</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                placeholder="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Star Rating</label>
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
            
            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
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
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Active filters: 
              {filters.minPrice && <span className="ml-2 bg-indigo-100 text-indigo-800 px-2 py-1 rounded">Min: SGD {filters.minPrice}</span>}
              {filters.maxPrice && <span className="ml-2 bg-indigo-100 text-indigo-800 px-2 py-1 rounded">Max: SGD {filters.maxPrice}</span>}
              {filters.minRating && <span className="ml-2 bg-indigo-100 text-indigo-800 px-2 py-1 rounded">{filters.minRating}+ Stars</span>}
            </div>
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Hotel Results Grid */}
      {filteredHotels.length === 0 && hotels.length > 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hotels match your filters</h3>
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
              onClick={() => router.push(`/hotel/${hotel.id}?${params?.toString() || ''}`)}
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
                const newParams = new URLSearchParams((params ?? new URLSearchParams()).toString());
                newParams.set('page', String(pagination.page - 1));
                router.push(`/search?${newParams.toString()}`);
              }
            }}
            disabled={pagination.page <= 1}
            className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
          >
            ← Previous
          </button>
          
          <span className="text-gray-800 font-semibold text-lg">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          
          <button
            onClick={() => {
              if (pagination.page < pagination.totalPages) {
                const newParams = new URLSearchParams((params ?? new URLSearchParams()).toString());
                newParams.set('page', String(pagination.page + 1));
                router.push(`/search?${newParams.toString()}`);
              }
            }}
            disabled={pagination.page >= pagination.totalPages}
            className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
