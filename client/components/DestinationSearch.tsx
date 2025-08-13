'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DateRangePicker } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

type Destination = { term: string; uid: string };

export default function DestinationSearch() {
  const router = useRouter();
  const params = useSearchParams();

  // --- state ---
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Destination[]>([]);
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);

  // --- prefill from URL (for back navigation or refresh) ---
  useEffect(() => {
    const destination = params.get('destination') || '';
    const guestsParam = params.get('guests');
    const roomsParam = params.get('rooms');

    if (destination) setQuery(destination);
    if (guestsParam) setGuests(Number(guestsParam));
    if (roomsParam) setRooms(Number(roomsParam));
  }, [params]);

  // --- destination search with debounce ---
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setSelectedDest(null);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/destinations/search?q=${encodeURIComponent(query)}`
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setResults(Array.isArray(data?.destinations) ? data.destinations : []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  // --- helpers ---
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleSearch = () => {
    if (!selectedDest || !dateRange) {
      alert('Please select a destination and travel dates.');
      return;
    }
    const [checkin, checkout] = dateRange;
    if (checkout <= checkin) {
      alert('Check-out must be after check-in.');
      return;
    }

    const checkinStr = formatDate(checkin);
    const checkoutStr = formatDate(checkout);
    const guestsParam = Array(rooms).fill(guests).join('|'); // format like "2|2" if needed

    router.push(
      `/search?destination=${encodeURIComponent(
        selectedDest.term
      )}&destination_id=${encodeURIComponent(
        selectedDest.uid
      )}&checkin=${checkinStr}&checkout=${checkoutStr}&guests=${guestsParam}&rooms=${rooms}`
    );
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
        {/* Destination */}
        <div className="relative md:col-span-4">
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Destination
          </label>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedDest(null);
            }}
            placeholder="Where are you going?"
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none ring-0 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {loading && (
            <span className="absolute right-3 top-10 text-xs text-neutral-500">
              …
            </span>
          )}
          {results.length > 0 && (
            <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-neutral-200 bg-white shadow">
              {results.map((d) => (
                <li
                  key={d.uid}
                  onClick={() => {
                    setQuery(d.term);
                    setSelectedDest(d);
                    setResults([]);
                  }}
                  className="cursor-pointer px-3 py-2 hover:bg-neutral-50"
                >
                  {d.term}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Dates */}
        <div className="md:col-span-4">
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Travel Dates
          </label>
          <div className="h-11 w-full">
            <DateRangePicker
              size="lg"
              value={dateRange}
              onChange={(val) => setDateRange(val as [Date, Date] | null)}
              placeholder="Select check-in & check-out"
              showOneCalendar
              shouldDisableDate={(date) => {
                const d = new Date(date);
                d.setHours(0, 0, 0, 0);
                return d < today;
              }}
              className="w-full"
              editable={false}
              placement="bottomStart"
            />
          </div>
        </div>

        {/* Guests */}
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Guests
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none ring-0 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} {n > 1 ? 'guests' : 'guest'}
              </option>
            ))}
          </select>
        </div>

        {/* Rooms */}
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Rooms
          </label>
          <select
            value={rooms}
            onChange={(e) => setRooms(Number(e.target.value))}
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none ring-0 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n} room{n > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Search button */}
        <div className="md:col-span-12 flex items-end">
          <button
            onClick={handleSearch}
            className="h-11 w-full rounded-lg bg-blue-600 font-semibold text-white transition hover:bg-blue-700 md:w-auto md:px-6"
          >
            Search Hotels
          </button>
        </div>
      </div>
    </div>
  );
}

