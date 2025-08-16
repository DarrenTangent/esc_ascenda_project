'use client';

import Link from 'next/link';
import Image from 'next/image';

const destinations = [
  { name: 'Singapore', slug: 'singapore', image: '/featured/singapore.jpg', tagline: 'City meets nature', from: 180 },
  { name: 'Tokyo',     slug: 'tokyo',     image: '/featured/tokyo.jpg',     tagline: 'Neon & noodles',  from: 220 },
  { name: 'Bali',      slug: 'bali',      image: '/featured/bali.jpg',      tagline: 'Island bliss',    from: 120 },
  { name: 'Paris',     slug: 'paris',     image: '/featured/paris.jpg',     tagline: 'Art & romance',   from: 210 },
  { name: 'Bangkok',   slug: 'bangkok',   image: '/featured/bangkok.jpg',   tagline: 'Street food capital', from: 95 },
  { name: 'Seoul',     slug: 'seoul',     image: '/featured/seoul.jpg',     tagline: 'Trends & temples', from: 170 },
];

export default function FeaturedDestinations() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Featured Destinations</h2>
        <p className="text-sm text-gray-500">Popular picks curated for you</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {destinations.map((d) => (
          <Link
            key={d.slug}
            href={`/dest/${d.slug}`}
            className="group relative block overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-black/5 shadow-sm hover:shadow-md transition"
          >
            <div className="relative h-56 sm:h-64">
              <Image
                src={d.image}
                alt={d.name}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-16 left-4 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1 text-sm font-semibold shadow">
                <span>{d.name}</span>
                <span className="text-gray-500 font-normal">from ${d.from}</span>
              </div>
              <div className="absolute bottom-6 left-4 text-white/95 text-sm drop-shadow">
                {d.tagline}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
