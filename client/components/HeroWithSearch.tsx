// components/HeroWithSearch.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import DestinationSearch from './DestinationSearch';

const SLIDE_INTERVAL_MS = 4000;

// Use high-res assets in /public/hero/
const SLIDES = [
  '/hero.jpg',                 // your existing image
  '/bali.jpg',
  '/tokyo.jpg',
  '/china.jpg',
  '/SG.jpg',
  '/paris.jpg',
];

export default function HeroWithSearch() {
  const slides = useMemo(() => SLIDES, []);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % slides.length), SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [slides]);

  return (
    <section className="relative min-h-[52vh] overflow-hidden">
      {/* Background slideshow */}
      <div className="absolute inset-0 -z-10">
        {slides.map((src, i) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              i === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={src}
              alt="Featured destination"
              fill
              sizes="100vw"
              priority={i === index}
              quality={95}
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="mx-auto flex min-h-[52vh] max-w-7xl flex-col justify-center gap-6 px-6 py-10">
        {/* Translucent ONLY behind text; lighter/tighter type */}
        <div className="inline-block max-w-3xl rounded-xl bg-white/85 px-6 py-5 backdrop-blur-sm ring-1 ring-black/10 shadow-sm">
          <h1 className="text-5xl md:text-6xl font-light tracking-[-0.02em] leading-[1.1] text-neutral-900">
            Find Your Next Escape
          </h1>
          <p className="mt-2 text-base md:text-lg text-neutral-700 leading-relaxed">
            Handpicked hotels and resorts for the perfect getaway.
          </p>
        </div>

        {/* Clean glass search card */}
        <div className="w-full rounded-2xl bg-white/90 backdrop-blur-md shadow-lg ring-1 ring-black/10">
          <div className="p-4 sm:p-6">
            <DestinationSearch />
          </div>
        </div>
      </div>
    </section>
  );
}
