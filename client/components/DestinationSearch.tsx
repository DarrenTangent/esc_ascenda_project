'use client';

import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { DateRangePicker } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';

interface Destination {
  term: string;
  uid: string;
}

export default function DestinationSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);

  useEffect(() => {
    if (query.length > 1) {
      const fetchDestinations = async () => {
        setLoading(true);
        try {
          const response = await fetch(`http://localhost:5001/api/destinations/search?q=${query}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          setResults(data.destinations);
        } catch (error) {
          console.error("Failed to fetch destinations:", error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      };

      const debounceTimeout = setTimeout(() => {
        fetchDestinations();
      }, 300);

      return () => clearTimeout(debounceTimeout);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleSearch = () => {
    if (!query || !dateRange) {
      alert('Please enter a destination and select a date range.');
      return;
    }

    console.log('Searching:', {
      destination: query,
      checkIn: dateRange[0],
      checkOut: dateRange[1],
    });
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Destination input + dropdown */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search for a destination..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-400 focus:border-indigo-400 text-black placeholder-gray-400"
        />

        {loading && <p className="absolute mt-1 text-sm text-gray-500">Loading...</p>}

        {results.length > 0 && (
          <ul className="absolute left-0 right-0 z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-auto">
            {results.map((destination) => (
              <li
                key={destination.uid}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-black"
                onClick={() => {
                  setQuery(destination.term);
                  setResults([]);
                }}
              >
                {destination.term}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Date Range Picker with one calendar and two-tap flow */}
      <div>
        <label className="block mb-1 text-sm text-gray-700 font-medium">Travel Dates</label>
        <DateRangePicker
          value={dateRange}
          onChange={(value) => setDateRange(value as [Date, Date])}
          placeholder="Select check-in and check-out"
          style={{ width: '100%' }}
          showOneCalendar
          shouldDisableDate={(date) => date < new Date()}
        />
      </div>

      {/* Search button */}
      <div className="flex justify-end">
        <button
          onClick={handleSearch}
          className="px-4 py-1.5 text-sm bg-indigo-100 text-indigo-700 rounded-md border border-indigo-300 hover:bg-indigo-200 transition"
        >
          Search
        </button>
      </div>
    </div>
  );
}