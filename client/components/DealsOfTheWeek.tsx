// components/DealsOfTheWeek.tsx
'use client';

import Image from 'next/image';

const deals = [
  { name: 'Bali', img: '/deals/bali.jpg' },
  { name: 'Tokyo', img: '/deals/tokyo.jpg' },
  { name: 'Paris', img: '/deals/paris.jpg' },
  { name: 'London', img: '/deals/london.jpg' },
  { name: 'New York', img: '/deals/newyork.jpg' },
  { name: 'Sydney', img: '/deals/sydney.jpg' },
];

export default function DealsOfTheWeek() {
  return (
    <section className="py-12 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">
          Deals of the Week
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal) => (
            <div
              key={deal.name}
              className="overflow-hidden rounded-lg shadow hover:shadow-lg transition-shadow duration-300"
            >
              <Image
                src={deal.img}
                alt={deal.name}
                width={600}
                height={400}
                className="object-cover w-full h-48"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{deal.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
