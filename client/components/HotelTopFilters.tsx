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
  // merged initial (stable across renders)
  const init = useMemo(
    () => ({ ...DEFAULTS, ...(initial ?? {}) }) as Filters,
    [initial]
  );

  const [form, setForm] = useState<Filters>(init);

  // sync local state if URL/initial changes
  useEffect(() => setForm(init), [init]);

  // track if anything changed (to disable Apply when nothing changed)
  const changed = useMemo(() => {
    return (
      form.sort !== init.sort ||
      form.minPrice !== init.minPrice ||
      form.maxPrice !== init.maxPrice ||
      form.minRating !== init.minRating ||
      form.freeCancellation !== init.freeCancellation
    );
  }, [form, init]);

  // normalize and submit
  const apply = () => {
    // swap if min > max
    let { minPrice, maxPrice } = form;
    if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
      const tmp = minPrice;
      minPrice = maxPrice;
      maxPrice = tmp;
    }
    const next: Filters = { ...form, minPrice, maxPrice };
    setForm(next);
    onChange(next);
  };

  const reset = () => {
    setForm(init);
    onChange(init);
  };

  const onEnterApply: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (changed) apply();
    }
  };

  // styles
  const label = 'text-sm font-medium text-[var(--ink-700)] mb-1';
  const control =
    'h-11 w-full rounded-lg border border-[var(--ink-300)] bg-white/95 px-3 text-[var(--ink-900)] ' +
    'placeholder:text-slate-400 focus:border-[var(--brand-500)] focus:ring-2 focus:ring-[var(--brand-300)] outline-none';

  return (
    <section className="mb-6 rounded-2xl border border-black/5 bg-white shadow-sm">
      <div className="grid grid-cols-1 gap-4 px-4 py-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1fr_160px_160px_auto_160px_auto]">
        {/* Sort */}
        <div className="flex flex-col">
          <label htmlFor="sort" className={label}>
            Sort
          </label>
          <select
            id="sort"
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
        <div className="flex flex-col">
          <label htmlFor="min-price" className={label}>
            Min price
          </label>
          <input
            id="min-price"
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
        <div className="flex flex-col">
          <label htmlFor="max-price" className={label}>
            Max price
          </label>
          <input
            id="max-price"
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

        {/* Apply button — aligned via grid, invisible label to match height */}
        <div className="flex flex-col items-start justify-end">
          <span className="invisible mb-1 text-sm">Apply</span>
          <button
            onClick={apply}
            disabled={!changed}
            className="h-11 rounded-lg bg-[var(--brand-600)] px-5 text-white shadow-sm transition
                       hover:bg-[var(--brand-700)] disabled:cursor-not-allowed disabled:opacity-50"
            aria-disabled={!changed}
          >
            Apply
          </button>
        </div>

        {/* Min rating */}
        <div className="flex flex-col">
          <label htmlFor="min-rating" className={label}>
            Min rating
          </label>
          <select
            id="min-rating"
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

        {/* Options */}
        <div className="flex flex-col justify-end">
          <label className={label}>Options</label>
          <label className="flex h-11 items-center gap-2 rounded-lg px-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[var(--ink-300)] text-[var(--brand-600)] focus:ring-[var(--brand-300)]"
              checked={form.freeCancellation}
              onChange={(e) =>
                setForm((f) => ({ ...f, freeCancellation: e.target.checked }))
              }
            />
            <span className="text-sm text-[var(--ink-800)]">Free cancellation</span>
          </label>
        </div>

        {/* Reset button (on the far right when wide) */}
        <div className="flex items-end sm:col-span-2 lg:col-span-1 lg:col-start-6">
          <button
            type="button"
            onClick={reset}
            disabled={!changed}
            className="h-11 rounded-lg border border-[var(--ink-300)] bg-white px-4 text-sm text-[var(--ink-700)] hover:bg-[var(--surface-2)]
                       disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}
