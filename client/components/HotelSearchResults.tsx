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

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching hotels with params:', params.toString());
        console.log('API_BASE_URL:', API_BASE_URL);
        console.log('Full URL:', `${API_BASE_URL}/hotels/search?${params.toString()}`);
        
        const res = await fetch(
          `${API_BASE_URL}/hotels/search?${params.toString()}`,
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

  if (hotels.length === 0) {
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
          {pagination.totalHotels} hotels • Page {pagination.page} of {pagination.totalPages}
        </p>
      </div>

      {/* Hotel Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {hotels.map((hotel) => (
          <div
            key={hotel.id}
            onClick={() => router.push(`/hotel/${hotel.id}?${params.toString()}`)}
            className="cursor-pointer transform hover:scale-105 transition-transform duration-200"
          >
            <HotelResultCard hotel={hotel} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4">
          <button
            onClick={() => {
              if (pagination.page > 1) {
                const newParams = new URLSearchParams(params.toString());
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
                const newParams = new URLSearchParams(params.toString());
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
