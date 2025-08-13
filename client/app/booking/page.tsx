// app/booking/page.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';

function BookingContent() {
  const sp = useSearchParams();
  const router = useRouter();

  const data = useMemo(() => {
    return {
      hotel_id: sp.get('hotel_id') ?? '',
      checkin: sp.get('checkin') ?? '',
      checkout: sp.get('checkout') ?? '',
      rooms: sp.get('rooms') ?? '1',
      guests: sp.get('guests') ?? '2',
    };
  }, [sp]);

  const handleContinue = () => {
    // TODO: replace with your real checkout flow
    alert(`Proceeding to payment for hotel ${data.hotel_id} (${data.checkin} → ${data.checkout})`);
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-[-0.01em] text-neutral-900">
        Review your booking
      </h1>

      <div className="mt-6 grid gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <dt className="text-neutral-500">Hotel ID</dt>
            <dd className="font-medium text-neutral-900">{data.hotel_id}</dd>

            <dt className="text-neutral-500">Check-in</dt>
            <dd className="font-medium text-neutral-900">{data.checkin}</dd>

            <dt className="text-neutral-500">Check-out</dt>
            <dd className="font-medium text-neutral-900">{data.checkout}</dd>

            <dt className="text-neutral-500">Rooms</dt>
            <dd className="font-medium text-neutral-900">{data.rooms}</dd>

            <dt className="text-neutral-500">Guests</dt>
            <dd className="font-medium text-neutral-900">{data.guests}</dd>
          </dl>

          <button
            onClick={handleContinue}
            className="mt-6 w-full rounded-lg bg-indigo-600 py-3 text-white font-semibold hover:bg-indigo-700 transition"
          >
            Continue to payment
          </button>

          <button
            onClick={() => router.back()}
            className="mt-3 w-full rounded-lg border border-neutral-300 py-3 text-neutral-800 hover:bg-neutral-50 transition"
          >
            Back
          </button>
        </div>
      </div>
    </main>
  );
}

function BookingLoadingFallback() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="animate-pulse">
        <div className="mb-6 h-8 w-64 rounded bg-gray-200"></div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="h-4 w-20 rounded bg-gray-200"></div>
            <div className="h-4 w-32 rounded bg-gray-200"></div>
            <div className="h-4 w-20 rounded bg-gray-200"></div>
            <div className="h-4 w-24 rounded bg-gray-200"></div>
            <div className="h-4 w-20 rounded bg-gray-200"></div>
            <div className="h-4 w-24 rounded bg-gray-200"></div>
          </div>
          <div className="mt-6 h-12 w-full rounded bg-gray-200"></div>
          <div className="mt-3 h-12 w-full rounded bg-gray-200"></div>
        </div>
      </div>
    </main>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<BookingLoadingFallback />}>
      <BookingContent />
    </Suspense>
  );
}
