// app/search/page.tsx
'use client';

import HotelSearchResults from '@/components/HotelSearchResults';

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="mb-4 font-serif text-2xl">Search results</h1>
        <HotelSearchResults />
      </div>
    </main>
  );
}
