// app/hotel/[id]/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import SafeHotelImage from '@/components/SafeHotelImage';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

type HotelDetail = {
  id: string;
  name: string;
  address?: string;
  description?: string; // raw HTML-ish
  rating?: number;
  price?: number;
  imageUrl?: string;
  imageDetails?: { prefix?: string; suffix?: string; count?: number };
  amenities?: Record<string, unknown>;
};

function fmt(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function fallbackDates(search: URLSearchParams) {
  const ck = search.get('checkin');
  const co = search.get('checkout');
  if (ck && co) return { checkin: ck, checkout: co };
  const today = new Date();
  const in7 = new Date(today);
  in7.setDate(today.getDate() + 7);
  const in8 = new Date(today);
  in8.setDate(today.getDate() + 8);
  return { checkin: fmt(in7), checkout: fmt(in8) };
}

/** --------- description cleaner ---------- */
function stripTags(s: string) {
  return s.replace(/<[^>]*>/g, ' ');
}
function normalizeHtmlBreaks(s: string) {
  // convert <br> variants to tokens, remove newlines so split is consistent
  return s.replace(/\r?\n/g, '').replace(/<br\s*\/?>/gi, '|BR|');
}
function cleanLine(s: string) {
  return stripTags(s).replace(/\s+/g, ' ').trim();
}
function parseHotelDescription(raw?: string) {
  if (!raw) {
    return { overview: '', nearby: [] as string[], airports: [] as string[] };
  }
  const normalized = normalizeHtmlBreaks(raw);

  // Split overview vs distances section
  const parts = normalized.split(/Distances are displayed[^.]*\./i);
  const overviewHtml = parts[0] || '';
  const afterDistances = parts[1] || '';

  const overview = cleanLine(overviewHtml);

  // Split distances vs airports
  const [distancesHtml, airportsHtml] = afterDistances.split(/The nearest airports are:/i);

  const nearby = (distancesHtml || '')
    .split('|BR|')
    .map(cleanLine)
    .filter(Boolean);

  const airports = (airportsHtml || '')
    .split('|BR|')
    .map(cleanLine)
    .filter(Boolean);

  return { overview, nearby, airports };
}
/** ---------------------------------------- */

export default function HotelPage() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();

  const dates = useMemo(() => fallbackDates(search), [search]);
  const rooms = search.get('rooms') ?? '1';
  const guests = search.get('guests') ?? search.get('adults') ?? '2';

  const [data, setData] = useState<HotelDetail | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const urls = [
          `${API_BASE_URL}/hotels/${encodeURIComponent(id)}?checkin=${dates.checkin}&checkout=${dates.checkout}&rooms=${rooms}&guests=${guests}`,
          `${API_BASE_URL}/hotels/details?id=${encodeURIComponent(id)}&checkin=${dates.checkin}&checkout=${dates.checkout}&rooms=${rooms}&guests=${guests}`,
        ];

        let detail: HotelDetail | null = null;
        for (const u of urls) {
          try {
            const r = await fetch(u, { cache: 'no-store' });
            if (r.ok) {
              const j = await r.json();
              detail = (j?.hotel ?? j) as HotelDetail;
              if (detail?.id) break;
            }
          } catch {}
        }

        if (!cancelled) {
          setData(detail ?? null);

          if (detail?.id) {
            const list: string[] = [];
            if (detail.imageUrl) list.push(detail.imageUrl);

            const prefix =
              detail.imageDetails?.prefix ??
              'https://d2ey9sqrvkqdfs.cloudfront.net/';
            const suffix = detail.imageDetails?.suffix ?? '.jpg';
            const count = detail.imageDetails?.count ?? 8;
            const maxThumbs = Math.min(12, Math.max(0, count));

            for (let i = 0; i < maxThumbs; i++) {
              list.push(`${prefix}${detail.id}/${i}${suffix}`);
            }

            const unique = Array.from(new Set(list));
            setPhotos(unique);
          } else {
            setPhotos([]);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, dates.checkin, dates.checkout, rooms, guests]);

  const handleBook = () => {
    const q = new URLSearchParams({
      hotel_id: data?.id ?? '',
      checkin: dates.checkin,
      checkout: dates.checkout,
      rooms: String(rooms),
      guests: String(guests),
    });
    router.push(`/booking?${q.toString()}`);
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="h-64 animate-pulse rounded-xl bg-neutral-200/70" />
        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_340px]">
          <div className="h-40 animate-pulse rounded-xl bg-neutral-200/70" />
          <div className="h-40 animate-pulse rounded-xl bg-neutral-200/70" />
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h1 className="text-xl font-semibold text-neutral-900">Hotel not found</h1>
        <p className="mt-2 text-neutral-600">
          Try returning to search and picking a different hotel.
        </p>
      </main>
    );
  }

  const prefix =
    data.imageDetails?.prefix ?? 'https://d2ey9sqrvkqdfs.cloudfront.net/';

  const { overview, nearby, airports } = parseHotelDescription(data.description);

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      {/* Title & meta */}
      <header className="mb-5">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-[-0.01em] text-neutral-900">
          {data.name}
        </h1>
        {data.address && (
          <p className="mt-1 text-sm text-neutral-600">{data.address}</p>
        )}
        <div className="mt-2 text-sm text-neutral-700 flex flex-wrap items-center gap-3">
          {data.rating ? <span>⭐ {data.rating}</span> : null}
          <span className="rounded bg-indigo-50 px-2 py-0.5 text-indigo-700 ring-1 ring-indigo-200">
            {dates.checkin} → {dates.checkout}
          </span>
          <span className="rounded bg-neutral-50 px-2 py-0.5 text-neutral-700 ring-1 ring-neutral-200">
            {rooms} room • {guests} guests
          </span>
        </div>
      </header>

      {/* Gallery + Sidebar */}
      <div className="grid gap-8 md:grid-cols-[1fr_360px]">
        {/* Gallery & description */}
        <section>
          {/* Main image */}
          {photos.length > 0 ? (
            <>
              <div className="relative aspect-[16/9] overflow-hidden rounded-xl ring-1 ring-black/5">
                <SafeHotelImage
                  hotelId={data.id}
                  imageUrl={photos[0]}
                  fallbackPrefix={prefix}
                  alt={data.name}
                  fill
                  quality={90}
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
              </div>

              {/* Thumbs */}
              {photos.length > 1 && (
                <div className="mt-3 grid grid-cols-4 gap-3">
                  {photos.slice(1, 9).map((src, i) => (
                    <div
                      key={src + i}
                      className="relative h-20 overflow-hidden rounded-lg ring-1 ring-black/5"
                    >
                      <SafeHotelImage
                        hotelId={data.id}
                        imageUrl={src}
                        fallbackPrefix={prefix}
                        alt={`Photo ${i + 2}`}
                        fill
                        sizes="180px"
                        quality={80}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="h-64 rounded-xl bg-neutral-200/70" />
          )}

          {/* Cleaned content */}
          <div className="mt-6 space-y-8">
            {!!overview && (
              <section>
                <h2 className="text-lg font-semibold text-neutral-900">Overview</h2>
                <p className="mt-2 text-neutral-700 leading-relaxed">{overview}</p>
            </section>
            )}

            {nearby.length > 0 && (
              <section>
                <h3 className="text-base font-semibold text-neutral-900">What’s nearby</h3>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {nearby.map((line, idx) => (
                    <li
                      key={idx}
                      className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {airports.length > 0 && (
              <section>
                <h3 className="text-base font-semibold text-neutral-900">Airports</h3>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {airports.map((line, idx) => (
                    <li
                      key={idx}
                      className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </section>

        {/* Booking sidebar */}
        <aside className="h-max rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-sm text-neutral-500">from</div>
              <div className="text-2xl font-semibold text-neutral-900">
                {data.price != null ? `$${Math.round(data.price)}` : '—'}
              </div>
              <div className="mt-1 text-xs text-neutral-500">
                per night • taxes may apply
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-neutral-200 p-2">
                <div className="text-[11px] uppercase tracking-wide text-neutral-500">
                  Check-in
                </div>
                <div className="font-medium text-neutral-900">{dates.checkin}</div>
              </div>
              <div className="rounded-lg border border-neutral-200 p-2">
                <div className="text-[11px] uppercase tracking-wide text-neutral-500">
                  Check-out
                </div>
                <div className="font-medium text-neutral-900">{dates.checkout}</div>
              </div>
            </div>
            <div className="rounded-lg border border-neutral-200 p-2">
              <div className="text-[11px] uppercase tracking-wide text-neutral-500">
                Guests & rooms
              </div>
              <div className="font-medium text-neutral-900">
                {guests} guests • {rooms} room
              </div>
            </div>
          </div>

          <button
            onClick={handleBook}
            className="mt-5 w-full rounded-lg bg-indigo-600 py-3 text-white font-semibold hover:bg-indigo-700 transition"
          >
            Book now
          </button>

          <p className="mt-2 text-xs text-neutral-500">
            You’ll review room options and complete booking on the next step.
          </p>
        </aside>
      </div>
    </main>
  );
}
