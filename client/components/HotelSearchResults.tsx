// components/HotelSearchResults.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import HotelResultCard from './HotelResultCard';
import HotelTopFilters, { Filters } from './HotelTopFilters';
import { Hotel, HotelSearchResponse } from '@/types/hotel';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

export default function HotelSearchResults() {
  const params = useSearchParams();
  const router = useRouter();

  // derive initial filters from URL
  const initialFilters: Filters = {
    sort: (params.get('sort') as Filters['sort']) || 'recommended',
    minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : null,
    maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : null,
    minRating: params.get('minRating') ? Number(params.get('minRating')) : null,
    freeCancellation: params.get('freeCancellation') === 'true',
  };

  const [rawHotels, setRawHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalHotels, setTotalHotels] = useState<number>(0);
  const [filters, setFilters] = useState<Filters>(initialFilters);

  // build API URL from current query string (already includes filters when we sync)
  const qs = useMemo(() => (params ?? new URLSearchParams()).toString(), [params]);
  const fetchUrl = `${API_BASE_URL}/hotels/search?${qs}`;

  // fetch
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(fetchUrl);
        const data: HotelSearchResponse = await res.json();
        if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
        const list =
          (Array.isArray(data?.hotels) && data!.hotels) ||
          (Array.isArray(data?.paginatedHotels) && data!.paginatedHotels) ||
          [];
        
        // Transform and filter hotels to ensure required fields
        const transformedHotels = list
          .map(hotel => ({
            ...hotel,
            id: hotel.id || hotel._id || '',
            name: hotel.name || 'Unknown Hotel'
          }))
          .filter(hotel => hotel.id && hotel.name) as Hotel[];
        
        setRawHotels(transformedHotels);
        setTotalHotels(typeof data?.totalHotels === 'number' ? data.totalHotels : transformedHotels.length);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load hotels');
        setRawHotels([]);
        setTotalHotels(0);
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchUrl]);

  // when filters change → update state AND URL
  const handleFiltersChange = (f: Filters) => {
    setFilters(f);

    const p = new URLSearchParams((params ?? new URLSearchParams()).toString());
    // write/clear keys so the URL reflects the UI
    if (f.sort) {
      p.set('sort', f.sort);
    } else {
      p.delete('sort');
    }
    
    if (f.minPrice != null) {
      p.set('minPrice', String(f.minPrice));
    } else {
      p.delete('minPrice');
    }
    
    if (f.maxPrice != null) {
      p.set('maxPrice', String(f.maxPrice));
    } else {
      p.delete('maxPrice');
    }
    
    if (f.minRating != null) {
      p.set('minRating', String(f.minRating));
    } else {
      p.delete('minRating');
    }
    
    if (f.freeCancellation) {
      p.set('freeCancellation', 'true');
    } else {
      p.delete('freeCancellation');
    }

    // reset to page 1 whenever filters change
    p.delete('page');

    router.push(`/search?${p.toString()}`);
  };

  // client-side filtering (still helpful if backend ignores params)
  const hotels = useMemo(() => {
    let list = [...rawHotels];

    if (filters.minPrice != null) {
      list = list.filter(h => (typeof h.price === 'number' ? h.price >= filters.minPrice! : true));
    }
    if (filters.maxPrice != null) {
      list = list.filter(h => (typeof h.price === 'number' ? h.price <= filters.maxPrice! : true));
    }
    if (filters.minRating != null) {
      list = list.filter(h => (h.rating ?? 0) >= filters.minRating!);
    }
    if (filters.freeCancellation) {
      list = list.filter(h => !!h.freeCancellation);
    }

    switch (filters.sort) {
      case 'price_asc':
        list.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
        break;
      case 'price_desc':
        list.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
        break;
      case 'rating_desc':
        list.sort((a, b) => (b.rating ?? -Infinity) - (a.rating ?? -Infinity));
        break;
      default:
        break; // recommended = API order
    }

    return list;
  }, [rawHotels, filters]);

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 h-6 w-40 animate-pulse rounded bg-neutral-200" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white p-4 shadow">
              <div className="aspect-[16/10] w-full animate-pulse rounded-md bg-neutral-200" />
              <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-neutral-200" />
              <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-neutral-200" />
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <h3 className="font-medium">Error loading hotels</h3>
          <p className="mt-1 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      {/* Filters (reads URL on load via initial props, writes to URL on change) */}
      <HotelTopFilters onChange={handleFiltersChange} initial={initialFilters} />

      {/* Summary */}
      <div className="mb-4 text-sm text-neutral-600">
        Showing <span className="font-medium">{hotels.length}</span> of{' '}
        <span className="font-medium">{totalHotels}</span> hotels
      </div>

      {/* Grid */}
      <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {hotels.map((h: Hotel, idx: number) => {
          const stableId = h.id ?? h._id ?? `${h.name ?? 'hotel'}-${idx}`;
          return (
            <div
              key={stableId}
              onClick={() =>
                router.push(
                  `/hotel/${h.id ?? h._id ?? ''}?${
                    (params ?? new URLSearchParams()).toString()
                  }`
                )
              }
              className="cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
            >
              <HotelResultCard hotel={h} />
            </div>
          );
        })}
      </div>
    </main>
  );
}
