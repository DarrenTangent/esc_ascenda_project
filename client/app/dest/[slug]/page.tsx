// app/dest/[slug]/page.tsx
import { DESTS } from '@/lib/destinations';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ slug: string }> };

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  const key = (slug || '').toLowerCase();
  const dest = DESTS[key];
  if (!dest) return notFound();

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative h-[46vh] min-h-[360px]">
        <Image
          src={dest.hero}
          alt={dest.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-6 pb-8">
          <div className="inline-block rounded-xl bg-white/90 px-5 py-3 backdrop-blur ring-1 ring-black/5">
            <h1 className="text-3xl sm:text-4xl font-bold">{dest.name}</h1>
            <p className="text-gray-600">{dest.tagline}</p>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <p className="max-w-3xl text-gray-700">{dest.description}</p>
      </section>

      {/* Fake hotels */}
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <h2 className="mb-4 text-xl font-semibold">Popular stays</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dest.hotels.map((h) => (
            <div
              key={h.id}
              className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 shadow-sm"
            >
              <div className="relative h-52">
                <Image
                  src={h.image}
                  alt={h.name}
                  fill
                  sizes="(max-width:1024px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-semibold">{h.name}</h3>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                    from ${h.priceFrom}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{h.blurb}</p>

                {/* If you want a fake “book” flow, point to /booking?hotel=... */}
                <div className="mt-4">
                  <Link
                    href={`/booking?hotel=${encodeURIComponent(h.name)}&price=${h.priceFrom}`}
                    className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Book this stay
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
