// app/bookings/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Booking = {
  _id: string;
  hotelName: string;
  hotelAddress?: string;
  checkIn: string;
  checkOut: string;
  nights?: number;
  guests?: string; // your schema stores guests/rooms as string
  rooms?: string;
  totalPrice?: number;
  createdAt?: string;
  roomDescription?: string;
  paid?: boolean;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
  'http://localhost:5001/api';

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Pull id/email from the object you save on login/signup
  const account = useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      setErr(null);

      try {
        // If not logged in, just show empty state gracefully
        if (!account?.email && !account?.id && !account?._id) {
          setBookings([]);
          return;
        }
        const userId = account.id || account._id;
        const qs = new URLSearchParams();
        if (userId) qs.set('userId', userId);
        if (account.email) qs.set('email', account.email);

        const res = await fetch(`${API_BASE}/bookings/by-account?${qs.toString()}`);
        if (!res.ok) {
          // 404 etc. → treat as “no bookings” rather than crash
          if (res.status === 404) {
            setBookings([]);
            return;
          }
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        setBookings(Array.isArray(data?.bookings) ? data.bookings : []);
      } catch (e) {
        console.error(e);
        setErr('Failed to load your bookings. Please try again.');
        setBookings([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, [account]);

  const fmtDate = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '—';

  const fmtMoney = (n?: number) =>
    typeof n === 'number'
      ? new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' }).format(n)
      : '—';

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="mb-6 text-4xl font-bold tracking-tight">My bookings</h1>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="h-5 w-40 animate-pulse rounded bg-neutral-200" />
          <div className="mt-3 h-24 animate-pulse rounded-lg bg-neutral-100" />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8 flex items-end justify-between">
        <h1 className="text-4xl font-bold tracking-tight">My bookings</h1>
        <button
          onClick={() => router.push('/')}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          Book another stay
        </button>
      </div>

      {err && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {err}
        </div>
      )}

      {!bookings || bookings.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-neutral-900">
            You have no bookings yet
          </h2>
          <p className="mt-2 text-neutral-600">
            When you book with the same signed-in account, your reservations will appear here.
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Book another stay
          </button>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2">
          {bookings.map((b) => (
            <li
              key={b._id}
              className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-blue-700 group-hover:text-blue-800">
                    {b.hotelName || 'Hotel'}
                  </h3>
                  {b.hotelAddress ? (
                    <p className="text-sm text-neutral-600">{b.hotelAddress}</p>
                  ) : null}
                </div>
                <span
                  className={[
                    'rounded-full px-2 py-1 text-xs font-medium',
                    b.paid
                      ? 'bg-green-100 text-green-800 ring-1 ring-green-200'
                      : 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
                  ].join(' ')}
                >
                  {b.paid ? 'Confirmed' : 'Pending'}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-neutral-50 p-3 ring-1 ring-neutral-200">
                  <div className="text-neutral-500">Check-in</div>
                  <div className="font-medium text-neutral-900">{fmtDate(b.checkIn)}</div>
                </div>
                <div className="rounded-lg bg-neutral-50 p-3 ring-1 ring-neutral-200">
                  <div className="text-neutral-500">Check-out</div>
                  <div className="font-medium text-neutral-900">{fmtDate(b.checkOut)}</div>
                </div>
                <div className="rounded-lg bg-neutral-50 p-3 ring-1 ring-neutral-200">
                  <div className="text-neutral-500">Guests • Rooms</div>
                  <div className="font-medium text-neutral-900">
                    {(b.guests ?? '—')} • {(b.rooms ?? '—')}
                  </div>
                </div>
                <div className="rounded-lg bg-neutral-50 p-3 ring-1 ring-neutral-200">
                  <div className="text-neutral-500">Total</div>
                  <div className="font-semibold text-neutral-900">{fmtMoney(b.totalPrice)}</div>
                </div>
              </div>

              {b.roomDescription ? (
                <div className="mt-3 rounded-md bg-neutral-50 p-3 text-sm text-neutral-700 ring-1 ring-neutral-200">
                  {b.roomDescription}
                </div>
              ) : null}

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() =>
                    router.push(`/booking/confirmation?bookingId=${encodeURIComponent(b._id)}`)
                  }
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-blue-700 hover:underline"
                >
                  View details
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
