// components/HotelDetails.tsx
'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

const HotelDetails = () => {
  const [details, setDetails] = useState<any>();
  const [rooms, setRooms] = useState<any[]>();
  const [images, setImages] = useState<any[]>();
  const [amenities, setAmenities] = useState<any[]>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pricing, setPricing] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();

  const getData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!searchParams) throw new Error('Search parameters are not available');

      // `/hotel/[id]` -> params.id
      const hotelId = String((params as any)?.id || '');

      // rest from query
      const destinationId = searchParams?.get('destination_id') ?? '';
      const checkin = searchParams?.get('checkin') ?? '';
      const checkout = searchParams?.get('checkout') ?? '';
      const guests = searchParams?.get('guests') ?? '1';

      if (!hotelId || !destinationId || !checkin || !checkout || !guests) {
        throw new Error('Missing required parameters');
      }

      const url = `${API_BASE_URL}/hotels/${hotelId}?destination_id=${destinationId}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`;
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      setDetails(data);

      // pricing (best-effort)
      try {
        const priceResponse = await fetch(
          `${API_BASE_URL}/hotels/${hotelId}/prices?` +
            `destination_id=${encodeURIComponent(destinationId)}&` +
            `checkin=${encodeURIComponent(checkin)}&` +
            `checkout=${encodeURIComponent(checkout)}&` +
            `guests=${encodeURIComponent(guests)}`
        );

        if (priceResponse.ok) {
          const priceData = await priceResponse.json();
          setPricing(priceData);

          if (priceData.rooms && Array.isArray(priceData.rooms) && priceData.rooms.length > 0) {
            setRooms(priceData.rooms);
          } else {
            setRooms([
              {
                key: 'standard',
                roomDescription: 'Standard Room',
                rooms_available: priceData.roomsAvailable || 'Available',
                price: priceData.price ? `SGD ${priceData.price}/night` : 'Contact for pricing',
              },
            ]);
          }
        } else {
          console.warn('Price response not ok:', priceResponse.status, priceResponse.statusText);
          setRooms([]);
        }
      } catch (priceError) {
        console.error('Error fetching hotel prices:', priceError);
        setRooms([]);
      }

      // images (guarded)
      const tempImgs: string[] = [];
      if (data.image_details) {
        for (let i = 0; i < Math.min(10, data.imageCount || 10); i++) {
          tempImgs.push(`${data.image_details.prefix}${i}${data.image_details.suffix}`);
        }
      }
      setImages(tempImgs);

      // ✅ amenities (handle both shapes or none)
      const amenitiesObj = data.hotelDetails?.amenities ?? data.amenities ?? {};
      setAmenities(Object.keys(amenitiesObj));
    } catch (err) {
      console.error('Failed to fetch hotel details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch hotel details');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    const destinationId = searchParams?.get('destination_id') ?? '';
    const checkin = searchParams?.get('checkin') ?? '';
    const checkout = searchParams?.get('checkout') ?? '';
    const guests = searchParams?.get('guests') ?? '1';
    const hotelId = String((params as any)?.id || '');
    
    // Navigate to booking page with all the necessary parameters
    const bookingUrl = `/booking/${hotelId}?destination_id=${destinationId}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`;
    router.push(bookingUrl);
  };

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  if (error) {
    return (
      <div className="bg-slate-50 text-gray-800 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <h3 className="font-medium text-lg">Error loading hotel details</h3>
            <p className="text-sm mt-2">{error}</p>
            <button
              onClick={() => getData()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!details || !images || !amenities) {
    return (
      <div className="bg-slate-50 text-gray-800 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-slate-600">No hotel details available</p>
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
        {!!images?.length && (
          <section className="mb-10">
            <div className="grid h-[480px] grid-cols-1 gap-4 lg:grid-cols-5">
              <div className="relative overflow-hidden lg:col-span-3">
                <Image 
                  src={images[0]} 
                  alt={details.name || "Hotel"} 
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
            {details.description && (
              <>
                <h2 className="font-serif text-2xl">About this hotel</h2>
                <p className="mt-3 leading-relaxed text-neutral-700">{details.description}</p>
              </>
            )}

            {!!details.amenities && (
              <>
                <h3 className="mt-8 font-serif text-xl">Amenities</h3>
                <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {Object.keys(details.amenities).map(a => (
                    <li key={a} className="rounded-lg border bg-white p-3 text-sm text-neutral-700">{a}</li>
                  ))}
                </ul>
              </>
            )}

            {!!rooms?.length && (
              <>
                <h3 className="mt-10 font-serif text-xl">Available Rooms</h3>
                <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rooms.map((room: any) => (
                    <div key={room.key ?? room.type} className="rounded-2xl border border-slate-100 bg-white p-6 shadow transition hover:-translate-y-0.5 hover:shadow-lg">
                      <h4 className="font-serif text-lg">{room.roomDescription ?? room.type}</h4>
                      {room.rooms_available != null && (
                        <p className="text-sm text-neutral-600">{room.rooms_available} rooms available</p>
                      )}
                      {room.price && <p className="mt-2 font-medium text-sky-700">{room.price}</p>}
                      <button className="mt-4 w-full rounded-xl bg-[var(--accent,#C9A663)] px-5 py-2.5 text-white hover:opacity-90">
                        Select Room
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Sticky book box */}
          <aside className="self-start rounded-xl bg-white p-5 shadow md:sticky md:top-20">
            <div className="text-sm text-neutral-600">From</div>
            <div className="text-2xl font-semibold">
              {details.currency ?? 'SGD'} {rooms?.[0]?.price ?? ''}
              <span className="text-sm text-neutral-500"> / night</span>
            </div>
            <button
              onClick={handleBooking}
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
}

export default HotelDetails;