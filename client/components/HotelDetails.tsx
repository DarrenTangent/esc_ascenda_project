'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

const HotelDetails = () => {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [details, setDetails] = useState<any>();
  const [rooms, setRooms] = useState<any[]>();
  const [images, setImages] = useState<any[]>();
  const [amenities, setAmenities] = useState<any[]>();
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
          setRooms([]);
        }
      } catch {
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

  const idFromParams = String((params as any)?.id || '');

  return (
    <div className="bg-slate-50 text-gray-800 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900" style={{ fontFamily: '"Playfair Display", serif' }}>
            {details.name}
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-yellow-500 text-xl font-semibold">★ 4.5</span>
            <span className="text-slate-600 text-lg" style={{ fontFamily: '"Poppins", sans-serif' }}>
              {details.address}
            </span>
          </div>
        </header>

        {/* Images Section */}
        <div className="mb-20">
          {!showAllPhotos ? (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[480px]">
              <div className="lg:col-span-3 relative overflow-hidden">
                <img
                  src={images[0]}
                  alt="Main Hotel"
                  className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="lg:col-span-2 grid grid-cols-2 grid-rows-2 gap-4">
                {images.slice(1, 5).map((src, index) => (
                  <div key={index} className="relative overflow-hidden">
                    <img
                      src={src}
                      alt={`Hotel photo ${index + 2}`}
                      className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid gap-4 transition-all duration-500 ease-in-out grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {images.map((src, index) => (
                <div key={index} className="bg-white shadow relative overflow-hidden">
                  <img
                    src={src}
                    alt={`Hotel photo ${index + 1}`}
                    className="w-full h-64 object-cover transform transition-transform duration-500 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setShowAllPhotos(!showAllPhotos)}
              className="px-6 py-3 bg-slate-900 text-white font-semibold hover:bg-slate-700 transition rounded"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              {showAllPhotos ? 'Show Less Photos' : 'Show More Photos'}
            </button>
          </div>
        </div>

        {/* Description */}
        <section className="mb-14">
          <h2 className="text-3xl font-semibold mb-5 text-slate-900" style={{ fontFamily: '"Playfair Display", serif' }}>
            About this hotel
          </h2>
          <p className="text-lg leading-relaxed text-gray-700" style={{ fontFamily: '"Poppins", sans-serif' }}>
            {details.description}
          </p>
        </section>

        {/* Amenities */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold mb-5 text-slate-900" style={{ fontFamily: '"Playfair Display", serif' }}>
            Amenities
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            {amenities.map((item, index) => (
              <li
                key={index}
                className="bg-white border border-slate-100 rounded-lg p-4 text-slate-700 hover:shadow-md transition"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Available Rooms */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold mb-6 text-slate-900" style={{ fontFamily: '"Playfair Display", serif' }}>
            Available Rooms
          </h2>

          {rooms && rooms.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <div
                  key={room.key}
                  className="bg-white border border-slate-100 rounded-2xl p-6 shadow hover:shadow-lg transition transform hover:-translate-y-1"
                >
                  <h3 className="text-xl font-bold mb-1 text-slate-900" style={{ fontFamily: '"Playfair Display", serif' }}>
                    {room.roomDescription}
                  </h3>
                  <p className="text-slate-500" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    {`${room.rooms_available} rooms available`}
                  </p>
                  <p className="mt-3 font-semibold text-sky-700" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    {room.price}
                  </p>
                  <button
                    onClick={() => {
                      const destination_id = searchParams?.get('destination_id') || '';
                      const checkin = searchParams?.get('checkin') || '';
                      const checkout = searchParams?.get('checkout') || '';
                      const guests = searchParams?.get('guests') || '1';
                      const rooms = searchParams?.get('rooms') || '1';

                      const bookingUrl =
                        `/booking/${idFromParams}?` +
                        `destination_id=${encodeURIComponent(destination_id)}&` +
                        `checkin=${encodeURIComponent(checkin)}&` +
                        `checkout=${encodeURIComponent(checkout)}&` +
                        `guests=${encodeURIComponent(guests)}&` +
                        `rooms=${encodeURIComponent(rooms)}`;
                      router.push(bookingUrl);
                    }}
                    className="mt-5 w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 font-semibold py-2 rounded-lg hover:opacity-90 transition"
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Room Information Unavailable</h3>
                <p className="text-blue-700 mb-4">
                  Detailed room information is currently not available, but you can still proceed with booking.
                </p>
                <button
                  onClick={() => {
                    const destination_id = searchParams?.get('destination_id') || '';
                    const checkin = searchParams?.get('checkin') || '';
                    const checkout = searchParams?.get('checkout') || '';
                    const guests = searchParams?.get('guests') || '1';
                    const rooms = searchParams?.get('rooms') || '1';

                    const bookingUrl =
                      `/booking/${idFromParams}?` +
                      `destination_id=${encodeURIComponent(destination_id)}&` +
                      `checkin=${encodeURIComponent(checkin)}&` +
                      `checkout=${encodeURIComponent(checkout)}&` +
                      `guests=${encodeURIComponent(guests)}&` +
                      `rooms=${encodeURIComponent(rooms)}`;
                    router.push(bookingUrl);
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Book This Hotel
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Map */}
        <section>
          <h2 className="text-3xl font-semibold mb-5 text-slate-900" style={{ fontFamily: '"Playfair Display", serif' }}>
            Location
          </h2>
          <div className="w-full h-80 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center shadow-inner">
            <p className="text-slate-500" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Map Placeholder (Lat/Lon)
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HotelDetails;
