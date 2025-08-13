// app/hotel/[id]/page.tsx
'use client';

import { Suspense } from 'react';
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
  imageCount?: number;
  amenities?: Record<string, unknown>;
  hotelDetails?: { amenities?: Record<string, unknown> };
  currency?: string;
};

type RoomOffer = {
  key: string;
  roomDescription: string;
  free_cancellation?: boolean;
  price: string;
  rooms_available?: string;
  type?: string;
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
            <div className="aspect-[16/9] rounded-xl bg-gray-200"></div>
            <div className="h-32 rounded bg-gray-200"></div>
          </div>
          <div className="h-80 rounded-xl bg-gray-200"></div>
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
          const maxThumbs = Math.min(12, Math.max(0, count));

          for (let i = 0; i < maxThumbs; i++) {
            list.push(`${prefix}${detail.id}/${i}${suffix}`);
          }

          const unique = Array.from(new Set(list));
          setPhotos(unique);

          // Fetch room pricing information
          try {
            const priceUrl = `${API_BASE_URL}/hotels/${id}/prices?` +
              `destination_id=${encodeURIComponent(destinationId)}&` +
              `checkin=${encodeURIComponent(dates.checkin)}&` +
              `checkout=${encodeURIComponent(dates.checkout)}&` +
              `guests=${encodeURIComponent(guests)}`;

            const priceResponse = await fetch(priceUrl);
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
                    price: priceData.price ? `${detail.currency || 'SGD'} ${priceData.price}` : 'Contact for pricing',
                    rooms_available: priceData.roomsAvailable || 'Available',
                  },
                ]);
              }
            } else {
              console.warn('Room pricing not available');
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
    if (!selectedRoom) {
      alert('Please select a room before booking.');
      return;
    }

    const q = new URLSearchParams({
      hotel_id: data?.id ?? '',
      checkin: dates.checkin,
      checkout: dates.checkout,
      rooms: String(rooms),
      guests: String(guests),
      room_key: selectedRoom.key,
      room_description: selectedRoom.roomDescription,
      room_price: selectedRoom.price,
    });
    
    if (destinationId) {
      q.set('destination_id', destinationId);
    }
    
    router.push(`/booking?${q.toString()}`);
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto" />
          <p className="mt-4 text-lg text-neutral-600">Loading hotel details...</p>
        </div>
      </main>
    );
  }

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

            {/* Amenities section */}
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

            {/* Available Rooms section */}
            {roomOffers.length > 0 && (
              <section>
                <h3 className="text-base font-semibold text-neutral-900">Available Rooms</h3>
                <div className="mt-4 space-y-4">
                  {roomOffers.map((room) => (
                    <label
                      key={room.key}
                      className={`block cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                        selectedRoom?.key === room.key
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-neutral-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          name="room"
                          value={room.key}
                          checked={selectedRoom?.key === room.key}
                          onChange={() => setSelectedRoom(room)}
                          className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-neutral-900">{room.roomDescription || room.type}</h4>
                          {room.rooms_available && (
                            <p className="mt-1 text-sm text-neutral-600">{room.rooms_available}</p>
                          )}
                          {room.free_cancellation && (
                            <p className="mt-1 text-sm text-green-600">✓ Free cancellation</p>
                          )}
                          <p className="mt-2 font-semibold text-indigo-700">{room.price}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
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
                {selectedRoom ? 
                  selectedRoom.price :
                  (data.price != null ? `$${Math.round(data.price)}` : '—')
                }
              </div>
              <div className="mt-1 text-xs text-neutral-500">
                per night • taxes may apply
              </div>
            </div>
          </div>

          {selectedRoom && (
            <div className="mt-4 rounded-lg bg-neutral-50 p-3">
              <div className="text-sm font-medium text-neutral-900">Selected Room</div>
              <div className="text-sm text-neutral-700">{selectedRoom.roomDescription}</div>
              {selectedRoom.free_cancellation && (
                <div className="text-xs text-green-600 mt-1">✓ Free cancellation</div>
              )}
            </div>
          )}

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
            disabled={roomOffers.length > 0 && !selectedRoom}
            className={`mt-5 w-full rounded-lg py-3 font-semibold transition ${
              roomOffers.length > 0 && !selectedRoom
                ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {roomOffers.length > 0 && !selectedRoom ? 'Select a room first' : 'Book now'}
          </button>

          <p className="mt-2 text-xs text-neutral-500">
            You’ll review room options and complete booking on the next step.
          </p>
        </aside>
      </div>
    </main>
  );
}
