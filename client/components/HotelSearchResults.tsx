'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import HotelResultCard from './HotelResultCard';

export default function HotelSearchResults() {
  const params = useSearchParams();
  const router = useRouter();

  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5001/api/hotels/search?${params.toString()}`
        );
        const data = await res.json();
        setHotels(Array.isArray(data.paginatedHotels) ? data.paginatedHotels : []);
      } catch (err) {
        console.error('Fetch error', err);
        setHotels([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-white h-64 rounded-lg shadow-md"
            />
          ))}
      </div>
    );
  }

  if (hotels.length === 0) {
    return (
      <div className="p-8 text-center text-gray-600">
        No hotels found for those filters. Try adjusting your search.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {hotels.map((h) => (
        <div
          key={h.id}
          onClick={() => router.push(`/hotel/${h.id}?${params.toString()}`)}
          className="cursor-pointer"
        >
          <HotelResultCard hotel={h} />
        </div>
      ))}
    </div>
  );
}
