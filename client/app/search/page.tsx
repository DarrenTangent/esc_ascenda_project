// app/search/page.tsx
'use client';

import { Suspense } from 'react';
import HotelSearchResults from '@/components/HotelSearchResults';

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search results...</div>}>
      <HotelSearchResults />
    </Suspense>
  );
}
