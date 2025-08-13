// app/hotel/[id]/page.tsx
'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
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
  imageCount?: number;
  amenities?: Record<string, unknown>;
  hotelDetails?: { amenities?: Record<string, unknown> };
  currency?: string;
};

type RoomOffer = {
  key: string;
  roomDescription: string;
  free_cancellation?: boolean;
  price: string; // e.g., "SGD 220" or "$220"
  rooms_available?: string;
  type?: string;
  // optional extras if backend ever sends them
  breakfast_included?: boolean;
  refundable?: boolean;
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

// ---- UI helpers ----
function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}
function parseMoney(input: string | number | undefined, fallbackCurrency = 'SGD') {
  if (input == null) return { currency: fallbackCurrency, amount: null as number | null, label: '—' };

  if (typeof input === 'number') {
    return { currency: fallbackCurrency, amount: input, label: `${fallbackCurrency} ${Math.round(input)}` };
  }

  // Try extract currency + number
  const trimmed = input.trim();
  const m = trimmed.match(/([A-Za-z$€£¥]|SGD|USD|EUR|GBP|JPY|MYR|IDR)\s*([\d.,]+)/i);
  if (m) {
    const cur = m[1].toUpperCase();
    const num = Number(m[2].replace(/,/g, ''));
    return { currency: cur.length <= 3 ? cur : fallbackCurrency, amount: isNaN(num) ? null : num, label: trimmed };
  }
  // Fallback: show as-is
  return { currency: fallbackCurrency, amount: null, label: trimmed };
}

// ------- Page Shell -------
export default function HotelPage() {
  return (
    <Suspense fallback={<HotelPageLoadingFallback />}>
      <HotelPageContent />
    </Suspense>
  );
}

function HotelPageLoadingFallback() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="animate-pulse">
        <div className="mb-5 space-y-2">
          <div className="h-8 w-96 rounded bg-gray-200"></div>
          <div className="h-4 w-64 rounded bg-gray-200"></div>
        </div>
        <div className="grid gap-8 md:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="aspect-[16/9] rounded-xl bg-gray-200" />
            <div className="h-32 rounded bg-gray-200" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-20 rounded bg-gray-200" />
              ))}
            </div>
          </div>
          <div className="h-80 rounded-xl bg-gray-200" />
        </div>
      </div>
    </main>
  );
}

function HotelPageContent() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();

  const dates = useMemo(() => fallbackDates(search), [search]);
  const rooms = search.get('rooms') ?? '1';
  const guests = search.get('guests') ?? search.get('adults') ?? '2';
  const destinationId = search.get('destination_id') ?? '';

  const [data, setData] = useState<HotelDetail | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [roomOffers, setRoomOffers] = useState<RoomOffer[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<RoomOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // gallery state
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // First, try to get hotel details
        const urls = [
          `${API_BASE_URL}/hotels/${encodeURIComponent(id)}?checkin=${dates.checkin}&checkout=${dates.checkout}&rooms=${rooms}&guests=${guests}${destinationId ? `&destination_id=${destinationId}` : ''}`,
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

        if (!cancelled && detail?.id) {
          setData(detail);

          // Set up photos
          const list: string[] = [];
          if (detail.imageUrl) list.push(detail.imageUrl);

          const prefix =
            detail.imageDetails?.prefix ??
            'https://d2ey9sqrvkqdfs.cloudfront.net/';
          const suffix = detail.imageDetails?.suffix ?? '.jpg';
          const count = detail.imageDetails?.count ?? detail.imageCount ?? 8;
          const maxThumbs = Math.min(16, Math.max(0, count));

          for (let i = 0; i < maxThumbs; i++) {
            list.push(`${prefix}${detail.id}/${i}${suffix}`);
          }

          const unique = Array.from(new Set(list));
          setPhotos(unique);
          setHeroIndex(0);

          // Fetch room pricing information
          try {
            const priceUrl =
              `${API_BASE_URL}/hotels/${id}/prices?` +
              (destinationId ? `destination_id=${encodeURIComponent(destinationId)}&` : '') +
              `checkin=${encodeURIComponent(dates.checkin)}&` +
              `checkout=${encodeURIComponent(dates.checkout)}&` +
              `guests=${encodeURIComponent(guests)}`;

            const priceResponse = await fetch(priceUrl, { cache: 'no-store' });
            if (priceResponse.ok) {
              const priceData = await priceResponse.json();

              if (priceData.rooms && Array.isArray(priceData.rooms) && priceData.rooms.length > 0) {
                setRoomOffers(priceData.rooms);
              } else {
                // Fallback room if no detailed room data
                setRoomOffers([
                  {
                    key: 'standard',
                    roomDescription: 'Standard Room',
                    price: priceData.price
                      ? `${detail.currency || 'SGD'} ${priceData.price}`
                      : 'Contact for pricing',
                    rooms_available: priceData.roomsAvailable || 'Available',
                    free_cancellation: true,
                  },
                ]);
              }
            } else {
              setRoomOffers([]);
            }
          } catch (priceError) {
            console.error('Error fetching room prices:', priceError);
            setRoomOffers([]);
          }
        } else {
          if (!cancelled) {
            setData(null);
            setPhotos([]);
            setRoomOffers([]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch hotel details:', err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch hotel details');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, dates.checkin, dates.checkout, rooms, guests, destinationId]);

  const handleBook = () => {
    if (roomOffers.length > 0 && !selectedRoom) {
      alert('Please select a room before booking.');
      return;
    }

    const q = new URLSearchParams({
      checkin: dates.checkin,
      checkout: dates.checkout,
      rooms: String(rooms),
      guests: String(guests),
    });

    if (destinationId) q.set('destination_id', destinationId);
    
    // Add room details if a room is selected
    if (selectedRoom) {
      q.set('room_key', selectedRoom.key);
      q.set('room_desc', selectedRoom.roomDescription || selectedRoom.type || '');
      q.set('room_price', selectedRoom.price);
    }

    router.push(`/booking/${data?.id}?${q.toString()}`);
  };

  const onPrevPhoto = useCallback(() => {
    setHeroIndex((i) => (photos.length ? (i - 1 + photos.length) % photos.length : 0));
  }, [photos.length]);
  const onNextPhoto = useCallback(() => {
    setHeroIndex((i) => (photos.length ? (i + 1) % photos.length : 0));
  }, [photos.length]);

  if (loading) return <HotelPageLoadingFallback />;

  if (error) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md mx-auto">
            <h3 className="font-medium text-lg">Error loading hotel details</h3>
            <p className="text-sm mt-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Try again
            </button>
          </div>
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

  const prefix = data.imageDetails?.prefix ?? 'https://d2ey9sqrvkqdfs.cloudfront.net/';
  const { overview, nearby, airports } = parseHotelDescription(data.description);
  const fromPrice = data.price != null ? parseMoney(data.price, data.currency || 'SGD').label : '—';

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      {/* Title & meta */}
      <header className="mb-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-[-0.01em] text-neutral-900">
              {data.name}
            </h1>
            {data.address && <p className="mt-1 text-sm text-neutral-600">{data.address}</p>}
            <div className="mt-2 text-sm text-neutral-700 flex flex-wrap items-center gap-3">
              {data.rating ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-amber-800 ring-1 ring-amber-200">
                  <span aria-hidden>⭐</span>
                  <span className="font-medium">{data.rating}</span>
                </span>
              ) : null}
              <span className="rounded bg-indigo-50 px-2 py-0.5 text-indigo-700 ring-1 ring-indigo-200">
                {dates.checkin} → {dates.checkout}
              </span>
              <span className="rounded bg-neutral-50 px-2 py-0.5 text-neutral-700 ring-1 ring-neutral-200">
                {rooms} room • {guests} guests
              </span>
            </div>
          </div>
          <div className="hidden md:block text-right">
            <div className="text-xs text-neutral-500">from</div>
            <div className="text-2xl font-semibold text-neutral-900">{fromPrice}</div>
            <div className="mt-1 text-xs text-neutral-500">per night • taxes may apply</div>
          </div>
        </div>
      </header>

      {/* Gallery + Sidebar */}
      <div className="grid gap-8 md:grid-cols-[1fr_360px]">
        {/* Gallery & description */}
        <section>
          {/* Media gallery */}
          <div className="relative overflow-hidden rounded-xl ring-1 ring-black/5">
            {photos.length > 0 ? (
              <>
                <div className="relative aspect-[16/9]">
                  <SafeHotelImage
                    hotelId={data.id}
                    imageUrl={photos[heroIndex]}
                    fallbackPrefix={prefix}
                    alt={`${data.name} photo ${heroIndex + 1}`}
                    fill
                    quality={90}
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    priority
                  />

                  {/* controls */}
                  {photos.length > 1 && (
                    <>
                      <button
                        aria-label="Previous photo"
                        onClick={onPrevPhoto}
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 backdrop-blur px-3 py-2 text-white hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white"
                      >
                        ‹
                      </button>
                      <button
                        aria-label="Next photo"
                        onClick={onNextPhoto}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 backdrop-blur px-3 py-2 text-white hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white"
                      >
                        ›
                      </button>
                      <div className="pointer-events-none absolute bottom-2 right-2 rounded bg-black/50 px-2 py-0.5 text-xs text-white">
                        {heroIndex + 1}/{photos.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbs */}
                {photos.length > 1 && (
                  <div
                    role="listbox"
                    aria-label="Hotel photos"
                    className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6"
                  >
                    {photos.slice(0, 12).map((src, i) => {
                      const active = i === heroIndex;
                      return (
                        <button
                          key={src + i}
                          role="option"
                          aria-selected={active}
                          onClick={() => setHeroIndex(i)}
                          className={classNames(
                            'relative h-20 overflow-hidden rounded-lg ring-1 transition focus:outline-none',
                            active ? 'ring-2 ring-indigo-500' : 'ring-black/5 hover:ring-indigo-300'
                          )}
                        >
                          <SafeHotelImage
                            hotelId={data.id}
                            imageUrl={src}
                            fallbackPrefix={prefix}
                            alt={`Thumbnail ${i + 1}`}
                            fill
                            sizes="180px"
                            quality={80}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-[16/9] bg-neutral-200/70" />
            )}
          </div>

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

            {(data.amenities || data.hotelDetails?.amenities) && (
              <section>
                <h3 className="text-base font-semibold text-neutral-900">Amenities</h3>
                <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {Object.keys(data.amenities || data.hotelDetails?.amenities || {}).map((amenity) => (
                    <li
                      key={amenity}
                      className="rounded-lg border border-neutral-200 bg-white p-3 text-sm text-neutral-700"
                    >
                      {amenity}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Available Rooms */}
            <section aria-labelledby="rooms-heading">
              <div className="flex items-center justify-between">
                <h3 id="rooms-heading" className="text-base font-semibold text-neutral-900">
                  Available Rooms
                </h3>
                {roomOffers.length > 0 && (
                  <span className="text-xs text-neutral-500">
                    Select a room to proceed
                  </span>
                )}
              </div>

              {roomOffers.length === 0 ? (
                <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
                  No rooms are available for your dates. Try changing dates or guest count.
                </div>
              ) : (
                <div className="mt-4 grid gap-4">
                  {roomOffers.map((room) => {
                    const active = selectedRoom?.key === room.key;
                    const priceInfo = parseMoney(room.price, data.currency || 'SGD');

                    return (
                      <label
                        key={room.key}
                        className={classNames(
                          'group relative cursor-pointer rounded-xl border-2 p-4 transition-all',
                          active
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-neutral-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                        )}
                      >
                        <input
                          type="radio"
                          name="room"
                          value={room.key}
                          checked={active}
                          onChange={() => setSelectedRoom(room)}
                          className="sr-only"
                          aria-label={`Select ${room.roomDescription || room.type}`}
                        />

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="truncate text-base font-medium text-neutral-900">
                                {room.roomDescription || room.type || 'Room'}
                              </h4>
                              {room.free_cancellation && (
                                <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700 ring-1 ring-green-200">
                                  Free cancellation
                                </span>
                              )}
                              {room.breakfast_included && (
                                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 ring-1 ring-amber-200">
                                  Breakfast included
                                </span>
                              )}
                              {room.refundable && (
                                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 ring-1 ring-blue-200">
                                  Refundable
                                </span>
                              )}
                            </div>

                            {room.rooms_available && (
                              <p className="mt-1 text-sm text-neutral-600">
                                {room.rooms_available}
                              </p>
                            )}
                          </div>

                          <div className="shrink-0 text-right">
                            <div className="text-xs text-neutral-500">total / night</div>
                            <div className="text-lg font-semibold text-neutral-900">
                              {priceInfo.label}
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedRoom(room)}
                              className={classNames(
                                'mt-2 inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-semibold transition',
                                active
                                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                  : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                              )}
                            >
                              {active ? 'Selected' : 'Choose'}
                            </button>
                          </div>
                        </div>

                        {/* Active border glow */}
                        <div
                          className={classNames(
                            'pointer-events-none absolute inset-0 rounded-xl ring-4 ring-indigo-300/0 transition group-hover:ring-indigo-200',
                            active && 'ring-indigo-300/40'
                          )}
                        />
                      </label>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </section>

        {/* Sticky booking sidebar */}
        <aside className="h-max md:sticky md:top-6 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-sm text-neutral-500">from</div>
              <div className="text-2xl font-semibold text-neutral-900">
                {selectedRoom
                  ? parseMoney(selectedRoom.price, data.currency || 'SGD').label
                  : data.price != null
                  ? parseMoney(data.price, data.currency || 'SGD').label
                  : '—'}
              </div>
              <div className="mt-1 text-xs text-neutral-500">per night • taxes may apply</div>
            </div>
          </div>

          {selectedRoom && (
            <div className="mt-4 rounded-lg bg-neutral-50 p-3">
              <div className="text-sm font-medium text-neutral-900">Selected Room</div>
              <div className="text-sm text-neutral-700">{selectedRoom.roomDescription || selectedRoom.type}</div>
              {selectedRoom.free_cancellation && (
                <div className="mt-1 text-xs text-green-700">✓ Free cancellation</div>
              )}
            </div>
          )}

          <div className="mt-4 grid gap-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-neutral-200 p-2">
                <div className="text-[11px] uppercase tracking-wide text-neutral-500">Check-in</div>
                <div className="font-medium text-neutral-900">{dates.checkin}</div>
              </div>
              <div className="rounded-lg border border-neutral-200 p-2">
                <div className="text-[11px] uppercase tracking-wide text-neutral-500">Check-out</div>
                <div className="font-medium text-neutral-900">{dates.checkout}</div>
              </div>
            </div>
            <div className="rounded-lg border border-neutral-200 p-2">
              <div className="text-[11px] uppercase tracking-wide text-neutral-500">Guests & rooms</div>
              <div className="font-medium text-neutral-900">
                {guests} guests • {rooms} room
              </div>
            </div>
          </div>

          <button
            onClick={handleBook}
            disabled={roomOffers.length > 0 && !selectedRoom}
            className={classNames(
              'mt-5 w-full rounded-lg py-3 font-semibold transition',
              roomOffers.length > 0 && !selectedRoom
                ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            )}
          >
            {roomOffers.length > 0 && !selectedRoom ? 'Select a room first' : 'Continue to Booking'}
          </button>

          <p className="mt-2 text-xs text-neutral-500">
            You’ll review room options and complete booking on the next step.
          </p>
        </aside>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-white/90 backdrop-blur md:hidden border-t border-neutral-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="min-w-0">
            <div className="text-xs text-neutral-500">Total per night</div>
            <div className="truncate text-lg font-semibold text-neutral-900">
              {selectedRoom
                ? parseMoney(selectedRoom.price, data.currency || 'SGD').label
                : data.price != null
                ? parseMoney(data.price, data.currency || 'SGD').label
                : '—'}
            </div>
          </div>
          <button
            onClick={handleBook}
            disabled={roomOffers.length > 0 && !selectedRoom}
            className={classNames(
              'rounded-lg px-5 py-2.5 text-sm font-semibold',
              roomOffers.length > 0 && !selectedRoom
                ? 'bg-neutral-300 text-neutral-500'
                : 'bg-indigo-600 text-white'
            )}
          >
            {roomOffers.length > 0 && !selectedRoom ? 'Select a room' : 'Continue'}
          </button>
        </div>
      </div>
    </main>
  );
}
