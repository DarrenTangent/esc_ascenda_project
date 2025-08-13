'use client';

import { Suspense } from 'react';
import BookingForm from '@/components/BookingForm';

function BookingLoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading booking form...</p>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<BookingLoadingFallback />}>
      <BookingForm />
    </Suspense>
  );
}
