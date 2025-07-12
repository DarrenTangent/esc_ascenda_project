'use client';

import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';

interface Destination {
  term: string;
  uid: string;
}

export default function DestinationSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);

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
      }, 300); // 300ms debounce delay

      return () => clearTimeout(debounceTimeout);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search for a destination..."
        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      />
      {loading && <p className="absolute mt-1 w-full">Loading...</p>}
      {results.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {results.map((destination) => (
            <li
              key={destination.uid}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
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
  );
}
