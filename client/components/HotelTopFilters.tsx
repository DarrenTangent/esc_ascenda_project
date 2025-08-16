// components/HotelTopFilters.tsx
'use client';

import { useEffect, useState } from 'react';

export type Filters = {
  sort?: 'recommended' | 'price_asc' | 'price_desc' | 'rating_desc';
  minPrice?: number | null;
  maxPrice?: number | null;
  minRating?: number | null;
  freeCancellation?: boolean;
};

export default function HotelTopFilters({
  onChange,
  initial,
}: {
  onChange: (f: Filters) => void;
  initial?: Filters;
}) {
  const [sort, setSort] = useState<Filters['sort']>(initial?.sort ?? 'recommended');
  const [minPrice, setMinPrice] = useState<string>(initial?.minPrice?.toString() ?? '');
  const [maxPrice, setMaxPrice] = useState<string>(initial?.maxPrice?.toString() ?? '');
  const [minRating, setMinRating] = useState<string>(initial?.minRating?.toString() ?? '');
  const [freeCancellation, setFreeCancellation] = useState<boolean>(!!initial?.freeCancellation);

  useEffect(() => {
    onChange({
      sort,
      minPrice: minPrice ? Number(minPrice) : null,
      maxPrice: maxPrice ? Number(maxPrice) : null,
      minRating: minRating ? Number(minRating) : null,
      freeCancellation,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, minPrice, maxPrice, minRating, freeCancellation]);

  const clear = () => {
    setSort('recommended');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setFreeCancellation(false);
  };

  return (
    <div className="mb-6 grid gap-3 rounded-xl border border-neutral-200 bg-white p-4 md:grid-cols-4">
      {/* Sort */}
      <div className="flex items-center gap-2">
        <label className="w-24 text-sm text-neutral-600">Sort by</label>
        <select
          value={sort}
          onChange={e => setSort(e.target.value as Filters['sort'])}
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm"
        >
          <option value="recommended">Recommended</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating_desc">Rating</option>
        </select>
      </div>

      {/* Price */}
      <div className="flex items-center gap-2">
        <label className="w-24 text-sm text-neutral-600">Price</label>
        <input
          value={minPrice}
          onChange={e => setMinPrice(e.target.value)}
          placeholder="Min"
          inputMode="numeric"
          className="w-24 rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <span className="text-neutral-400">—</span>
        <input
          value={maxPrice}
          onChange={e => setMaxPrice(e.target.value)}
          placeholder="Max"
          inputMode="numeric"
          className="w-24 rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <label className="w-24 text-sm text-neutral-600">Min rating</label>
        <select
          value={minRating}
          onChange={e => setMinRating(e.target.value)}
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm"
        >
          <option value="">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
          <option value="4.5">4.5+</option>
        </select>
      </div>

      {/* Toggles */}
      <div className="flex items-center justify-between gap-4">
        <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={freeCancellation}
            onChange={e => setFreeCancellation(e.target.checked)}
          />
          Free cancellation
        </label>
        <button
          onClick={clear}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
