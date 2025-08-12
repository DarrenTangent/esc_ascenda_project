// components/FeaturedDestinations.tsx
'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

type ApiDestination = {
  uid?: string;
  term?: string;
  name?: string;
  imageUrl?: string;
  image?: string;
  fromPrice?: number | string;
  tagline?: string;
};

type UiDestination = {
  name: string;
  uid: string | null;
  image: string;
  fromPrice?: string;
  tagline?: string;
};

function fmtDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

function defaultDates() {
  const today = new Date();
  const in7 = new Date(today); in7.setDate(today.getDate() + 7);
  const in8 = new Date(today); in8.setDate(today.getDate() + 8);
  return { checkin: fmtDate(in7), checkout: fmtDate(in8) };
}

export default function FeaturedDestinations() {
  const router = useRouter();
  const dates = useMemo(() => defaultDates(), []);

  const [items, setItems] = useState<UiDestination[] | null>(null);
  const [loading, setLoading] = useState(true);

  // Graceful fallback list (make sure images exist in /public/destinations/*)
  const fallback: UiDestination[] = [
    { name: 'Singapore', uid: 'RsBU', image: '/destinations/singapore.jpg', fromPrice: 'from $180', tagline: 'City meets nature' },
    { name: 'Tokyo', uid: null, image: '/destinations/tokyo.jpg', fromPrice: 'from $220', tagline: 'Neon & noodles' },
    { name: 'Bali', uid: null, image: '/destinations/bali.jpg', fromPrice: 'from $120', tagline: 'Island bliss' },
    { name: 'Paris', uid: null, image: '/destinations/paris.jpg', fromPrice: 'from $210', tagline: 'Art & romance' },
    { name: 'Bangkok', uid: null, image: '/destinations/bangkok.jpg', fromPrice: 'from $95', tagline: 'Street food capital' },
    { name: 'Seoul', uid: null, image: '/destinations/seoul.jpg', fromPrice: 'from $170', tagline: 'Trends & temples' },
  ];

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        // Try a featured endpoint; if your API differs, update this path:
        const res = await fetch(`${API_BASE_URL}/destinations/featured`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Non-200');
        const data: { destinations?: ApiDestination[] } | ApiDestination[] = await res.json();

        const list: ApiDestination[] = Array.isArray(data)
          ? data
          : (data?.destinations ?? []);

        const mapped: UiDestination[] = (list || []).slice(0, 6).map(d => ({
          name: (d.name || d.term || '').trim() || 'Destination',
          uid: d.uid ?? null,
          image: d.imageUrl || d.image || '/destinations/placeholder.jpg',
          fromPrice: d.fromPrice ? `from $${d.fromPrice}` : undefined,
          tagline: d.tagline,
        }));

        if (!cancelled && mapped.length) setItems(mapped);
        else if (!cancelled) setItems(fallback);
      } catch {
        if (!cancelled) setItems(fallback);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const handleClick = (d: UiDestination) => {
    const base = d.uid
      ? `/search?destination_id=${encodeURIComponent(d.uid)}`
      : `/search?destination=${encodeURIComponent(d.name)}`;
    router.push(`${base}&checkin=${dates.checkin}&checkout=${dates.checkout}&rooms=1&guests=2`);
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-5 flex items-end justify-between">
        <h2 className="text-3xl md:text-[2rem] font-light tracking-[-0.01em] leading-tight text-neutral-900">
          Featured Destinations
        </h2>
        <p className="text-sm text-neutral-600">Popular picks curated for you</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(items ?? Array.from({ length: 6 })).map((d, i) => {
          if (loading || !d) {
            // skeleton
            return (
              <div key={`skeleton-${i}`} className="h-64 animate-pulse rounded-xl bg-neutral-200/70" />
            );
          }

          return (
            <button
              key={d.name + i}
              onClick={() => handleClick(d)}
              className="group relative overflow-hidden rounded-xl bg-white ring-1 ring-black/5 shadow hover:shadow-md transition"
            >
              {/* image area with stable aspect */}
              <div className="relative w-full aspect-[16/10]">
                <Image
                  src={d.image}
                  alt={d.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  quality={90}
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
              </div>

              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="inline-flex items-baseline gap-2 rounded-md bg-white/92 px-3 py-1.5 backdrop-blur ring-1 ring-black/10">
                  <span className="text-[15px] font-medium text-neutral-900 tracking-[-0.01em]">
                    {d.name}
                  </span>
                  {d.fromPrice && (
                    <span className="text-xs text-neutral-600">{d.fromPrice}</span>
                  )}
                </div>
                {d.tagline && (
                  <p className="mt-2 text-xs text-white/95 drop-shadow">
                    {d.tagline}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
