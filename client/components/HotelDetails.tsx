// components/HotelDetails.tsx
'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

export default function HotelDetailsView({ details, images, rooms, onReload }: {
  details: any; images: string[]; rooms: any[]; onReload?: () => void;
}) {
  if (!details) return null;

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
                <img src={images[0]} alt="" className="h-full w-full object-cover rounded-xl" />
              </div>
              <div className="grid grid-cols-2 grid-rows-2 gap-4 lg:col-span-2">
                {images.slice(1, 5).map((src, i) => (
                  <img key={i} src={src} alt="" className="h-full w-full rounded-xl object-cover" />
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
              onClick={onReload}
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
