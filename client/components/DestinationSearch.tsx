'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DateRangePicker } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

interface Destination { term: string; uid: string; }

export default function DestinationSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Destination[]>([]);
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const router = useRouter();

  useEffect(() => {
    if (query.length > 1) {
      const t = setTimeout(async () => {
        setLoading(true);
        try {
          const res = await fetch(
            `${API_BASE_URL}/destinations/search?q=${encodeURIComponent(query)}`
          );
          if (!res.ok) throw new Error();
          const data = await res.json();
          setResults(data.destinations);
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 300);
      return () => clearTimeout(t);
    } else {
      setResults([]);
    }
  }, [query]);

  const formatDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;

  const handleSearch = () => {
    if (!selectedDest || !dateRange) {
      alert('Please select destination & dates');
      return;
    }
    const [checkin, checkout] = dateRange;
    const today = new Date(); today.setHours(0,0,0,0);
    if (checkin < today) { alert("You can't pick dates before today."); return; }
    if (checkout <= checkin) { alert('Check-out must be after check-in'); return; }

    router.push(
      `/search?destination_id=${selectedDest.uid}` +
        `&checkin=${formatDate(checkin)}` +
        `&checkout=${formatDate(checkout)}` +
        `&rooms=${rooms}&guests=${guests}`
    );
  };

  const minDate = (() => { const t = new Date(); t.setHours(0,0,0,0); return t; })();

  return (
    <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-12">
      {/* Destination */}
      <div className="sm:col-span-5">
        <label className="mb-1 block text-sm font-medium text-slate-800">
          Destination
        </label>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedDest(null); }}
            placeholder="Where are you going?"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-300"
          />
          {loading && (
            <span className="absolute right-3 top-2.5 text-sm text-slate-500">…</span>
          )}
          {results.length > 0 && (
            <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow">
              {results.map((d) => (
                <li
                  key={d.uid}
                  className="cursor-pointer px-4 py-2 hover:bg-slate-100"
                  onClick={() => { setQuery(d.term); setSelectedDest(d); setResults([]); }}
                >
                  {d.term}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          onClick={handleSearch}
          className="mt-3 w-full rounded-lg bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 transition-colors sm:hidden"
        >
          Search
        </button>
      </div>

      {/* Dates */}
      <div className="sm:col-span-4">
        <label className="mb-1 block text-sm font-medium text-slate-800">
          Travel Dates
        </label>
        <div className="rounded-lg border border-slate-300 bg-white px-2 py-1 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-300">
          <DateRangePicker
            value={dateRange}
            onChange={(val) => setDateRange(val as [Date, Date])}
            placeholder="Select check-in & check-out"
            style={{ width: '100%' }}
            showOneCalendar
            shouldDisableDate={(date) => date < minDate}
            className="!border-0"
          />
        </div>
        <p className="mt-1 text-xs text-slate-600">
          You can’t pick dates before today.
        </p>
      </div>

      {/* Guests */}
      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium text-slate-800">
          Guests
        </label>
        <select
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-300"
        >
          {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n} pax</option>)}
        </select>
      </div>

      {/* Rooms */}
      <div className="sm:col-span-1">
        <label className="mb-1 block text-sm font-medium text-slate-800">
          Rooms
        </label>
        <select
          value={rooms}
          onChange={(e) => setRooms(Number(e.target.value))}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-300"
        >
          {[1,2,3,4].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      {/* Search (desktop) */}
      <div className="hidden sm:col-span-12 sm:flex sm:justify-start">
        <button
          onClick={handleSearch}
          className="mt-2 rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </div>
    </div>
  );
}
