// components/DestinationSearch.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DateRangePicker } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

interface Destination {
  term: string;
  uid: string;
}

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

  const handleSearch = () => {
    if (!selectedDest || !dateRange) {
      alert('Please select destination & dates');
      return;
    }

    const [checkin, checkout] = dateRange;
    
    // Validate 3-day advance booking requirement (matching server validation)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minCheckinDate = new Date(today);
    minCheckinDate.setDate(today.getDate() + 3);
    
    if (checkin < minCheckinDate) {
      alert('Check-in date must be at least 3 days in advance');
      return;
    }
    
    if (checkout <= checkin) {
      alert('Check-out date must be after check-in date');
      return;
    }

    // Use timezone-safe date formatting to avoid date shift issues
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const checkinStr = formatDate(checkin);
    const checkoutStr = formatDate(checkout);
    const guestsParam = Array(rooms).fill(guests).join('|');
    
    console.log('Date conversion:', {
      originalCheckin: checkin,
      originalCheckout: checkout,
      formattedCheckin: checkinStr,
      formattedCheckout: checkoutStr
    });
    
    router.push(
      `/search?destination_id=${selectedDest.uid}` +
      `&checkin=${checkinStr}` +
      `&checkout=${checkoutStr}` +
      `&guests=${guestsParam}&rooms=${rooms}`
    );
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-lg mx-auto">
      <div className="grid grid-cols-1 gap-4">
        {/* Destination */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedDest(null); }}
            placeholder="Where are you going?"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {loading && <p className="absolute right-4 top-10 text-sm text-gray-500">…</p>}
          {results.length > 0 && (
            <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-48 overflow-auto shadow">
              {results.map(d => (
                <li
                  key={d.uid}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setQuery(d.term);
                    setSelectedDest(d);
                    setResults([]);
                  }}
                >
                  {d.term}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Dates */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Travel Dates</label>
          <DateRangePicker
            value={dateRange}
            onChange={val => setDateRange(val as [Date, Date])}
            placeholder="Select check-in & check-out"
            style={{ width: '100%' }}
            showOneCalendar
            shouldDisableDate={date => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const minDate = new Date(today);
              minDate.setDate(today.getDate() + 3);
              return date < minDate;
            }}
            className="border rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum 3 days advance booking required
          </p>
        </div>

        {/* Guests & Rooms */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
            <select
              value={guests}
              onChange={e => setGuests(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {[1,2,3,4,5].map(n => (
                <option key={n} value={n}>
                  {n} pax
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rooms</label>
            <select
              value={rooms}
              onChange={e => setRooms(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {[1,2,3,4].map(n => (
                <option key={n} value={n}>
                  {n} room{n > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <button
          onClick={handleSearch}
          className="w-full py-3 mt-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
        >
          Search Hotels
        </button>
      </div>
    </div>
  );
}
