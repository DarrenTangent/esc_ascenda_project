// components/HotelTopFilters.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';

export type Filters = {
  sort: 'recommended' | 'price_asc' | 'price_desc' | 'rating_desc';
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number | null;
  freeCancellation: boolean;
};

type Props = {
  initial?: Partial<Filters>;
  onChange: (f: Filters) => void;
};

const DEFAULTS: Filters = {
  sort: 'recommended',
  minPrice: null,
  maxPrice: null,
  minRating: null,
  freeCancellation: false,
};

export default function HotelTopFilters({ initial, onChange }: Props) {
  const init = useMemo(
    () => ({ ...DEFAULTS, ...(initial ?? {}) }) as Filters,
    [initial]
  );

  const [form, setForm] = useState<Filters>(init);

  // keep local state in sync when URL/initial changes
  useEffect(() => setForm(init), [init]);

  const apply = () => onChange(form);

  const onEnterApply: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') apply();
  };

  const fieldWrap = 'flex flex-col items-center';
  const label = 'text-sm font-medium text-neutral-700 mb-1';
  const control =
    'h-10 w-[220px] px-3 rounded-md border border-neutral-300 bg-white text-neutral-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none';

  return (
    <section className="mb-6 rounded-2xl border border-neutral-200 bg-white/95 px-4 py-4 shadow-sm sm:px-6">
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
        {/* Sort */}
        <div className={fieldWrap}>
          <label className={label}>Sort</label>
          <select
            className={control}
            value={form.sort}
            onChange={(e) =>
              setForm((f) => ({ ...f, sort: e.target.value as Filters['sort'] }))
            }
          >
            <option value="recommended">Recommended</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="rating_desc">Rating: high to low</option>
          </select>
        </div>

        {/* Min price */}
        <div className={fieldWrap}>
          <label className={label}>Min price</label>
          <input
            type="number"
            inputMode="numeric"
            className={control}
            placeholder="e.g. 60"
            value={form.minPrice ?? ''}
            onKeyDown={onEnterApply}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                minPrice: e.target.value === '' ? null : Number(e.target.value),
              }))
            }
          />
        </div>

        {/* Max price */}
        <div className={fieldWrap}>
          <label className={label}>Max price</label>
          <input
            type="number"
            inputMode="numeric"
            className={control}
            placeholder="e.g. 2000"
            value={form.maxPrice ?? ''}
            onKeyDown={onEnterApply}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                maxPrice: e.target.value === '' ? null : Number(e.target.value),
              }))
            }
          />
        </div>

        {/* Apply button (centered with invisible label for alignment) */}
        <div className="flex flex-col items-center">
          <span className="invisible mb-1 text-sm">Apply</span>
          <button
            onClick={apply}
            className="h-10 rounded-md bg-blue-600 px-5 text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            Apply
          </button>
        </div>

        {/* Min rating */}
        <div className={fieldWrap}>
          <label className={label}>Min rating</label>
          <select
            className={control}
            value={String(form.minRating ?? '')}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                minRating: e.target.value === '' ? null : Number(e.target.value),
              }))
            }
          >
            <option value="">Any</option>
            <option value="9">9+</option>
            <option value="8">8+</option>
            <option value="7">7+</option>
            <option value="6">6+</option>
          </select>
        </div>

        {/* Options: Free cancellation */}
        <div className={fieldWrap}>
          <label className={label}>Options</label>
          <label className="flex h-10 items-center gap-2 px-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
              checked={form.freeCancellation}
              onChange={(e) =>
                setForm((f) => ({ ...f, freeCancellation: e.target.checked }))
              }
            />
            <span className="text-sm text-neutral-800">Free cancellation</span>
          </label>
        </div>
      </div>
    </section>
  );
}
