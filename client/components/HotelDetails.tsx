

// client/components/HotelDetails.tsx
'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

const HotelDetails = () => {
  const [details, setDetails] = useState<any>();
  const [rooms, setRooms] = useState<any[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [pricing, setPricing] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();

  function toNumberPrice(p: unknown): number {
    if (typeof p === 'number') return p;
    const n = parseFloat(String(p).replace(/[^0-9.]/g, ''));
    return Number.isFinite(n) ? n : 0;
  }

  async function getData() {
    try {
      setLoading(true);
      setError(null);

      const hotelId = String((params as any)?.id || '');
      const destinationId = searchParams?.get('destination_id') ?? '';
      const checkin = searchParams?.get('checkin') ?? '';
      const checkout = searchParams?.get('checkout') ?? '';
      const guests = searchParams?.get('guests') ?? '1';

      if (!hotelId || !destinationId || !checkin || !checkout || !guests) {
        throw new Error('Missing required parameters');
      }

      // Hotel info
      const detailsRes = await fetch(
        `${API_BASE_URL}/hotels/${hotelId}?destination_id=${destinationId}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`
      );
      if (!detailsRes.ok) throw new Error(`Hotel fetch failed: ${detailsRes.status}`);
      const data = await detailsRes.json();
      setDetails(data);

      // Prices + rooms
      const priceRes = await fetch(
        `${API_BASE_URL}/hotels/${hotelId}/prices?destination_id=${encodeURIComponent(
          destinationId
        )}&checkin=${encodeURIComponent(checkin)}&checkout=${encodeURIComponent(
          checkout
        )}&guests=${encodeURIComponent(guests)}`
      );

      if (priceRes.ok) {
        const priceData = await priceRes.json();
        setPricing(priceData);

        if (Array.isArray(priceData.rooms) && priceData.rooms.length > 0) {
          // Normalize to ensure "price" is numeric
          const normalized = priceData.rooms.map((r: any, idx: number) => ({
            key: r.key ?? `room-${idx}`,
            roomDescription: r.roomDescription ?? r.type ?? 'Room',
            rooms_available: r.rooms_available ?? r.roomsAvailable ?? null,
            price: toNumberPrice(r.price),
          }));
          setRooms(normalized);
        } else {
          // Fallback from top-level price
          setRooms([
            {
              key: 'standard',
              roomDescription: 'Standard Room',
              rooms_available: priceData.roomsAvailable ?? null,
              price: toNumberPrice(priceData.price),
            },
          ]);
        }
      } else {
        setRooms([]);
      }

      // Images
      const imgs: string[] = [];
      if (data.image_details) {
        for (let i = 0; i < Math.min(10, data.imageCount || 10); i++) {
          imgs.push(`${data.image_details.prefix}${i}${data.image_details.suffix}`);
        }
      }
      setImages(imgs);

      // Amenities
      const amenitiesObj = data.hotelDetails?.amenities ?? data.amenities ?? {};
      setAmenities(Object.keys(amenitiesObj));
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch hotel details');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatSGD = (n: number) =>
    new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' }).format(n);

  const handleBookSelected = () => {
    const destinationId = searchParams?.get('destination_id') ?? '';
    const checkin = searchParams?.get('checkin') ?? '';
    const checkout = searchParams?.get('checkout') ?? '';
    const guests = searchParams?.get('guests') ?? '1';
    const hotelId = String((params as any)?.id || '');

    const selected = rooms[selectedIndex] ?? rooms[0];
    const bookingUrl =
      `/booking/${hotelId}` +
      `?destination_id=${encodeURIComponent(destinationId)}` +
      `&checkin=${encodeURIComponent(checkin)}` +
      `&checkout=${encodeURIComponent(checkout)}` +
      `&guests=${encodeURIComponent(guests)}` +
      `&room_desc=${encodeURIComponent(selected?.roomDescription || '')}` +
      `&room_price=${encodeURIComponent(String(selected?.price ?? ''))}`;

    router.push(bookingUrl);
  };

  if (loading) {
    return (
      <div className="bg-slate-50 text-gray-800 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-900 mx-auto" />
          <p className="mt-4 text-lg text-slate-600">Loading hotel details...</p>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="bg-slate-50 text-gray-800 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-semibold">Hotel not found</h2>
          <p className="mt-2 text-neutral-600">Try returning to search and picking a different hotel.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-gray-800">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Title */}
        <header className="mb-6">
          <h1 className="font-serif text-4xl md:text-5xl">{details.name}</h1>
          {details.address && <div className="mt-2 text-neutral-600">{details.address}</div>}
        </header>

        {/* Gallery */}
        {!!images.length && (
          <section className="mb-10">
            <div className="grid h-[480px] grid-cols-1 gap-4 lg:grid-cols-5">
              <div className="relative overflow-hidden lg:col-span-3">
                <Image
                  src={images[0]}
                  alt={details.name || 'Hotel'}
                  fill
                  className="object-cover rounded-xl"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                />
              </div>
              <div className="grid grid-cols-2 grid-rows-2 gap-4 lg:col-span-2">
                {images.slice(1, 5).map((src, i) => (
                  <div key={i} className="relative overflow-hidden rounded-xl">
                    <Image
                      src={src}
                      alt={`Hotel view ${i + 2}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 50vw, 20vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="grid gap-8 md:grid-cols-[1fr_360px]">
          {/* Details */}
          <section>
            {!!rooms.length && (
              <>
                <h3 className="mt-2 font-serif text-xl">Available Rooms</h3>
                <div className="mt-4 grid gap-6">
                  {rooms.map((room, idx) => (
                    <label
                      key={room.key ?? idx}
                      className={`rounded-2xl border bg-white p-6 shadow cursor-pointer ${
                        selectedIndex === idx ? 'ring-2 ring-indigo-500' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="radio"
                          name="selectedRoom"
                          className="mt-1"
                          checked={selectedIndex === idx}
                          onChange={() => setSelectedIndex(idx)}
                        />
                        <div className="flex-1">
                          <h4 className="font-serif text-lg">{room.roomDescription}</h4>
                          {room.rooms_available != null && (
                            <p className="text-sm text-neutral-600">
                              {room.rooms_available} rooms available
                            </p>
                          )}
                          <p className="mt-2 font-medium text-sky-700">
                            {formatSGD(toNumberPrice(room.price))}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Sticky book box */}
          <aside className="self-start rounded-xl bg-white p-5 shadow md:sticky md:top-20">
            <div className="text-sm text-neutral-600">Selected nightly rate</div>
            <div className="text-2xl font-semibold">
              {formatSGD(toNumberPrice(rooms[selectedIndex]?.price ?? rooms[0]?.price ?? 0))}
              <span className="text-sm text-neutral-500"> / night</span>
            </div>
            <button
              onClick={handleBookSelected}
              className="mt-4 w-full rounded-xl bg-[var(--accent,#C9A663)] px-5 py-2.5 text-white hover:opacity-90"
            >
              Book this stay
            </button>
            <p className="mt-2 text-xs text-neutral-500">Free cancellation within 24h.</p>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default HotelDetails;
