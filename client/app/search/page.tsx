// app/search/page.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import HotelSearchResults from '@/components/HotelSearchResults';

function SearchContent() {
  const params = useSearchParams();

  // prefill from ?destination=..., ?guests=..., ?rooms=...
  const prefill = useMemo(() => {
    return {
      destination: params.get('destination') ?? '',
      guests: params.get('guests') ?? '2',
      rooms: params.get('rooms') ?? '1',
      // keep any dates that might be passed in:
      checkin: params.get('checkin') ?? '',
      checkout: params.get('checkout') ?? '',
    };
  }, [params]);

  // If your HotelSearchResults expects to be controlled, you can pass these down
  // or just let HotelSearchResults read from useSearchParams internally.
  // Here we just render it and let it use the URL to fetch.

  // Trigger an effect if you want to, for example, scroll to results on mount:
  useEffect(() => {
    // Any UI side-effects can go here
  }, [prefill]);

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="mb-4 font-serif text-2xl">Search results</h1>
        {/* If you have a top filter/search bar, render it here and prefill it
            with `prefill.destination`, `prefill.guests`, etc. */}
        <HotelSearchResults />
      </div>
    </main>
  );
}

function SearchLoadingFallback() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="animate-pulse">
          <div className="mb-4 h-8 w-48 rounded bg-gray-200"></div>
          <div className="space-y-4">
            <div className="h-32 w-full rounded bg-gray-200"></div>
            <div className="h-32 w-full rounded bg-gray-200"></div>
            <div className="h-32 w-full rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoadingFallback />}>
      <SearchContent />
    </Suspense>
  );
}
